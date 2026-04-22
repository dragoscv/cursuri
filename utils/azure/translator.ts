/**
 * Azure OpenAI translation helpers — translate lesson + course content
 * (titles, descriptions, summaries, key points, transcriptions, WEBVTT
 * captions) into a target locale via the existing Azure OpenAI deployment.
 *
 * Reuses the same env vars as `summarizeTranscript`/`generateLessonField`:
 *   AZURE_OPENAI_ENDPOINT
 *   AZURE_OPENAI_API_KEY
 *   AZURE_OPENAI_DEPLOYMENT     (currently "gpt-4o-mini" → gpt-4.1-mini v2025-04-14)
 *   AZURE_OPENAI_API_VERSION
 *
 * Design notes:
 *   - HTML fields (description, content) are translated as HTML — the model
 *     is instructed to preserve all tags & attributes verbatim and only
 *     translate text nodes.
 *   - VTT captions are translated cue-by-cue in a single batched JSON call
 *     so the timeline is preserved 1:1 and we minimise round-trips.
 *   - Each call returns strict JSON (response_format) so we never have to
 *     post-process markdown fences.
 */

import { getContentLocale } from '@/config/locales';
import type { Course, CourseTranslation, Lesson, LessonTranslation } from '@/types';
import { createHash } from 'crypto';

const DEFAULT_API_VERSION = '2024-10-21';

interface AzureCallOpts {
    messages: Array<{ role: 'system' | 'user'; content: string }>;
    /** Hard cap on output tokens. */
    maxTokens: number;
    /** Translation should be deterministic; default 0.2. */
    temperature?: number;
}

async function callAzure(opts: AzureCallOpts): Promise<{ content: string; model: string }> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;
    if (!endpoint || !apiKey || !deployment) {
        throw new Error(
            'AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT environment variables must be set'
        );
    }

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(
        deployment
    )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
            messages: opts.messages,
            temperature: opts.temperature ?? 0.2,
            max_tokens: opts.maxTokens,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Azure OpenAI translation failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Azure OpenAI returned no content');
    return { content, model: deployment };
}

function languageDisplayName(locale: string): string {
    const cl = getContentLocale(locale);
    return cl ? `${cl.englishName} (${cl.code})` : locale;
}

// ---------------------------------------------------------------------------
// Hashing — used to mark translations as `outdated` when source changes.
// ---------------------------------------------------------------------------

export function hashLessonSource(input: {
    name?: string;
    description?: string;
    content?: string;
    summary?: string;
    keyPoints?: string[];
    transcription?: string;
    objectives?: string[];
    tags?: string[];
}): string {
    const payload = JSON.stringify({
        n: input.name || '',
        d: input.description || '',
        c: input.content || '',
        s: input.summary || '',
        k: input.keyPoints || [],
        t: input.transcription || '',
        o: input.objectives || [],
        g: input.tags || [],
    });
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

export function hashCourseSource(input: {
    name?: string;
    description?: string;
    fullDescription?: string;
    benefits?: string[];
    objectives?: string[];
    requirements?: string[];
    tags?: string[];
}): string {
    const payload = JSON.stringify({
        n: input.name || '',
        d: input.description || '',
        f: input.fullDescription || '',
        b: input.benefits || [],
        o: input.objectives || [],
        r: input.requirements || [],
        g: input.tags || [],
    });
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Lesson content translator
// ---------------------------------------------------------------------------

/** Truncate huge transcripts for translation requests. */
const MAX_TRANSCRIPT_CHARS_FOR_TRANSLATION = 18_000;

export interface TranslateLessonOpts {
    lesson: Pick<
        Lesson,
        'name' | 'description' | 'content' | 'summary' | 'keyPoints' | 'transcription'
    > & {
        objectives?: string[];
        tags?: string[];
    };
    targetLocale: string;
    sourceLocale?: string;
    /** Optional course title used as glossary context. */
    courseName?: string;
}

export async function translateLesson(opts: TranslateLessonOpts): Promise<LessonTranslation> {
    const { lesson, targetLocale } = opts;
    const targetName = languageDisplayName(targetLocale);
    const sourceName = opts.sourceLocale ? languageDisplayName(opts.sourceLocale) : 'auto-detected language';

    const transcript =
        lesson.transcription && lesson.transcription.length > MAX_TRANSCRIPT_CHARS_FOR_TRANSLATION
            ? lesson.transcription.slice(0, MAX_TRANSCRIPT_CHARS_FOR_TRANSLATION) + '\n[truncated]'
            : lesson.transcription || '';

    const payload = {
        name: lesson.name || '',
        description: lesson.description || '',
        content: lesson.content || '',
        summary: lesson.summary || '',
        keyPoints: lesson.keyPoints || [],
        transcription: transcript,
        objectives: lesson.objectives || [],
        tags: lesson.tags || [],
    };

    const messages: AzureCallOpts['messages'] = [
        {
            role: 'system',
            content:
                'You are a professional translator specialising in technical e-learning content (programming, AI, web development, devops). You translate every field of the input JSON into the target language while preserving meaning, tone, and structure. ' +
                'Critical rules:\n' +
                '1. Preserve ALL HTML tags, attributes and inline code (`<code>`, `<pre>`) verbatim — translate only text nodes.\n' +
                '2. Do NOT translate identifiers, code symbols, file names, URLs, brand names, library names, CLI commands or environment variable names.\n' +
                '3. Keep markdown / HTML structure (paragraphs, lists, headings) identical.\n' +
                '4. Never invent new content. If a source field is empty, leave the translated field empty.\n' +
                '5. Reply with strict JSON only — no markdown fences, no preamble.',
        },
        {
            role: 'user',
            content:
                `Source language: ${sourceName}\n` +
                `Target language: ${targetName}\n` +
                (opts.courseName ? `Course context: ${opts.courseName}\n` : '') +
                `\nTranslate every field of this JSON into the target language. Output JSON with the EXACT same shape and keys.\n\n` +
                'Input JSON:\n' +
                '```json\n' +
                JSON.stringify(payload, null, 2) +
                '\n```\n\n' +
                'Return JSON with this shape:\n' +
                '{ "name": "...", "description": "...", "content": "...", "summary": "...", "keyPoints": ["..."], "transcription": "...", "objectives": ["..."], "tags": ["..."] }',
        },
    ];

    const { content, model } = await callAzure({ messages, maxTokens: 8000, temperature: 0.2 });

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error(`Translator returned non-JSON content for ${targetLocale}`);
    }

    const stringField = (k: string): string | undefined => {
        const v = parsed[k];
        return typeof v === 'string' ? v : undefined;
    };
    const arrayField = (k: string): string[] | undefined => {
        const v = parsed[k];
        return Array.isArray(v)
            ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())
            : undefined;
    };

    return {
        name: stringField('name'),
        description: stringField('description'),
        content: stringField('content'),
        summary: stringField('summary'),
        keyPoints: arrayField('keyPoints'),
        transcription: stringField('transcription'),
        objectives: arrayField('objectives'),
        tags: arrayField('tags'),
        status: 'complete',
        sourceHash: hashLessonSource({
            name: lesson.name,
            description: lesson.description,
            content: lesson.content,
            summary: lesson.summary,
            keyPoints: lesson.keyPoints,
            transcription: lesson.transcription,
            objectives: lesson.objectives,
            tags: lesson.tags,
        }),
        translatedAt: Date.now(),
        model,
        sourceLocale: opts.sourceLocale,
    };
}

// ---------------------------------------------------------------------------
// Course content translator
// ---------------------------------------------------------------------------

export interface TranslateCourseOpts {
    course: Pick<Course, 'name' | 'description' | 'tags' | 'requirements'> & {
        fullDescription?: string;
        benefits?: string[];
        objectives?: string[];
    };
    targetLocale: string;
    sourceLocale?: string;
}

export async function translateCourse(opts: TranslateCourseOpts): Promise<CourseTranslation> {
    const { course, targetLocale } = opts;
    const targetName = languageDisplayName(targetLocale);
    const sourceName = opts.sourceLocale ? languageDisplayName(opts.sourceLocale) : 'auto-detected language';

    const payload = {
        name: course.name || '',
        description: course.description || '',
        fullDescription: course.fullDescription || '',
        benefits: course.benefits || [],
        objectives: course.objectives || [],
        requirements: course.requirements || [],
        tags: course.tags || [],
    };

    const messages: AzureCallOpts['messages'] = [
        {
            role: 'system',
            content:
                'You are a professional translator specialising in marketing copy for technical online courses. You translate every field while preserving meaning, marketing tone, and HTML structure. ' +
                'Critical rules:\n' +
                '1. Preserve ALL HTML tags and attributes verbatim — translate only text nodes.\n' +
                '2. Do NOT translate brand names, technology names, library names, CLI commands or code snippets.\n' +
                '3. Keep paragraph and list structure identical.\n' +
                '4. Reply with strict JSON only — no markdown fences, no preamble.',
        },
        {
            role: 'user',
            content:
                `Source language: ${sourceName}\n` +
                `Target language: ${targetName}\n\n` +
                'Translate every field of this JSON into the target language. Output JSON with the EXACT same shape and keys.\n\n' +
                'Input JSON:\n' +
                '```json\n' +
                JSON.stringify(payload, null, 2) +
                '\n```\n\n' +
                'Return JSON with this shape:\n' +
                '{ "name": "...", "description": "...", "fullDescription": "...", "benefits": ["..."], "objectives": ["..."], "requirements": ["..."], "tags": ["..."] }',
        },
    ];

    const { content, model } = await callAzure({ messages, maxTokens: 4000, temperature: 0.2 });

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error(`Translator returned non-JSON content for ${targetLocale}`);
    }

    const stringField = (k: string): string | undefined => {
        const v = parsed[k];
        return typeof v === 'string' ? v : undefined;
    };
    const arrayField = (k: string): string[] | undefined => {
        const v = parsed[k];
        return Array.isArray(v)
            ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())
            : undefined;
    };

    return {
        name: stringField('name'),
        description: stringField('description'),
        fullDescription: stringField('fullDescription'),
        benefits: arrayField('benefits'),
        objectives: arrayField('objectives'),
        requirements: arrayField('requirements'),
        tags: arrayField('tags'),
        status: 'complete',
        sourceHash: hashCourseSource({
            name: course.name,
            description: course.description,
            fullDescription: course.fullDescription,
            benefits: course.benefits,
            objectives: course.objectives,
            requirements: course.requirements,
            tags: course.tags,
        }),
        translatedAt: Date.now(),
        model,
        sourceLocale: opts.sourceLocale,
    };
}

// ---------------------------------------------------------------------------
// WEBVTT translator — preserves cue timestamps and only translates text.
// ---------------------------------------------------------------------------

interface VttCue {
    /** Optional cue identifier line (numeric or string). */
    identifier?: string;
    /** Raw timing line, e.g. "00:00:01.000 --> 00:00:04.500" plus optional settings. */
    timing: string;
    /** Cue text payload (may contain newlines). */
    text: string;
}

export interface ParsedVtt {
    header: string[];
    cues: VttCue[];
}

const TIMING_RE = /^\d{2}:\d{2}(?::\d{2})?\.\d{3}\s+-->\s+\d{2}:\d{2}(?::\d{2})?\.\d{3}/;

export function parseVtt(vtt: string): ParsedVtt {
    const lines = vtt.replace(/\r\n/g, '\n').split('\n');
    const header: string[] = [];
    const cues: VttCue[] = [];

    let i = 0;
    // Header: everything up to the first blank line that precedes a timing.
    while (i < lines.length) {
        const line = lines[i];
        // Stop at the first cue (timing line, optionally preceded by an identifier).
        if (TIMING_RE.test(line) || (lines[i + 1] && TIMING_RE.test(lines[i + 1]))) {
            break;
        }
        header.push(line);
        i++;
    }

    while (i < lines.length) {
        // Skip blank lines between cues.
        while (i < lines.length && lines[i].trim() === '') i++;
        if (i >= lines.length) break;

        let identifier: string | undefined;
        let timingLine = lines[i];
        if (!TIMING_RE.test(timingLine)) {
            // The current line is an identifier; timing is the next line.
            identifier = timingLine.trim();
            i++;
            timingLine = lines[i];
            if (!TIMING_RE.test(timingLine || '')) {
                // Malformed cue — skip.
                i++;
                continue;
            }
        }
        i++; // consume timing line

        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
            textLines.push(lines[i]);
            i++;
        }
        cues.push({ identifier, timing: timingLine, text: textLines.join('\n') });
    }
    return { header, cues };
}

export function serializeVtt(parsed: ParsedVtt): string {
    const out: string[] = [];
    if (parsed.header.length === 0 || !/^WEBVTT/.test(parsed.header[0] || '')) {
        out.push('WEBVTT');
    }
    out.push(...parsed.header);
    if (out[out.length - 1] !== '') out.push('');
    for (const cue of parsed.cues) {
        if (cue.identifier) out.push(cue.identifier);
        out.push(cue.timing);
        out.push(cue.text);
        out.push('');
    }
    return out.join('\n');
}

const VTT_BATCH_SIZE = 80; // ~80 cues per request keeps prompts under context limits

export interface TranslateVttOpts {
    vttContent: string;
    targetLocale: string;
    sourceLocale?: string;
    /** Optional progress callback after each batch. */
    onBatchTranslated?: (batchIndex: number, totalBatches: number) => void;
}

export async function translateVtt(opts: TranslateVttOpts): Promise<string> {
    const parsed = parseVtt(opts.vttContent);
    if (parsed.cues.length === 0) return opts.vttContent;

    const targetName = languageDisplayName(opts.targetLocale);
    const sourceName = opts.sourceLocale ? languageDisplayName(opts.sourceLocale) : 'auto-detected language';
    const batches: VttCue[][] = [];
    for (let i = 0; i < parsed.cues.length; i += VTT_BATCH_SIZE) {
        batches.push(parsed.cues.slice(i, i + VTT_BATCH_SIZE));
    }

    const translatedCues: VttCue[] = [];
    for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const texts = batch.map((c) => c.text);

        const messages: AzureCallOpts['messages'] = [
            {
                role: 'system',
                content:
                    'You are a professional subtitle translator. You receive an array of subtitle text segments and return the translated array. ' +
                    'Critical rules:\n' +
                    '1. The output array MUST contain exactly the same number of items as the input, in the SAME order.\n' +
                    '2. Preserve newlines (`\\n`) inside each segment exactly.\n' +
                    '3. Preserve VTT inline tags like <c>, <v Speaker>, <i>, <b> verbatim.\n' +
                    '4. Do NOT translate code identifiers, library names, CLI commands, file names or URLs.\n' +
                    '5. Reply with strict JSON only — no markdown fences.',
            },
            {
                role: 'user',
                content:
                    `Source language: ${sourceName}\n` +
                    `Target language: ${targetName}\n\n` +
                    'Translate each subtitle segment to the target language. Return JSON with shape:\n' +
                    '{ "items": ["translated segment 1", "translated segment 2", ...] }\n\n' +
                    'Input segments:\n' +
                    JSON.stringify({ items: texts }),
            },
        ];

        const { content } = await callAzure({ messages, maxTokens: 6000, temperature: 0.2 });
        let parsedBatch: { items?: unknown };
        try {
            parsedBatch = JSON.parse(content);
        } catch {
            throw new Error(`VTT translator returned non-JSON for batch ${b + 1}`);
        }
        const items = Array.isArray(parsedBatch.items) ? parsedBatch.items : [];
        if (items.length !== batch.length) {
            // Pad with originals to keep timing alignment if model misbehaves.
            for (let k = 0; k < batch.length; k++) {
                translatedCues.push({
                    identifier: batch[k].identifier,
                    timing: batch[k].timing,
                    text: typeof items[k] === 'string' && (items[k] as string).trim().length > 0 ? (items[k] as string) : batch[k].text,
                });
            }
        } else {
            for (let k = 0; k < batch.length; k++) {
                translatedCues.push({
                    identifier: batch[k].identifier,
                    timing: batch[k].timing,
                    text: typeof items[k] === 'string' && (items[k] as string).trim().length > 0 ? (items[k] as string) : batch[k].text,
                });
            }
        }
        opts.onBatchTranslated?.(b + 1, batches.length);
    }

    return serializeVtt({ header: parsed.header, cues: translatedCues });
}

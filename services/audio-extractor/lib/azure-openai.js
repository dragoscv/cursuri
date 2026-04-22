/**
 * Azure OpenAI summarizer (Node.js port of utils/azure/openai.ts summarizeTranscript).
 */

const DEFAULT_API_VERSION = '2024-10-21';
const MAX_TRANSCRIPT_CHARS = 24_000;

function buildPrompt(transcript, lessonTitle, lessonDescription) {
    const truncated = transcript.length > MAX_TRANSCRIPT_CHARS
        ? transcript.slice(0, MAX_TRANSCRIPT_CHARS) + '\n[transcript truncated]'
        : transcript;

    const ctx = [];
    if (lessonTitle) ctx.push(`Lesson title: ${lessonTitle}`);
    if (lessonDescription) ctx.push(`Lesson description: ${lessonDescription}`);

    return [
        {
            role: 'system',
            content:
                'You are an expert learning designer. Read a lesson video transcript and produce a concise study aid for the learner. Always reply with valid JSON matching the requested schema.',
        },
        {
            role: 'user',
            content: `${ctx.join('\n')}

Transcript:
"""
${truncated}
"""

Return JSON with exactly this shape:
{
  "summary": "<2-4 sentence high-level summary, plain prose>",
  "keyPoints": ["<concise takeaway>", "<concise takeaway>", "..."]
}

Rules:
- 4 to 7 key points, each one short sentence (max ~140 chars).
- Match the transcript's language.
- No markdown, no preamble, no code fences. JSON only.`,
        },
    ];
}

export async function summarizeTranscript({ transcript, lessonTitle, lessonDescription }) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

    if (!endpoint || !apiKey || !deployment) {
        throw new Error('AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT must be set');
    }

    if (!transcript || transcript.trim().length < 30) {
        return { summary: '', keyPoints: [], model: deployment };
    }

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    const messages = buildPrompt(transcript, lessonTitle, lessonDescription);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
            messages,
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Azure OpenAI request failed: ${res.status} ${res.statusText} ${text}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Azure OpenAI returned no content');

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { throw new Error(`Azure OpenAI returned non-JSON content: ${content.slice(0, 200)}`); }

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    const keyPoints = Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.filter((p) => typeof p === 'string' && p.trim().length > 0).map((p) => p.trim())
        : [];

    return { summary, keyPoints, model: deployment };
}

/**
 * Generate chapter markers (table of contents) for the lesson from the
 * timed phrases produced by Azure Speech. Returns an array of
 * `{ title, startSeconds, summary? }` chapters covering the full duration.
 *
 * Phrases are downsampled to a compact text outline (`[mm:ss] text…`) so we
 * stay well within token limits even for long lectures.
 */
export async function generateChapters({ phrases, lessonTitle, lessonDescription, totalDurationSeconds }) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

    if (!endpoint || !apiKey || !deployment) {
        throw new Error('AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT must be set');
    }
    if (!Array.isArray(phrases) || phrases.length === 0) return { chapters: [], model: deployment };

    // Build a compact outline: one line per phrase with [mm:ss] prefix.
    const lines = phrases.map((p) => {
        const sec = Math.floor((p.offset || 0) / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}] ${(p.text || '').trim()}`;
    });
    // Cap at ~24k chars of outline.
    const MAX = 24_000;
    let outline = lines.join('\n');
    if (outline.length > MAX) outline = outline.slice(0, MAX) + '\n[transcript truncated]';

    const ctx = [];
    if (lessonTitle) ctx.push(`Lesson title: ${lessonTitle}`);
    if (lessonDescription) ctx.push(`Lesson description: ${lessonDescription}`);
    if (typeof totalDurationSeconds === 'number') ctx.push(`Total duration: ${Math.round(totalDurationSeconds)}s`);

    const messages = [
        {
            role: 'system',
            content:
                'You are an expert learning designer. You receive a lesson transcript broken into timed phrases and produce a clean table of contents (chapter markers) the learner can navigate. Always reply with valid JSON.',
        },
        {
            role: 'user',
            content: `${ctx.join('\n')}

Timed phrases (one per line):
"""
${outline}
"""

Produce a JSON object:
{ "chapters": [ { "title": "<3-7 word chapter title>", "startSeconds": <integer>, "summary": "<one short sentence, optional>" }, ... ] }

Rules:
- Between 4 and 12 chapters total. Fewer for short lessons, more for long ones.
- The first chapter MUST start at 0.
- startSeconds must be strictly increasing and <= totalDurationSeconds.
- Each chapter should mark a meaningful topic shift, not a fixed interval.
- Match the transcript's language for titles and summaries.
- Keep titles short and descriptive (no quotes, no emojis, no numbering prefix).
- No markdown, no preamble, no code fences. JSON only.`,
        },
    ];

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
            messages,
            temperature: 0.2,
            max_tokens: 1200,
            response_format: { type: 'json_object' },
        }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Azure OpenAI chapters request failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return { chapters: [], model: deployment };
    let parsed;
    try { parsed = JSON.parse(content); }
    catch { throw new Error(`Azure OpenAI chapters returned non-JSON: ${content.slice(0, 200)}`); }

    const raw = Array.isArray(parsed.chapters) ? parsed.chapters : [];
    // Sanitize + de-dupe ascending start times.
    let lastStart = -1;
    const chapters = raw
        .map((c, idx) => {
            const start = Math.max(0, Math.round(Number(c.startSeconds) || 0));
            const title = typeof c.title === 'string' ? c.title.trim().slice(0, 120) : '';
            const summary = typeof c.summary === 'string' ? c.summary.trim().slice(0, 280) : undefined;
            if (idx === 0 && start !== 0) return { start: 0, title, summary };
            return { start, title, summary };
        })
        .filter((c) => c.title.length > 0)
        .filter((c) => {
            if (c.start <= lastStart) return false;
            lastStart = c.start;
            return true;
        })
        .map((c) => ({ id: cryptoRandomId(), title: c.title, startSeconds: c.start, ...(c.summary ? { summary: c.summary } : {}) }));

    return { chapters, model: deployment };
}

function cryptoRandomId() {
    // Lightweight ID — UUID would also work; this is fine for chapter rows.
    return 'ch_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

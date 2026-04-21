/**
 * Azure OpenAI / Azure AI Foundry helper for lesson summarization.
 *
 * Uses plain fetch against the Azure OpenAI Chat Completions REST API to
 * avoid pulling in another SDK. Returns a short paragraph summary plus a
 * bullet list of key takeaways.
 *
 * Required env (server-side, all required when summarizing):
 *   AZURE_OPENAI_ENDPOINT       e.g. https://my-resource.openai.azure.com
 *   AZURE_OPENAI_API_KEY
 *   AZURE_OPENAI_DEPLOYMENT     deployment name (e.g. "gpt-4o-mini")
 *   AZURE_OPENAI_API_VERSION    optional, defaults to a recent stable version
 */

export interface LessonSummary {
  summary: string;
  keyPoints: string[];
  model: string;
}

const DEFAULT_API_VERSION = '2024-10-21';

const MAX_TRANSCRIPT_CHARS = 24_000; // Stay well below typical context limits

function buildPrompt(transcript: string, lessonTitle?: string, lessonDescription?: string) {
  const truncated =
    transcript.length > MAX_TRANSCRIPT_CHARS
      ? transcript.slice(0, MAX_TRANSCRIPT_CHARS) + '\n[transcript truncated]'
      : transcript;

  const context: string[] = [];
  if (lessonTitle) context.push(`Lesson title: ${lessonTitle}`);
  if (lessonDescription) context.push(`Lesson description: ${lessonDescription}`);

  return [
    {
      role: 'system' as const,
      content:
        'You are an expert learning designer. Read a lesson video transcript and produce a concise study aid for the learner. Always reply with valid JSON matching the requested schema.',
    },
    {
      role: 'user' as const,
      content: `${context.join('\n')}

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

export async function summarizeTranscript(opts: {
  transcript: string;
  lessonTitle?: string;
  lessonDescription?: string;
}): Promise<LessonSummary> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      'AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT environment variables must be set'
    );
  }

  if (!opts.transcript || opts.transcript.trim().length < 30) {
    return {
      summary: '',
      keyPoints: [],
      model: deployment,
    };
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(
    deployment
  )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

  const messages = buildPrompt(opts.transcript, opts.lessonTitle, opts.lessonDescription);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
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

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Azure OpenAI returned no content');
  }

  let parsed: { summary?: unknown; keyPoints?: unknown };
  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    throw new Error(`Azure OpenAI returned non-JSON content: ${content.slice(0, 200)}`);
  }

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .map((p) => p.trim())
    : [];

  return {
    summary,
    keyPoints,
    model: deployment,
  };
}

// ---------------------------------------------------------------------------
// Generic field generator — used by the magic-wand "AI fill" buttons in the
// admin lesson form. Generates a single value (or list of values) for a
// specific lesson field, grounded in the lesson's transcript + summary.
// ---------------------------------------------------------------------------

export type LessonAiField =
  | 'name'
  | 'description'
  | 'content'
  | 'objectives'
  | 'tags'
  | 'keywords'
  | 'summary';

export interface LessonAiContext {
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  lessonName?: string;
  lessonDescription?: string;
  courseName?: string;
}

export interface LessonAiGenerateResult {
  /** Present when the field expects a single string (name, description, content, summary). */
  value?: string;
  /** Present when the field expects a list (objectives, tags, keywords). */
  values?: string[];
  field: LessonAiField;
  model: string;
}

interface FieldSpec {
  /** True when the field expects a list. */
  isList: boolean;
  /** JSON schema hint sent to the model. */
  schemaDescription: string;
  /** Field-specific instruction added to the user prompt. */
  instruction: string;
  /** Optional output cap. */
  maxTokens: number;
}

const FIELD_SPECS: Record<LessonAiField, FieldSpec> = {
  name: {
    isList: false,
    schemaDescription: '{ "value": "<short lesson title, 4-9 words, no trailing punctuation>" }',
    instruction:
      'Generate a concise, descriptive lesson title. 4-9 words. Plain text, no quotes, no markdown, no trailing punctuation.',
    maxTokens: 80,
  },
  description: {
    isList: false,
    schemaDescription: '{ "value": "<HTML paragraph(s) describing what the lesson covers>" }',
    instruction:
      'Write a short lesson description (2-3 sentences) that explains what the learner will get from this lesson. Output minimal HTML: paragraphs with <p>...</p>, optionally <strong> for emphasis. No headings, no lists, no <html>/<body>.',
    maxTokens: 400,
  },
  content: {
    isList: false,
    schemaDescription: '{ "value": "<rich HTML lesson notes>" }',
    instruction:
      'Write detailed lesson notes/content (the article shown under the video). Use semantic HTML: <h3> for sub-sections, <p> for paragraphs, <ul><li> for lists, <code> for inline code, <pre><code> for code blocks. No <html>/<body>/<head>. Match the transcript language. Aim for 250-700 words.',
    maxTokens: 1800,
  },
  objectives: {
    isList: true,
    schemaDescription: '{ "values": ["<learning objective>", "..."] }',
    instruction:
      'Generate 4-6 learning objectives ("By the end of this lesson the learner will be able to ..."). Each objective is one short sentence (max ~120 chars), starts with an action verb, no numbering, no markdown.',
    maxTokens: 600,
  },
  tags: {
    isList: true,
    schemaDescription: '{ "values": ["<tag>", "..."] }',
    instruction:
      'Generate 5-10 short, lowercase tags relevant to the lesson topic (technologies, concepts, tools). Each tag is 1-3 words, no leading "#", no punctuation.',
    maxTokens: 200,
  },
  keywords: {
    isList: true,
    schemaDescription: '{ "values": ["<seo keyword>", "..."] }',
    instruction:
      'Generate 6-12 SEO keywords / search phrases that prospective learners might type to find this lesson. Mix short single terms with 2-4 word long-tail phrases. Lowercase, no punctuation.',
    maxTokens: 300,
  },
  summary: {
    isList: false,
    schemaDescription: '{ "value": "<2-4 sentence prose summary>" }',
    instruction:
      'Write a 2-4 sentence high-level summary of the lesson. Plain prose, no markdown, no bullet points.',
    maxTokens: 400,
  },
};

const MAX_CONTEXT_CHARS = 18_000;

function buildContextBlock(ctx: LessonAiContext, currentValue?: string): string {
  const parts: string[] = [];
  if (ctx.courseName) parts.push(`Course: ${ctx.courseName}`);
  if (ctx.lessonName) parts.push(`Current lesson title: ${ctx.lessonName}`);
  if (ctx.lessonDescription) parts.push(`Current lesson description: ${ctx.lessonDescription}`);
  if (ctx.summary) parts.push(`Lesson summary:\n${ctx.summary}`);
  if (ctx.keyPoints && ctx.keyPoints.length > 0) {
    parts.push(`Key points:\n- ${ctx.keyPoints.join('\n- ')}`);
  }
  if (ctx.transcript) {
    const truncated =
      ctx.transcript.length > MAX_CONTEXT_CHARS
        ? ctx.transcript.slice(0, MAX_CONTEXT_CHARS) + '\n[transcript truncated]'
        : ctx.transcript;
    parts.push(`Transcript:\n"""\n${truncated}\n"""`);
  }
  if (currentValue && currentValue.trim().length > 0) {
    parts.push(
      `The admin already entered the following draft for this field — improve / expand it rather than discarding it:\n"""\n${currentValue.slice(0, 2000)}\n"""`
    );
  }
  return parts.join('\n\n');
}

export async function generateLessonField(opts: {
  field: LessonAiField;
  context: LessonAiContext;
  currentValue?: string;
  customInstruction?: string;
}): Promise<LessonAiGenerateResult> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      'AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT environment variables must be set'
    );
  }

  const spec = FIELD_SPECS[opts.field];
  if (!spec) throw new Error(`Unknown lesson field: ${opts.field}`);

  const ctx = opts.context || {};
  const hasContext =
    (ctx.transcript && ctx.transcript.trim().length > 30) ||
    (ctx.summary && ctx.summary.trim().length > 30) ||
    (ctx.keyPoints && ctx.keyPoints.length > 0);

  if (!hasContext) {
    throw new Error(
      'No transcription or summary available for this lesson — generate AI assets first.'
    );
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(
    deployment
  )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an expert learning designer assisting an instructor while they author a lesson in an admin form. You are given the lesson video transcript and any existing context. Generate the requested field. Always reply with valid JSON matching the requested schema, in the same language as the transcript.',
    },
    {
      role: 'user' as const,
      content: `${buildContextBlock(ctx, opts.currentValue)}

Task: ${spec.instruction}
${opts.customInstruction ? `\nAdditional instruction from the admin: ${opts.customInstruction}` : ''}

Return JSON with exactly this shape:
${spec.schemaDescription}

Rules:
- Reply with JSON only, no markdown fences, no preamble.
- Match the transcript's language.`,
    },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.4,
      max_tokens: spec.maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI request failed: ${res.status} ${res.statusText} ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Azure OpenAI returned no content');

  let parsed: { value?: unknown; values?: unknown };
  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    throw new Error(`Azure OpenAI returned non-JSON content: ${content.slice(0, 200)}`);
  }

  if (spec.isList) {
    const values = Array.isArray(parsed.values)
      ? parsed.values
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .map((v) => v.trim())
      : [];
    return { field: opts.field, values, model: deployment };
  }

  const value = typeof parsed.value === 'string' ? parsed.value.trim() : '';
  return { field: opts.field, value, model: deployment };
}

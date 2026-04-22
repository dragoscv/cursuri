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

// ---------------------------------------------------------------------------
// COURSE-LEVEL field generator. Uses the SAME Azure OpenAI deployment as the
// lesson generator, but the context is built from ALL lessons of the course
// (transcripts, summaries, key points) so the model has the full picture
// when generating things like the course description, learning objectives or
// SEO keywords.
// ---------------------------------------------------------------------------

export type CourseAiField =
  | 'name'
  | 'description'
  | 'objectives'
  | 'requirements'
  | 'tags'
  | 'categories'
  | 'keywords'
  | 'badges';

export interface CourseLessonContext {
  name?: string;
  description?: string;
  summary?: string;
  keyPoints?: string[];
  transcript?: string;
}

export interface CourseAiContext {
  courseName?: string;
  courseDescription?: string;
  instructorName?: string;
  difficulty?: string;
  duration?: string;
  lessons?: CourseLessonContext[];
}

export interface CourseAiGenerateResult {
  value?: string;
  values?: string[];
  field: CourseAiField;
  model: string;
}

const COURSE_FIELD_SPECS: Record<CourseAiField, FieldSpec> = {
  name: {
    isList: false,
    schemaDescription: '{ "value": "<course title, 4-9 words, no trailing punctuation>" }',
    instruction:
      'Generate a concise, marketable course title that captures the entire program. 4-9 words, plain text, no quotes, no markdown, no trailing punctuation.',
    maxTokens: 80,
  },
  description: {
    isList: false,
    schemaDescription: '{ "value": "<HTML paragraph(s) describing the course>" }',
    instruction:
      'Write a 3-5 sentence course description marketed to a prospective learner. Cover what they will build/learn, who it is for, and the key technologies. Output minimal HTML: paragraphs with <p>...</p>, optionally <strong> for emphasis. No headings, no lists, no <html>/<body>.',
    maxTokens: 600,
  },
  objectives: {
    isList: true,
    schemaDescription: '{ "values": ["<learning outcome>", "..."] }',
    instruction:
      'Generate 5-8 course-level learning outcomes (what the learner will be able to do after completing ALL lessons). Each one short sentence (max ~140 chars), starting with an action verb (Build, Deploy, Understand, Implement…). No numbering, no markdown.',
    maxTokens: 800,
  },
  requirements: {
    isList: true,
    schemaDescription: '{ "values": ["<prerequisite skill or tool>", "..."] }',
    instruction:
      'Generate 3-6 course prerequisites (what the learner needs to know or have installed BEFORE starting). Each one short phrase or sentence (max ~120 chars). Mix knowledge prerequisites with concrete tooling. No numbering, no markdown.',
    maxTokens: 500,
  },
  tags: {
    isList: true,
    schemaDescription: '{ "values": ["<tag>", "..."] }',
    instruction:
      'Generate 6-12 short, lowercase tags relevant to the entire course (technologies, frameworks, concepts). Each tag is 1-3 words, no leading "#", no punctuation.',
    maxTokens: 250,
  },
  categories: {
    isList: true,
    schemaDescription: '{ "values": ["<category>", "..."] }',
    instruction:
      'Generate 1-3 high-level categories the course belongs to (e.g. "Web Development", "AI", "DevOps"). Title case, no punctuation.',
    maxTokens: 150,
  },
  keywords: {
    isList: true,
    schemaDescription: '{ "values": ["<seo keyword>", "..."] }',
    instruction:
      'Generate 8-15 SEO keywords / search phrases prospective learners might type to find this course. Mix short single terms with 2-5 word long-tail phrases. Lowercase, no punctuation.',
    maxTokens: 400,
  },
  badges: {
    isList: true,
    schemaDescription: '{ "values": ["<short badge label>", "..."] }',
    instruction:
      'Generate 1-3 short marketing badge labels for the course based on its content (e.g. "Beginner Friendly", "Project Based", "AI Powered", "Hands-On"). Title Case, max 3 words each.',
    maxTokens: 120,
  },
};

const MAX_PER_LESSON_TRANSCRIPT_CHARS = 2_000;
const MAX_TOTAL_CONTEXT_CHARS = 28_000;

function buildCourseContextBlock(ctx: CourseAiContext, currentValue?: string): string {
  const parts: string[] = [];
  if (ctx.courseName) parts.push(`Course title: ${ctx.courseName}`);
  if (ctx.courseDescription) parts.push(`Current course description: ${ctx.courseDescription}`);
  if (ctx.instructorName) parts.push(`Instructor: ${ctx.instructorName}`);
  if (ctx.difficulty) parts.push(`Difficulty: ${ctx.difficulty}`);
  if (ctx.duration) parts.push(`Duration: ${ctx.duration}`);

  const lessons = ctx.lessons || [];
  if (lessons.length > 0) {
    const lessonBlocks: string[] = [];
    let total = 0;
    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const block: string[] = [`### Lesson ${i + 1}: ${l.name || '(untitled)'}`];
      if (l.description) block.push(`Description: ${l.description}`);
      if (l.summary) block.push(`Summary: ${l.summary}`);
      if (l.keyPoints && l.keyPoints.length > 0) {
        block.push(`Key points:\n- ${l.keyPoints.join('\n- ')}`);
      }
      if (l.transcript) {
        const t = l.transcript.length > MAX_PER_LESSON_TRANSCRIPT_CHARS
          ? l.transcript.slice(0, MAX_PER_LESSON_TRANSCRIPT_CHARS) + '\n[truncated]'
          : l.transcript;
        block.push(`Transcript excerpt:\n${t}`);
      }
      const text = block.join('\n');
      if (total + text.length > MAX_TOTAL_CONTEXT_CHARS) {
        lessonBlocks.push(`### Lesson ${i + 1}: ${l.name || '(untitled)'}\n[further lessons truncated]`);
        break;
      }
      lessonBlocks.push(text);
      total += text.length;
    }
    parts.push(`Lessons (${lessons.length} total):\n\n${lessonBlocks.join('\n\n')}`);
  }

  if (currentValue && currentValue.trim().length > 0) {
    parts.push(
      `The admin already entered the following draft for this field — improve / expand it rather than discarding it:\n"""\n${currentValue.slice(0, 2000)}\n"""`
    );
  }
  return parts.join('\n\n');
}

export async function generateCourseField(opts: {
  field: CourseAiField;
  context: CourseAiContext;
  currentValue?: string;
  customInstruction?: string;
}): Promise<CourseAiGenerateResult> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      'AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT environment variables must be set'
    );
  }
  const spec = COURSE_FIELD_SPECS[opts.field];
  if (!spec) throw new Error(`Unknown course field: ${opts.field}`);

  const ctx = opts.context || {};
  const hasContext =
    (ctx.lessons && ctx.lessons.length > 0) ||
    !!ctx.courseDescription ||
    !!ctx.courseName;
  if (!hasContext) {
    throw new Error('Add at least a course title or one lesson before using AI fill.');
  }

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(
    deployment
  )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an expert course designer and marketer assisting an instructor while they author a paid online course in an admin form. You receive ALL of the course\'s lessons (titles, descriptions, summaries, key points and transcript excerpts). Generate the requested course-level field grounded in this material. Always reply with valid JSON matching the requested schema, in the same language as the lessons.',
    },
    {
      role: 'user' as const,
      content: `${buildCourseContextBlock(ctx, opts.currentValue)}

Task: ${spec.instruction}
${opts.customInstruction ? `\nAdditional instruction from the admin: ${opts.customInstruction}` : ''}

Return JSON with exactly this shape:
${spec.schemaDescription}

Rules:
- Reply with JSON only, no markdown fences, no preamble.
- Match the dominant language of the lesson context.`,
    },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      messages,
      temperature: 0.5,
      max_tokens: spec.maxTokens,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI request failed: ${res.status} ${res.statusText} ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Azure OpenAI returned no content');

  let parsed: { value?: unknown; values?: unknown };
  try { parsed = JSON.parse(content) as typeof parsed; }
  catch { throw new Error(`Azure OpenAI returned non-JSON content: ${content.slice(0, 200)}`); }

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

// ---------------------------------------------------------------------------
// Course COVER IMAGE generation. Two-step:
//   1) chat-completion writes a vivid art-direction prompt from course context
//   2) Azure OpenAI Images API renders the image with `gpt-image-1`
// Returns the raw bytes (Buffer) and chosen prompt; the caller is expected to
// upload the bytes to Firebase Storage.
// ---------------------------------------------------------------------------

const IMAGE_API_VERSION = process.env.AZURE_OPENAI_IMAGE_API_VERSION || '2025-04-01-preview';

export interface CourseImagePromptInput {
  courseName?: string;
  courseDescription?: string;
  difficulty?: string;
  tags?: string[];
  /** Lesson titles + summaries are usually enough to characterize the course. */
  lessons?: { name?: string; summary?: string }[];
  /** Optional admin-supplied art direction (e.g. "isometric", "cyberpunk", "pastel"). */
  customStyle?: string;
}

/** Asks the chat model to write a single high-quality image prompt. */
export async function generateCourseImagePrompt(input: CourseImagePromptInput): Promise<{ prompt: string; model: string }> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;
  if (!endpoint || !apiKey || !deployment) {
    throw new Error('AZURE_OPENAI_ENDPOINT / API_KEY / DEPLOYMENT must be set');
  }

  const lessonOutline = (input.lessons || [])
    .slice(0, 25)
    .map((l, i) => `${i + 1}. ${l.name || ''}${l.summary ? ' — ' + l.summary.slice(0, 200) : ''}`)
    .join('\n');

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an art director for a premium online-learning platform. Given course information, write a single concise image prompt (max ~90 words) for an AI image model that will produce the course cover thumbnail. The image MUST: be a clean, modern, visually striking illustration that conveys the topic; have a 16:9 aspect; favor a tech-forward gradient background (deep purples, blues, teals, occasional warm accents); avoid any human faces (use silhouettes or stylized figures only); avoid trademarked logos and copyrighted material; avoid any text, words, letters, numbers, captions, watermarks; use depth, lighting and a focal subject related to the course. Always reply with valid JSON.',
    },
    {
      role: 'user' as const,
      content: `Course title: ${input.courseName || '(untitled)'}
${input.courseDescription ? 'Description: ' + input.courseDescription : ''}
${input.difficulty ? 'Difficulty: ' + input.difficulty : ''}
${input.tags && input.tags.length ? 'Tags: ' + input.tags.join(', ') : ''}
${input.customStyle ? 'Admin art direction: ' + input.customStyle : ''}

${lessonOutline ? 'Lesson outline:\n' + lessonOutline : ''}

Return JSON: { "prompt": "<single self-contained image prompt, no quotes inside, no leading 'A photo of'>" }`,
    },
  ];

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      messages,
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Image-prompt generation failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content?.trim() || '';
  let prompt = '';
  try { prompt = String((JSON.parse(content) as { prompt?: string }).prompt || '').trim(); }
  catch { prompt = content; }
  if (!prompt) throw new Error('Image-prompt generation returned empty prompt');
  return { prompt, model: deployment };
}

export interface CourseImageResult {
  bytes: Buffer;
  contentType: string;
  prompt: string;
  size: string;
  model: string;
}

/** Calls Azure OpenAI Images API to render a course cover image. */
export async function generateCourseImage(opts: {
  prompt: string;
  /** Pixel size: 1024x1024 (square), 1536x1024 (landscape), 1024x1536 (portrait). gpt-image-1 supports these. */
  size?: '1024x1024' | '1536x1024' | '1024x1536';
  /** 'low' | 'medium' | 'high' | 'auto' — gpt-image-1 quality knob. */
  quality?: 'low' | 'medium' | 'high' | 'auto';
}): Promise<CourseImageResult> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const imageDeployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;
  if (!endpoint || !apiKey || !imageDeployment) {
    throw new Error('AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_IMAGE_DEPLOYMENT must be set');
  }
  const size = opts.size || '1536x1024';   // landscape for course cards
  const quality = opts.quality || 'high';
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(imageDeployment)}/images/generations?api-version=${encodeURIComponent(IMAGE_API_VERSION)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      prompt: opts.prompt,
      n: 1,
      size,
      quality,
      output_format: 'png',
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Image generation failed: ${res.status} ${res.statusText} ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }>; };
  const item = json.data?.[0];
  if (!item) throw new Error('Image generation returned no data');

  let bytes: Buffer;
  if (item.b64_json) {
    bytes = Buffer.from(item.b64_json, 'base64');
  } else if (item.url) {
    const r = await fetch(item.url);
    if (!r.ok) throw new Error(`Failed to fetch generated image URL: ${r.status}`);
    const ab = await r.arrayBuffer();
    bytes = Buffer.from(ab);
  } else {
    throw new Error('Image generation response had neither b64_json nor url');
  }

  return { bytes, contentType: 'image/png', prompt: opts.prompt, size, model: imageDeployment };
}

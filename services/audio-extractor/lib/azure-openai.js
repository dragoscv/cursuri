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

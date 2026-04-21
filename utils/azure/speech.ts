/**
 * Azure AI Speech — Fast Transcription REST API.
 *
 * Endpoint:
 *   POST https://{region}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe
 *     ?api-version=2025-10-15
 *
 * Multipart/form-data body:
 *   - audio: the audio file (MP3, WAV, OGG, FLAC, …)
 *   - definition: JSON string with at least { "locales": ["en-US"] }
 *
 * Fast Transcription is up to ~40× real-time and is synchronous (one HTTP
 * call returns the full transcript with phrase- and word-level offsets), so a
 * 60-minute lesson typically completes in 1–3 minutes instead of an hour.
 *
 * Required env (server-side):
 *   AZURE_SPEECH_KEY
 *   AZURE_SPEECH_REGION
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RecognizedPhrase {
    text: string;
    /** ms */
    offset: number;
    /** ms */
    duration: number;
    locale?: string;
    speaker?: number;
}

export interface TranscriptionResult {
    transcript: string;
    vtt: string;
    phrases: RecognizedPhrase[];
    language: string;
    durationMs?: number;
}

function formatVttTimestamp(ms: number): string {
    const hours = Math.floor(ms / 3_600_000);
    const mins = Math.floor((ms % 3_600_000) / 60_000);
    const secs = Math.floor((ms % 60_000) / 1000);
    const millis = ms % 1000;
    const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}.${pad(millis, 3)}`;
}

function buildVtt(phrases: RecognizedPhrase[]): string {
    const cues = phrases
        .filter((p) => p.text.trim().length > 0)
        .map((p, i) => {
            const start = formatVttTimestamp(p.offset);
            const end = formatVttTimestamp(p.offset + Math.max(p.duration, 1000));
            const speakerPrefix = typeof p.speaker === 'number' ? `<v Speaker ${p.speaker}>` : '';
            return `${i + 1}\n${start} --> ${end}\n${speakerPrefix}${p.text.trim()}\n`;
        });
    return ['WEBVTT', '', ...cues].join('\n');
}

const LOCALE_FALLBACK: Record<string, string> = {
    en: 'en-US',
    ro: 'ro-RO',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    nl: 'nl-NL',
    ru: 'ru-RU',
    pl: 'pl-PL',
    ja: 'ja-JP',
    zh: 'zh-CN',
};

function normalizeLocale(input: string | undefined): string {
    const raw = (input || '').trim();
    if (!raw) return 'en-US';
    if (/^[a-z]{2,3}-[A-Z0-9]{2,4}$/.test(raw)) return raw;
    const lower = raw.toLowerCase();
    if (LOCALE_FALLBACK[lower]) return LOCALE_FALLBACK[lower];
    const m = lower.match(/^([a-z]{2,3})-([a-z0-9]{2,4})$/);
    if (m) return `${m[1]}-${m[2].toUpperCase()}`;
    return 'en-US';
}

interface FastTranscriptionResponse {
    durationMilliseconds?: number;
    combinedPhrases?: { channel?: number; text: string }[];
    phrases?: {
        channel?: number;
        speaker?: number;
        offsetMilliseconds: number;
        durationMilliseconds: number;
        text: string;
        locale?: string;
        confidence?: number;
        words?: { text: string; offsetMilliseconds: number; durationMilliseconds: number }[];
    }[];
}

/**
 * Calls the Fast Transcription REST API with the given audio file.
 *
 * The audio file can be any format the API accepts (we typically pass the
 * 96 kbps MP3 we already produce for the public lesson page, which keeps the
 * upload tiny — roughly 30 MB for a one-hour lesson).
 */
export async function transcribeAudioFile(
    audioPath: string,
    language: string = 'en-US',
    options: { profanityFilter?: 'None' | 'Masked' | 'Removed' | 'Tags' } = {}
): Promise<TranscriptionResult> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
        throw new Error(
            'AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables must be set'
        );
    }

    const normalizedLocale = normalizeLocale(language);
    const apiVersion = process.env.AZURE_SPEECH_FAST_API_VERSION || '2025-10-15';
    const endpoint = `https://${region}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=${apiVersion}`;

    // Stream the file from disk into a Blob/File for fetch's multipart body.
    // Node 20+ supports `Blob` and `FormData` natively.
    const stat = await fs.promises.stat(audioPath);
    const buf = await fs.promises.readFile(audioPath);
    const ext = path.extname(audioPath).toLowerCase();
    const mime =
        ext === '.mp3'
            ? 'audio/mpeg'
            : ext === '.wav'
                ? 'audio/wav'
                : ext === '.ogg'
                    ? 'audio/ogg'
                    : ext === '.flac'
                        ? 'audio/flac'
                        : 'application/octet-stream';

    const audioBlob = new Blob([new Uint8Array(buf)], { type: mime });

    const definition: Record<string, unknown> = {
        locales: [normalizedLocale],
        profanityFilterMode: options.profanityFilter || 'Masked',
    };

    const form = new FormData();
    form.append('audio', audioBlob, path.basename(audioPath));
    form.append('definition', JSON.stringify(definition));

    console.log(
        `[fast-transcription] POST ${endpoint} (${(stat.size / (1024 * 1024)).toFixed(1)} MB, locale=${normalizedLocale})`
    );

    const started = Date.now();
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': key,
            // Do NOT set Content-Type — fetch sets the multipart boundary.
        },
        body: form,
    });
    const elapsedMs = Date.now() - started;

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
            `Azure Fast Transcription failed (${res.status} ${res.statusText}, locale=${normalizedLocale}, ${(stat.size / (1024 * 1024)).toFixed(1)} MB, ${elapsedMs}ms): ${text.slice(0, 500)}`
        );
    }

    const data = (await res.json()) as FastTranscriptionResponse;

    const phrases: RecognizedPhrase[] = (data.phrases || []).map((p) => ({
        text: p.text,
        offset: p.offsetMilliseconds,
        duration: p.durationMilliseconds,
        locale: p.locale,
        speaker: p.speaker,
    }));

    const combined =
        data.combinedPhrases && data.combinedPhrases.length > 0
            ? data.combinedPhrases.map((c) => c.text).join('\n\n')
            : phrases
                .map((p) => p.text.trim())
                .filter(Boolean)
                .join(' ');

    console.log(
        `[fast-transcription] ok in ${elapsedMs}ms — ${phrases.length} phrases, ${combined.length} chars, audio ${data.durationMilliseconds ?? '?'}ms`
    );

    return {
        transcript: combined,
        vtt: buildVtt(phrases),
        phrases,
        language: normalizedLocale,
        durationMs: data.durationMilliseconds,
    };
}

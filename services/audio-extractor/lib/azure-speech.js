/**
 * Azure AI Speech — Fast Transcription REST API client (Node.js port).
 *
 * Identical contract to utils/azure/speech.ts in the main app.
 */

import fs from 'node:fs';
import path from 'node:path';

const LOCALE_FALLBACK = {
    en: 'en-US', ro: 'ro-RO', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL', ru: 'ru-RU', pl: 'pl-PL',
    ja: 'ja-JP', zh: 'zh-CN',
};

function normalizeLocale(input) {
    const raw = (input || '').trim();
    if (!raw) return 'en-US';
    if (/^[a-z]{2,3}-[A-Z0-9]{2,4}$/.test(raw)) return raw;
    const lower = raw.toLowerCase();
    if (LOCALE_FALLBACK[lower]) return LOCALE_FALLBACK[lower];
    const m = lower.match(/^([a-z]{2,3})-([a-z0-9]{2,4})$/);
    if (m) return `${m[1]}-${m[2].toUpperCase()}`;
    return 'en-US';
}

function pad(n, w = 2) { return String(n).padStart(w, '0'); }
function formatVttTimestamp(ms) {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const ms3 = ms % 1000;
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms3, 3)}`;
}

function buildVtt(phrases) {
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

export async function transcribeAudioFile(audioPath, language = 'en-US', options = {}) {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) {
        throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION env vars must be set');
    }

    const normalizedLocale = normalizeLocale(language);
    const apiVersion = process.env.AZURE_SPEECH_FAST_API_VERSION || '2025-10-15';
    const endpoint = `https://${region}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=${apiVersion}`;

    const stat = await fs.promises.stat(audioPath);
    const buf = await fs.promises.readFile(audioPath);
    const ext = path.extname(audioPath).toLowerCase();
    const mime =
        ext === '.mp3' ? 'audio/mpeg' :
        ext === '.wav' ? 'audio/wav' :
        ext === '.ogg' ? 'audio/ogg' :
        ext === '.flac' ? 'audio/flac' :
        'application/octet-stream';

    const audioBlob = new Blob([new Uint8Array(buf)], { type: mime });
    const definition = {
        locales: [normalizedLocale],
        profanityFilterMode: options.profanityFilter || 'Masked',
    };

    const form = new FormData();
    form.append('audio', audioBlob, path.basename(audioPath));
    form.append('definition', JSON.stringify(definition));

    console.log(`[fast-transcription] POST ${endpoint} (${(stat.size / 1024 / 1024).toFixed(1)} MB, locale=${normalizedLocale})`);
    const started = Date.now();
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key },
        body: form,
        signal: options.signal,
    });
    const elapsedMs = Date.now() - started;

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Azure Fast Transcription failed (${res.status} ${res.statusText}, ${elapsedMs}ms): ${text.slice(0, 500)}`);
    }

    const data = await res.json();
    const phrases = (data.phrases || []).map((p) => ({
        text: p.text,
        offset: p.offsetMilliseconds,
        duration: p.durationMilliseconds,
        locale: p.locale,
        speaker: p.speaker,
    }));
    const combined = data.combinedPhrases?.length
        ? data.combinedPhrases.map((c) => c.text).join('\n\n')
        : phrases.map((p) => p.text.trim()).filter(Boolean).join(' ');

    console.log(`[fast-transcription] ok in ${elapsedMs}ms — ${phrases.length} phrases, ${combined.length} chars`);

    return {
        transcript: combined,
        vtt: buildVtt(phrases),
        phrases,
        language: normalizedLocale,
        durationMs: data.durationMilliseconds,
    };
}

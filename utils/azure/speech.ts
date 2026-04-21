/**
 * Azure Speech-to-Text helper.
 *
 * Uses microsoft-cognitiveservices-speech-sdk to run continuous speech
 * recognition on a 16kHz mono PCM WAV file, then assembles a WEBVTT subtitle
 * track plus a flat transcript string from the recognized phrases.
 *
 * For very long lessons (multi-GB videos → potentially hundreds of MB of WAV)
 * we read the WAV from disk via a streaming Node ReadStream and feed the raw
 * PCM samples into a PushAudioInputStream so we never hold the whole audio in
 * memory.
 *
 * Required env (server-side):
 *   AZURE_SPEECH_KEY
 *   AZURE_SPEECH_REGION
 */

import * as fs from 'fs';

export interface RecognizedPhrase {
    text: string;
    /** ms */
    offset: number;
    /** ms */
    duration: number;
}

export interface TranscriptionResult {
    transcript: string;
    vtt: string;
    phrases: RecognizedPhrase[];
    language: string;
}

export interface TranscribeOptions {
    /**
     * Called as transcription progresses. `chars` is the running total of
     * recognized characters (final phrases only); `partial` is the latest
     * in-flight hypothesis (may be empty). Throttle yourself.
     */
    onProgress?: (info: { chars: number; phrases: number; partial?: string }) => void;
}

function ticksToMs(ticks: number): number {
    // Azure returns durations/offsets in 100-nanosecond ticks
    return Math.round(ticks / 10_000);
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
            return `${i + 1}\n${start} --> ${end}\n${p.text.trim()}\n`;
        });
    return ['WEBVTT', '', ...cues].join('\n');
}

// Azure Speech only accepts a small set of locale codes. Normalize loose
// inputs (e.g. "ro", "en") so we never get back the dreaded
// "Invalid 'language' query parameter" 1007 error.
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
    // Already a full BCP-47 locale like "ro-RO".
    if (/^[a-z]{2,3}-[A-Z0-9]{2,4}$/.test(raw)) return raw;
    const lower = raw.toLowerCase();
    if (LOCALE_FALLBACK[lower]) return LOCALE_FALLBACK[lower];
    // Last resort: capitalize tail if user typed "ro-ro".
    const m = lower.match(/^([a-z]{2,3})-([a-z0-9]{2,4})$/);
    if (m) return `${m[1]}-${m[2].toUpperCase()}`;
    return 'en-US';
}

/**
 * Streams a 16kHz mono PCM WAV file into Azure Speech via PushAudioInputStream
 * so we don't allocate a huge Node Buffer for long lessons.
 */
export async function transcribeWavFile(
    wavPath: string,
    language: string = 'en-US',
    options: TranscribeOptions = {}
): Promise<TranscriptionResult> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
        throw new Error(
            'AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables must be set'
        );
    }

    const normalizedLocale = normalizeLocale(language);

    // Lazy import so the SDK never gets bundled with edge/middleware paths.
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = normalizedLocale;
    // Get phrase-level offsets/durations in detailed results.
    speechConfig.outputFormat = sdk.OutputFormat.Detailed;

    // Push audio into the SDK as raw 16-bit / 16kHz / mono PCM samples.
    const pushStream = sdk.AudioInputStream.createPushStream(
        sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
    );
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const phrases: RecognizedPhrase[] = [];
    let totalChars = 0;
    let lastPartial = '';

    return new Promise<TranscriptionResult>((resolve, reject) => {
        recognizer.recognizing = (_sender, e) => {
            // Hypothesis text — useful for live UI updates.
            lastPartial = e.result?.text || '';
            options.onProgress?.({
                chars: totalChars,
                phrases: phrases.length,
                partial: lastPartial,
            });
        };

        recognizer.recognized = (_sender, e) => {
            if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
                phrases.push({
                    text: e.result.text,
                    offset: ticksToMs(e.result.offset as unknown as number),
                    duration: ticksToMs(e.result.duration as unknown as number),
                });
                totalChars += e.result.text.length;
                options.onProgress?.({
                    chars: totalChars,
                    phrases: phrases.length,
                });
            }
        };

        recognizer.canceled = (_sender, e) => {
            try {
                recognizer.stopContinuousRecognitionAsync(
                    () => recognizer.close(),
                    () => recognizer.close()
                );
            } catch {
                /* ignore */
            }
            if (e.reason === sdk.CancellationReason.Error) {
                reject(new Error(`Azure Speech error (${normalizedLocale}): ${e.errorDetails}`));
            } else {
                finish();
            }
        };

        recognizer.sessionStopped = () => {
            try {
                recognizer.stopContinuousRecognitionAsync(
                    () => recognizer.close(),
                    () => recognizer.close()
                );
            } catch {
                /* ignore */
            }
            finish();
        };

        let finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            const transcript = phrases
                .map((p) => p.text.trim())
                .filter(Boolean)
                .join(' ');
            resolve({
                transcript,
                vtt: buildVtt(phrases),
                phrases,
                language: normalizedLocale,
            });
        }

        recognizer.startContinuousRecognitionAsync(
            () => {
                // Start streaming the WAV. Skip the 44-byte RIFF header so we
                // push raw PCM samples that match the format declared above.
                const HEADER = 44;
                const readStream = fs.createReadStream(wavPath, { start: HEADER });

                readStream.on('data', (chunk: string | Buffer) => {
                    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    // Copy into a fresh ArrayBuffer (the SDK's `write` only
                    // accepts ArrayBuffer, not SharedArrayBuffer, and pooled
                    // Node Buffers may share their underlying allocation).
                    const ab = new ArrayBuffer(buf.byteLength);
                    new Uint8Array(ab).set(buf);
                    pushStream.write(ab);
                });

                readStream.on('end', () => {
                    pushStream.close();
                });

                readStream.on('error', (err) => {
                    reject(new Error(`Failed to read WAV stream: ${err.message}`));
                });
            },
            (err) => reject(new Error(`Failed to start recognition: ${err}`))
        );
    });
}

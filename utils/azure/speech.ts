/**
 * Azure Speech-to-Text helper.
 *
 * Uses microsoft-cognitiveservices-speech-sdk to run continuous speech
 * recognition on a 16kHz mono PCM WAV file, then assembles a WEBVTT subtitle
 * track plus a flat transcript string from the recognized phrases.
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

/**
 * Transcribes a 16kHz mono PCM WAV file using Azure Speech SDK continuous
 * recognition. Resolves with the assembled transcript + VTT.
 */
export async function transcribeWavFile(
  wavPath: string,
  language: string = 'en-US'
): Promise<TranscriptionResult> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    throw new Error(
      'AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables must be set'
    );
  }

  // Lazy import so the SDK never gets bundled with edge/middleware paths.
  const sdk = await import('microsoft-cognitiveservices-speech-sdk');

  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechRecognitionLanguage = language;
  // Get phrase-level offsets/durations in detailed results.
  speechConfig.outputFormat = sdk.OutputFormat.Detailed;

  const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(wavPath));
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  const phrases: RecognizedPhrase[] = [];

  return new Promise<TranscriptionResult>((resolve, reject) => {
    recognizer.recognized = (_sender, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
        phrases.push({
          text: e.result.text,
          offset: ticksToMs(e.result.offset as unknown as number),
          duration: ticksToMs(e.result.duration as unknown as number),
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
        reject(new Error(`Azure Speech error: ${e.errorDetails}`));
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
        language,
      });
    }

    recognizer.startContinuousRecognitionAsync(
      () => {
        /* started */
      },
      (err) => reject(new Error(`Failed to start recognition: ${err}`))
    );
  });
}

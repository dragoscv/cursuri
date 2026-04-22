/**
 * Long-running AI worker for lesson assets.
 *
 * `runAiJob(jobId)` executes the full pipeline (download video → ffmpeg
 * extract MP3 → Azure Fast Transcription → Azure OpenAI summarize → upload
 * to Firebase Storage → mirror onto the lesson doc). The job document at
 * `aiJobs/{jobId}` is the single source of truth for status, progress, stage
 * and cancellation; the modal and the global tray both subscribe to it
 * directly so the UI never depends on the original HTTP connection staying
 * open.
 *
 * Cancellation is cooperative: the worker polls `aiJobs/{jobId}` every
 * second, aborts in-flight HTTP via `AbortController` (download + Fast
 * Transcription) and SIGKILLs the active ffmpeg child process, then throws
 * `CancelledError` at the next checkpoint.
 *
 * Multiple `runAiJob(...)` invocations run in fully independent serverless
 * contexts (each enqueue triggers its own `after()` callback) so jobs
 * naturally parallelize.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export class CancelledError extends Error {
    constructor() {
        super('Cancelled by admin');
        this.name = 'CancelledError';
    }
}

export type AiJobStage =
    | 'queued'
    | 'downloading'
    | 'extracting_audio'
    | 'transcribing'
    | 'summarizing'
    | 'analyzing_audio'
    | 'generating_chapters'
    | 'uploading'
    | 'finalizing'
    | 'completed'
    | 'failed'
    | 'cancelled';

export interface AiJobDoc {
    jobId: string;
    courseId: string;
    lessonId: string;
    lessonName?: string;
    videoUrl: string;
    language: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    stage: AiJobStage;
    progress: number; // 0-100
    message: string;
    error?: string | null;
    createdAt: number;
    startedAt?: number | null;
    finishedAt?: number | null;
    heartbeatAt?: number | null;
    cancelRequested: boolean;
    createdBy: string;
    audioUrl?: string;
    vttUrl?: string;
    transcript?: string;
    transcriptionLanguage?: string;
    summary?: string;
    keyPoints?: string[];
    audioDurationSeconds?: number | null;
}

/**
 * Run a single queued job to completion. Idempotent: if the job is no longer
 * `queued` when picked up, the worker exits without doing anything.
 */
export async function runAiJob(jobId: string): Promise<void> {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
    const { getStorage } = await import('firebase-admin/storage');

    const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucketName) {
        console.error('[ai-job] missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, aborting', { jobId });
        return;
    }

    if (!getApps().length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            console.error('[ai-job] firebase-admin credentials missing, aborting', { jobId });
            return;
        }
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket: storageBucketName,
        });
    }

    const db = getFirestore();
    const bucket = getStorage().bucket(storageBucketName);
    const jobRef = db.doc(`aiJobs/${jobId}`);

    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) {
        console.warn('[ai-job] job not found, exiting', { jobId });
        return;
    }
    const job = jobSnap.data() as AiJobDoc;
    if (job.status !== 'queued') {
        console.warn('[ai-job] job not in queued status, exiting', { jobId, status: job.status });
        return;
    }

    const { courseId, lessonId, videoUrl, language } = job;
    const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);

    console.log('[ai-job] start', { jobId, courseId, lessonId, language });

    // Best-effort: sweep stale tmp dirs from previously crashed jobs so we
    // don't accumulate gigabytes on warm serverless instances and trigger
    // ENOSPC on subsequent runs.
    try {
        const tmpRoot = os.tmpdir();
        const entries = await fs.promises.readdir(tmpRoot);
        const cutoff = Date.now() - 30 * 60 * 1000; // 30 min
        await Promise.all(
            entries
                .filter((e) => e.startsWith('lesson-ai-'))
                .map(async (name) => {
                    const full = path.join(tmpRoot, name);
                    try {
                        const stat = await fs.promises.stat(full);
                        if (stat.mtimeMs < cutoff) {
                            await fs.promises.rm(full, { recursive: true, force: true });
                            console.log('[ai-job] swept stale tmp dir', { full });
                        }
                    } catch {
                        /* ignore */
                    }
                })
        );
    } catch (e) {
        console.warn('[ai-job] tmp sweep failed:', e);
    }

    await jobRef.update({
        status: 'processing',
        stage: 'queued',
        progress: 1,
        message: 'Preparing AI pipeline…',
        startedAt: Date.now(),
        heartbeatAt: Date.now(),
        error: null,
    });
    // Mirror minimal state onto the lesson doc so the lesson form can show a
    // chip even before opening the modal.
    await lessonRef.update({
        currentAiJobId: jobId,
        aiProcessingStatus: 'processing',
        aiProcessingError: null,
        captionsProcessing: true,
    });

    // ---- Cancellation plumbing -------------------------------------------------
    // Cancellation aborts in-flight HTTP (download, audio-extractor request,
    // Azure transcription) via AbortController and trips a flag checked at
    // every pipeline checkpoint. ffmpeg now runs in the audio-extractor Cloud
    // Run service, so killing the upstream fetch is enough — the service
    // detects the closed connection and SIGKILLs its own ffmpeg child.
    const abortController = new AbortController();
    let cancelRequested = false;

    const cancelPoller = setInterval(async () => {
        try {
            const s = await jobRef.get();
            if (s.exists && s.data()?.cancelRequested === true) {
                cancelRequested = true;
                try { abortController.abort(); } catch { /* ignore */ }
            }
        } catch {
            /* ignore */
        }
    }, 1000);

    const heartbeatTimer = setInterval(() => {
        void jobRef.update({ heartbeatAt: Date.now() }).catch(() => undefined);
    }, 5000);

    const checkCancelled = () => {
        if (cancelRequested) throw new CancelledError();
    };

    // ---- Progress writer (throttled) ------------------------------------------
    let lastProgressWriteAt = 0;
    const writeProgressThrottled = async (
        stage: AiJobStage,
        progress: number,
        message: string,
        minIntervalMs = 1500
    ) => {
        const now = Date.now();
        if (now - lastProgressWriteAt < minIntervalMs) return;
        lastProgressWriteAt = now;
        try {
            await jobRef.update({
                stage,
                progress: Math.max(0, Math.min(100, Math.round(progress))),
                message,
            });
        } catch {
            /* ignore */
        }
    };

    const setStage = async (stage: AiJobStage, progress: number, message: string) => {
        console.log(`[ai-job ${jobId}] stage=${stage} progress=${progress}% — ${message}`);
        try {
            await jobRef.update({ stage, progress, message });
        } catch (e) {
            console.warn(`[ai-job ${jobId}] progress write failed:`, e);
        }
    };

    const tempDir = path.join(os.tmpdir(), `lesson-ai-${jobId}-${uuidv4()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    const mp3Path = path.join(tempDir, 'audio.mp3');

    try {
        // 1+2) Download + extract MP3 — offloaded to the audio-extractor
        // Cloud Run service so we never put the source video on Vercel's
        // tiny /tmp. The service streams the MP3 back, we save just that.
        await setStage('downloading', 5, 'Sending video to audio-extractor service…');

        const extractorUrl = process.env.AUDIO_EXTRACTOR_URL;
        const extractorToken = process.env.AUDIO_EXTRACTOR_TOKEN;
        if (!extractorUrl || !extractorToken) {
            throw new Error(
                'AUDIO_EXTRACTOR_URL and AUDIO_EXTRACTOR_TOKEN must be set (see services/audio-extractor/README.md)'
            );
        }

        const extractorRes = await fetch(`${extractorUrl.replace(/\/$/, '')}/extract`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${extractorToken}`,
            },
            body: JSON.stringify({ videoUrl, jobId }),
            signal: abortController.signal,
        });

        if (!extractorRes.ok || !extractorRes.body) {
            const errText = await extractorRes.text().catch(() => '');
            throw new Error(
                `audio-extractor failed: ${extractorRes.status} ${extractorRes.statusText} ${errText}`.trim()
            );
        }

        const sourceBytesHeader = Number(extractorRes.headers.get('x-source-bytes')) || 0;
        await setStage(
            'extracting_audio',
            18,
            sourceBytesHeader > 0
                ? `Streaming MP3 from extractor (source ${(sourceBytesHeader / 1024 / 1024).toFixed(1)} MB)…`
                : 'Streaming MP3 from extractor…'
        );

        const { Readable } = await import('node:stream');
        const { pipeline } = await import('node:stream/promises');
        const mp3Out = fs.createWriteStream(mp3Path);
        let mp3Downloaded = 0;
        const mp3Stream = Readable.fromWeb(extractorRes.body as never);
        mp3Stream.on('data', (chunk: Buffer | string) => {
            mp3Downloaded += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
            const mb = (mp3Downloaded / (1024 * 1024)).toFixed(1);
            void writeProgressThrottled(
                'extracting_audio',
                Math.min(32, 18 + mp3Downloaded / (3 * 1024 * 1024)), // creep up to 32%
                `Receiving MP3 from extractor… ${mb} MB`
            );
        });
        await pipeline(mp3Stream, mp3Out);
        checkCancelled();

        // 3) Transcribe ----------------------------------------------------------
        const mp3Bytes = (await fs.promises.stat(mp3Path)).size;
        await setStage(
            'transcribing',
            40,
            `Sending ${(mp3Bytes / (1024 * 1024)).toFixed(1)} MB MP3 to Azure Fast Transcription (${language})…`
        );
        const transcribeStartedAt = Date.now();
        const transcribeTicker = setInterval(() => {
            const seconds = Math.round((Date.now() - transcribeStartedAt) / 1000);
            const creep = Math.min(28, seconds / 6);
            void writeProgressThrottled(
                'transcribing',
                40 + creep,
                `Azure Fast Transcription is processing the audio… (${seconds}s)`,
                2000
            );
        }, 2000);
        let transcription;
        try {
            const { transcribeAudioFile } = await import('@/utils/azure/speech');
            transcription = await transcribeAudioFile(mp3Path, language, {
                signal: abortController.signal,
            });
        } catch (e) {
            if (cancelRequested) throw new CancelledError();
            throw e;
        } finally {
            clearInterval(transcribeTicker);
        }
        checkCancelled();

        // Free disk: MP3 is no longer needed after transcription.
        try {
            await fs.promises.unlink(mp3Path);
        } catch (e) {
            console.warn(`[ai-job ${jobId}] could not remove mp3:`, e);
        }

        // 4) Summarize -----------------------------------------------------------
        await setStage(
            'summarizing',
            72,
            `Summarizing ${transcription.transcript.length.toLocaleString()} chars with Azure OpenAI…`
        );
        const lessonSnap = await lessonRef.get();
        const lessonData = lessonSnap.data() || {};
        const { summarizeTranscript } = await import('@/utils/azure/openai');
        let summaryResult = { summary: '', keyPoints: [] as string[], model: '' };
        try {
            summaryResult = await summarizeTranscript({
                transcript: transcription.transcript,
                lessonTitle: lessonData.name || lessonData.title,
                lessonDescription: lessonData.description,
            });
        } catch (sumErr) {
            console.error(`[ai-job ${jobId}] summarization failed (continuing):`, sumErr);
        }
        checkCancelled();

        // 5) Upload --------------------------------------------------------------
        await setStage('uploading', 85, 'Uploading MP3 + WEBVTT subtitles to storage…');
        const audioObjectName = `lesson-assets/${courseId}/${lessonId}/audio.mp3`;
        const vttObjectName = `lesson-assets/${courseId}/${lessonId}/captions.${transcription.language}.vtt`;

        const audioFile = bucket.file(audioObjectName);
        await audioFile.save(await fs.promises.readFile(mp3Path), {
            metadata: { contentType: 'audio/mpeg' },
            resumable: false,
        });
        await audioFile.makePublic();
        const audioUrl = `https://storage.googleapis.com/${bucket.name}/${audioObjectName}`;

        const vttFile = bucket.file(vttObjectName);
        await vttFile.save(transcription.vtt, {
            metadata: { contentType: 'text/vtt; charset=utf-8' },
            resumable: false,
        });
        await vttFile.makePublic();
        const vttUrl = `https://storage.googleapis.com/${bucket.name}/${vttObjectName}`;

        const audioDurationSeconds =
            typeof transcription.durationMs === 'number'
                ? Math.round(transcription.durationMs / 1000)
                : null;

        // 6) Finalize ------------------------------------------------------------
        await setStage('finalizing', 96, 'Saving everything on the lesson…');

        const captionsField = {
            ...(lessonData.captions || {}),
            [transcription.language]: {
                url: vttUrl,
                content: transcription.transcript,
            },
        };

        await lessonRef.update({
            audioUrl,
            audioFileName: 'audio.mp3',
            audioDurationSeconds: audioDurationSeconds ?? null,
            transcription: transcription.transcript,
            transcriptionLanguage: transcription.language,
            captions: captionsField,
            captionsProcessing: false,
            captionsGenerated: true,
            summary: summaryResult.summary,
            keyPoints: summaryResult.keyPoints,
            aiContentGeneratedAt: Date.now(),
            aiProcessingStatus: 'completed',
            aiProcessingError: null,
            currentAiJobId: FieldValue.delete(),
        });

        await jobRef.update({
            status: 'completed',
            stage: 'completed',
            progress: 100,
            message: 'All AI assets generated and saved.',
            error: null,
            cancelRequested: false,
            finishedAt: Date.now(),
            audioUrl,
            vttUrl,
            transcript: transcription.transcript,
            transcriptionLanguage: transcription.language,
            summary: summaryResult.summary,
            keyPoints: summaryResult.keyPoints,
            audioDurationSeconds: audioDurationSeconds ?? null,
        });

        console.log(`[ai-job ${jobId}] completed`);
    } catch (err) {
        const isCancel = err instanceof CancelledError;
        const message = isCancel
            ? 'Cancelled by admin'
            : err instanceof Error
                ? err.message
                : 'Unknown error';
        if (isCancel) {
            console.warn(`[ai-job ${jobId}] cancelled`);
        } else {
            console.error(`[ai-job ${jobId}] failed:`, err);
        }
        try {
            await jobRef.update({
                status: isCancel ? 'cancelled' : 'failed',
                stage: isCancel ? 'cancelled' : 'failed',
                message: isCancel ? 'Cancelled by admin.' : `Failed: ${message.slice(0, 200)}`,
                error: isCancel ? 'Cancelled by admin' : message.slice(0, 500),
                cancelRequested: false,
                finishedAt: Date.now(),
            });
        } catch (writeErr) {
            console.error(`[ai-job ${jobId}] failed to record terminal state:`, writeErr);
        }
        try {
            await lessonRef.update({
                aiProcessingStatus: isCancel ? 'cancelled' : 'failed',
                aiProcessingError: isCancel ? 'Cancelled by admin' : message.slice(0, 500),
                captionsProcessing: false,
                currentAiJobId: FieldValue.delete(),
            });
        } catch {
            /* ignore */
        }
    } finally {
        clearInterval(cancelPoller);
        clearInterval(heartbeatTimer);
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch {
            /* ignore */
        }
    }
}

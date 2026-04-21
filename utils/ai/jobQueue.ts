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
    const abortController = new AbortController();
    let cancelRequested = false;
    let activeFfmpegCmd: { kill: (signal?: string) => void } | null = null;

    const cancelPoller = setInterval(async () => {
        try {
            const s = await jobRef.get();
            if (s.exists && s.data()?.cancelRequested === true) {
                cancelRequested = true;
                try { abortController.abort(); } catch { /* ignore */ }
                try { activeFfmpegCmd?.kill('SIGKILL'); } catch { /* ignore */ }
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

    const ext = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase().slice(0, 4);
    const videoPath = path.join(tempDir, `source.${ext}`);
    const mp3Path = path.join(tempDir, 'audio.mp3');

    try {
        // 1) Download video -----------------------------------------------------
        await setStage('downloading', 5, 'Downloading the lesson video…');
        const res = await fetch(videoUrl, { signal: abortController.signal });
        if (!res.ok || !res.body) {
            throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
        }
        const totalBytes = Number(res.headers.get('content-length')) || 0;
        const { Readable } = await import('node:stream');
        const { pipeline } = await import('node:stream/promises');
        const outStream = fs.createWriteStream(videoPath);
        let downloaded = 0;
        const downloadStream = Readable.fromWeb(res.body as never);
        downloadStream.on('data', (chunk: Buffer | string) => {
            const len = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
            downloaded += len;
            if (totalBytes > 0) {
                const dlPct = downloaded / totalBytes;
                const overall = 5 + dlPct * 12;
                const mb = (downloaded / (1024 * 1024)).toFixed(1);
                const tot = (totalBytes / (1024 * 1024)).toFixed(1);
                void writeProgressThrottled(
                    'downloading',
                    overall,
                    `Downloading the lesson video… ${mb} / ${tot} MB`
                );
            }
        });
        await pipeline(downloadStream, outStream);
        checkCancelled();
        const videoBytes = totalBytes || (await fs.promises.stat(videoPath)).size;

        // 2) Extract MP3 with ffmpeg --------------------------------------------
        await setStage(
            'extracting_audio',
            18,
            `Extracting MP3 audio from ${(videoBytes / (1024 * 1024)).toFixed(1)} MB video (multithreaded)…`
        );
        const ffmpegMod = await import('fluent-ffmpeg');
        const ffmpeg = (ffmpegMod as { default?: typeof ffmpegMod }).default || ffmpegMod;
        try {
            const ffStatic = await import('ffmpeg-static');
            const binPath =
                (ffStatic as { default?: string }).default || (ffStatic as unknown as string);
            if (binPath) ffmpeg.setFfmpegPath(binPath);
        } catch {
            /* fall back to system ffmpeg */
        }

        let extractedAudioDurationSeconds: number | undefined;

        await new Promise<void>((resolve, reject) => {
            const cmd = ffmpeg(videoPath)
                .inputOptions(['-threads', '0'])
                .noVideo()
                .audioCodec('libmp3lame')
                .audioBitrate('96k')
                .audioChannels(1)
                .format('mp3')
                .on('codecData', (data: { duration?: string }) => {
                    if (data?.duration) {
                        const m = data.duration.match(/^(\d+):(\d+):(\d+(?:\.\d+)?)$/);
                        if (m) {
                            extractedAudioDurationSeconds =
                                Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
                        }
                    }
                })
                .on('progress', (p: { percent?: number; timemark?: string }) => {
                    const pct =
                        typeof p.percent === 'number' ? Math.max(0, Math.min(100, p.percent)) : 0;
                    const overall = 18 + (pct / 100) * 14;
                    void writeProgressThrottled(
                        'extracting_audio',
                        overall,
                        `Extracting audio… ${pct.toFixed(0)}% (t=${p.timemark || '0'})`
                    );
                })
                .on('end', () => resolve())
                .on('error', (err: Error) => {
                    if (cancelRequested) {
                        reject(new CancelledError());
                    } else {
                        reject(new Error(`ffmpeg failed: ${err.message}`));
                    }
                });
            activeFfmpegCmd = cmd as unknown as { kill: (signal?: string) => void };
            cmd.save(mp3Path);
        });
        activeFfmpegCmd = null;
        checkCancelled();

        // Free disk: source video is no longer needed once the MP3 exists.
        try {
            await fs.promises.unlink(videoPath);
        } catch (e) {
            console.warn(`[ai-job ${jobId}] could not remove source video:`, e);
        }

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

        const audioDurationSeconds = extractedAudioDurationSeconds;

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

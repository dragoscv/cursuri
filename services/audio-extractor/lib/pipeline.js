/**
 * Full lesson AI pipeline. Ported from utils/ai/jobQueue.ts (Vercel) so the
 * whole thing runs in a single Cloud Run invocation with proper disk and
 * timeout, in the same region as Firebase Storage.
 *
 * runJob(jobId) is idempotent: if the job is no longer 'queued' when picked
 * up, it exits without doing anything. Cancellation: the worker polls
 * aiJobs/{jobId} every second, aborts in-flight HTTP via AbortController,
 * SIGKILLs the active ffmpeg child, and throws CancelledError at the next
 * checkpoint.
 */

import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';

import { ensureFirebase, getFirestore, getStorage, FieldValue } from './firebase.js';
import { transcribeAudioFile } from './azure-speech.js';
import { summarizeTranscript } from './azure-openai.js';

class CancelledError extends Error {
    constructor() { super('Cancelled by admin'); this.name = 'CancelledError'; }
}

const FFMPEG_BIN = process.env.FFMPEG_BIN || 'ffmpeg';

/**
 * If `url` points at our own GCS bucket, return the object name (URL-decoded);
 * otherwise return null. Handles both Firebase Storage download URLs
 * (`https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded path>?alt=media&token=...`)
 * and plain GCS URLs (`https://storage.googleapis.com/<bucket>/<path>`,
 * `gs://<bucket>/<path>`).
 */
function parseOwnedObjectName(url, bucketName) {
    if (!url || !bucketName) return null;
    try {
        // gs://bucket/object
        if (url.startsWith('gs://')) {
            const rest = url.slice(5);
            const slash = rest.indexOf('/');
            if (slash < 0) return null;
            if (rest.slice(0, slash) !== bucketName) return null;
            return decodeURIComponent(rest.slice(slash + 1).split('?')[0]);
        }
        const u = new URL(url);
        // Firebase Storage download URL
        if (u.hostname === 'firebasestorage.googleapis.com') {
            // /v0/b/<bucket>/o/<encoded path>
            const m = u.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
            if (!m) return null;
            if (m[1] !== bucketName) return null;
            return decodeURIComponent(m[2]);
        }
        // Plain GCS public URL
        if (u.hostname === 'storage.googleapis.com') {
            const parts = u.pathname.replace(/^\//, '').split('/');
            if (parts.shift() !== bucketName) return null;
            return decodeURIComponent(parts.join('/'));
        }
        return null;
    } catch {
        return null;
    }
}

export async function runJob(jobId) {
    ensureFirebase();
    const db = getFirestore();
    const bucket = getStorage().bucket();
    const jobRef = db.doc(`aiJobs/${jobId}`);

    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) {
        console.warn('[ai-job] not found, exiting', { jobId });
        return;
    }
    const job = jobSnap.data();
    if (job.status !== 'queued' && job.status !== 'processing') {
        console.warn('[ai-job] not queued/processing, exiting', { jobId, status: job.status });
        return;
    }

    const { courseId, lessonId, videoUrl, language } = job;
    const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);

    console.log('[ai-job] start', { jobId, courseId, lessonId, language });

    // Sweep stale tmp dirs from previously crashed runs.
    try {
        const tmpRoot = os.tmpdir();
        const entries = await fs.promises.readdir(tmpRoot);
        const cutoff = Date.now() - 30 * 60 * 1000;
        await Promise.all(
            entries.filter((e) => e.startsWith('lesson-ai-')).map(async (name) => {
                const full = path.join(tmpRoot, name);
                try {
                    const st = await fs.promises.stat(full);
                    if (st.mtimeMs < cutoff) {
                        await fs.promises.rm(full, { recursive: true, force: true });
                        console.log('[ai-job] swept stale tmp dir', { full });
                    }
                } catch { /* ignore */ }
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
    await lessonRef.update({
        currentAiJobId: jobId,
        aiProcessingStatus: 'processing',
        aiProcessingError: null,
        captionsProcessing: true,
    });

    // ---- Cancellation plumbing -----------------------------------------------
    const abortController = new AbortController();
    let cancelRequested = false;
    let activeFfmpeg = null;

    const cancelPoller = setInterval(async () => {
        try {
            const s = await jobRef.get();
            if (s.exists && s.data()?.cancelRequested === true) {
                cancelRequested = true;
                try { abortController.abort(); } catch { /* ignore */ }
                try { activeFfmpeg?.kill('SIGKILL'); } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
    }, 1000);

    const heartbeatTimer = setInterval(() => {
        void jobRef.update({ heartbeatAt: Date.now() }).catch(() => undefined);
    }, 5000);

    const checkCancelled = () => { if (cancelRequested) throw new CancelledError(); };

    // ---- Progress writer (throttled) ------------------------------------------
    let lastProgressWriteAt = 0;
    const writeProgressThrottled = async (stage, progress, message, minIntervalMs = 1500) => {
        const now = Date.now();
        if (now - lastProgressWriteAt < minIntervalMs) return;
        lastProgressWriteAt = now;
        try {
            await jobRef.update({
                stage, progress: Math.max(0, Math.min(100, Math.round(progress))), message,
            });
        } catch { /* ignore */ }
    };

    const setStage = async (stage, progress, message) => {
        console.log(`[ai-job ${jobId}] stage=${stage} progress=${progress}% — ${message}`);
        try { await jobRef.update({ stage, progress, message }); }
        catch (e) { console.warn(`[ai-job ${jobId}] progress write failed:`, e); }
    };

    const tempDir = path.join(os.tmpdir(), `lesson-ai-${jobId}-${randomUUID()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });
    const ext = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase().slice(0, 4);
    const videoPath = path.join(tempDir, `source.${ext}`);
    const mp3Path = path.join(tempDir, 'audio.mp3');

    try {
        // 1) Download video --------------------------------------------------
        await setStage('downloading', 5, 'Downloading the lesson video…');

        // Detect Firebase Storage / GCS URLs that point at OUR bucket. When
        // we own the bucket, we use the Admin SDK's createReadStream() which
        // goes over Google's internal network instead of the public
        // firebasestorage.googleapis.com edge — usually 10-50x faster from
        // Cloud Run in the same region.
        const ownedObjectName = parseOwnedObjectName(videoUrl, bucket.name);
        let totalBytes = 0;
        let downloaded = 0;
        const out = fs.createWriteStream(videoPath);
        const onProgress = () => {
            if (totalBytes > 0) {
                const dlPct = downloaded / totalBytes;
                const overall = 5 + dlPct * 12;
                const mb = (downloaded / 1024 / 1024).toFixed(1);
                const tot = (totalBytes / 1024 / 1024).toFixed(1);
                void writeProgressThrottled('downloading', overall,
                    `Downloading the lesson video… ${mb} / ${tot} MB`);
            } else {
                const mb = (downloaded / 1024 / 1024).toFixed(1);
                void writeProgressThrottled('downloading', 5,
                    `Downloading the lesson video… ${mb} MB`);
            }
        };

        if (ownedObjectName) {
            console.log(`[ai-job ${jobId}] downloading via Admin SDK: gs://${bucket.name}/${ownedObjectName}`);
            const file = bucket.file(ownedObjectName);
            const [metadata] = await file.getMetadata();
            totalBytes = Number(metadata.size) || 0;
            const dlStream = file.createReadStream({ validation: false });
            dlStream.on('data', (chunk) => { downloaded += chunk.length; onProgress(); });
            const onCancel = () => { try { dlStream.destroy(new CancelledError()); } catch { /* ignore */ } };
            abortController.signal.addEventListener('abort', onCancel);
            try {
                await pipeline(dlStream, out);
            } finally {
                abortController.signal.removeEventListener('abort', onCancel);
            }
        } else {
            console.log(`[ai-job ${jobId}] downloading via public fetch: ${videoUrl.split('?')[0]}`);
            const res = await fetch(videoUrl, { signal: abortController.signal });
            if (!res.ok || !res.body) {
                throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
            }
            totalBytes = Number(res.headers.get('content-length')) || 0;
            const dlStream = Readable.fromWeb(res.body);
            dlStream.on('data', (chunk) => { downloaded += chunk.length; onProgress(); });
            await pipeline(dlStream, out);
        }
        checkCancelled();
        const videoBytes = totalBytes || (await fs.promises.stat(videoPath)).size;

        // 2) Extract MP3 with ffmpeg ----------------------------------------
        await setStage('extracting_audio', 18,
            `Extracting MP3 from ${(videoBytes / 1024 / 1024).toFixed(1)} MB video…`);

        await new Promise((resolve, reject) => {
            const args = [
                '-hide_banner', '-loglevel', 'error',
                '-threads', '0',
                '-i', videoPath,
                '-vn',
                '-ac', '1',
                '-ab', '96k',
                '-acodec', 'libmp3lame',
                '-f', 'mp3',
                mp3Path,
            ];
            const proc = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
            activeFfmpeg = proc;
            proc.stderr.on('data', (d) => {
                const s = d.toString();
                if (s.length < 500) console.log(`[ai-job ${jobId}] ffmpeg: ${s.trim()}`);
            });
            proc.on('error', reject);
            proc.on('close', (code, signal) => {
                if (code === 0) resolve();
                else if (cancelRequested) reject(new CancelledError());
                else reject(new Error(`ffmpeg exited code=${code} signal=${signal}`));
            });
        });
        activeFfmpeg = null;
        checkCancelled();

        try { await fs.promises.unlink(videoPath); }
        catch (e) { console.warn(`[ai-job ${jobId}] could not remove source video:`, e); }

        // 3) Transcribe ------------------------------------------------------
        const mp3Bytes = (await fs.promises.stat(mp3Path)).size;
        await setStage('transcribing', 40,
            `Sending ${(mp3Bytes / 1024 / 1024).toFixed(1)} MB MP3 to Azure Fast Transcription (${language})…`);
        const tStart = Date.now();
        const ticker = setInterval(() => {
            const seconds = Math.round((Date.now() - tStart) / 1000);
            const creep = Math.min(28, seconds / 6);
            void writeProgressThrottled('transcribing', 40 + creep,
                `Azure Fast Transcription is processing the audio… (${seconds}s)`, 2000);
        }, 2000);
        let transcription;
        try {
            transcription = await transcribeAudioFile(mp3Path, language, { signal: abortController.signal });
        } catch (e) {
            if (cancelRequested) throw new CancelledError();
            throw e;
        } finally {
            clearInterval(ticker);
        }
        checkCancelled();

        // 4) Summarize -------------------------------------------------------
        await setStage('summarizing', 72,
            `Summarizing ${transcription.transcript.length.toLocaleString()} chars with Azure OpenAI…`);
        const lessonSnap = await lessonRef.get();
        const lessonData = lessonSnap.data() || {};
        let summaryResult = { summary: '', keyPoints: [], model: '' };
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

        // 5) Upload ----------------------------------------------------------
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

        try { await fs.promises.unlink(mp3Path); } catch { /* ignore */ }

        const audioDurationSeconds = typeof transcription.durationMs === 'number'
            ? Math.round(transcription.durationMs / 1000) : null;

        // 6) Finalize --------------------------------------------------------
        await setStage('finalizing', 96, 'Saving everything on the lesson…');

        const captionsField = {
            ...(lessonData.captions || {}),
            [transcription.language]: { url: vttUrl, content: transcription.transcript },
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
        const message = isCancel ? 'Cancelled by admin' : (err?.message || 'Unknown error');
        if (isCancel) console.warn(`[ai-job ${jobId}] cancelled`);
        else console.error(`[ai-job ${jobId}] failed:`, err);

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
        } catch { /* ignore */ }
    } finally {
        clearInterval(cancelPoller);
        clearInterval(heartbeatTimer);
        try { await fs.promises.rm(tempDir, { recursive: true, force: true }); }
        catch { /* ignore */ }
    }
}

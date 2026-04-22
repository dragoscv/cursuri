/**
 * studiai-audio-extractor
 *
 * Tiny Cloud Run service that:
 *   1. downloads a video from a signed URL
 *   2. runs `ffmpeg -i input -vn -ac 1 -ab 96k -f mp3` to extract audio
 *   3. streams the resulting MP3 back to the caller as `audio/mpeg`
 *
 * Deployed alongside the Next.js app to offload the disk- and CPU-heavy
 * download + ffmpeg work that was blowing /tmp on Vercel serverless.
 *
 * Auth: shared bearer token via `AUDIO_EXTRACTOR_TOKEN` env var.
 *
 * Endpoints:
 *   GET  /healthz            → 200 "ok"
 *   POST /extract            → audio/mpeg (streaming)
 *      body: { videoUrl: string, jobId?: string }
 *      headers: Authorization: Bearer <token>
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT) || 8080;
const TOKEN = process.env.AUDIO_EXTRACTOR_TOKEN || '';
const FFMPEG_BIN = process.env.FFMPEG_BIN || 'ffmpeg';
const MAX_VIDEO_BYTES = Number(process.env.MAX_VIDEO_BYTES) || 4 * 1024 * 1024 * 1024; // 4 GB

if (!TOKEN) {
    console.warn('[audio-extractor] WARNING: AUDIO_EXTRACTOR_TOKEN is empty; refusing all /extract calls.');
}

/** @param {http.IncomingMessage} req */
async function readJsonBody(req) {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
        total += chunk.length;
        if (total > 8 * 1024) throw new Error('body too large');
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};
    return JSON.parse(raw);
}

/** @param {http.ServerResponse} res */
function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(body),
    });
    res.end(body);
}

const server = http.createServer(async (req, res) => {
    const reqId = crypto.randomUUID().slice(0, 8);
    const url = new URL(req.url || '/', 'http://x');

    if (req.method === 'GET' && url.pathname === '/healthz') {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end('ok');
        return;
    }

    if (req.method !== 'POST' || url.pathname !== '/extract') {
        sendJson(res, 404, { error: 'not found' });
        return;
    }

    // --- auth ---
    const auth = req.headers['authorization'] || '';
    const provided = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!TOKEN || provided !== TOKEN) {
        sendJson(res, 401, { error: 'unauthorized' });
        return;
    }

    // --- body ---
    let body;
    try {
        body = await readJsonBody(req);
    } catch (e) {
        sendJson(res, 400, { error: `invalid body: ${e.message}` });
        return;
    }
    const videoUrl = String(body?.videoUrl || '');
    const jobId = String(body?.jobId || reqId);
    if (!videoUrl || !/^https?:\/\//i.test(videoUrl)) {
        sendJson(res, 400, { error: 'videoUrl is required and must be http(s)' });
        return;
    }

    const tempDir = path.join(os.tmpdir(), `extractor-${jobId}-${reqId}`);
    await fs.promises.mkdir(tempDir, { recursive: true });
    const ext = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase().slice(0, 4);
    const videoPath = path.join(tempDir, `source.${ext}`);

    let ffmpegProc = null;
    let aborted = false;
    req.on('close', () => {
        if (!res.writableEnded) {
            aborted = true;
            try { ffmpegProc?.kill('SIGKILL'); } catch { /* ignore */ }
        }
    });

    const cleanup = async () => {
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.warn(`[audio-extractor ${jobId}] cleanup failed:`, e.message);
        }
    };

    try {
        // --- 1) download -----------------------------------------------------
        console.log(`[audio-extractor ${jobId}] download start: ${videoUrl}`);
        const downloadRes = await fetch(videoUrl);
        if (!downloadRes.ok || !downloadRes.body) {
            throw new Error(`download failed: ${downloadRes.status} ${downloadRes.statusText}`);
        }
        const totalBytes = Number(downloadRes.headers.get('content-length')) || 0;
        if (totalBytes > MAX_VIDEO_BYTES) {
            throw new Error(`video too large: ${totalBytes} > ${MAX_VIDEO_BYTES}`);
        }
        const out = fs.createWriteStream(videoPath);
        await pipeline(Readable.fromWeb(downloadRes.body), out);
        const stat = await fs.promises.stat(videoPath);
        console.log(`[audio-extractor ${jobId}] downloaded ${(stat.size / 1024 / 1024).toFixed(1)} MB`);

        // --- 2) ffmpeg → mp3 streamed straight to the response ---------------
        res.writeHead(200, {
            'content-type': 'audio/mpeg',
            'transfer-encoding': 'chunked',
            'x-job-id': jobId,
            'x-source-bytes': String(stat.size),
        });

        const args = [
            '-hide_banner',
            '-loglevel', 'error',
            '-threads', '0',
            '-i', videoPath,
            '-vn',
            '-ac', '1',
            '-ab', '96k',
            '-acodec', 'libmp3lame',
            '-f', 'mp3',
            'pipe:1',
        ];

        ffmpegProc = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });

        ffmpegProc.stderr.on('data', (d) => {
            // ffmpeg prints progress on stderr; only log a small tail to avoid noise
            const s = d.toString();
            if (s.length < 500) console.log(`[audio-extractor ${jobId}] ffmpeg: ${s.trim()}`);
        });

        const exitPromise = new Promise((resolve, reject) => {
            ffmpegProc.on('error', reject);
            ffmpegProc.on('close', (code, signal) => {
                if (code === 0) resolve();
                else if (aborted) reject(new Error('aborted'));
                else reject(new Error(`ffmpeg exited code=${code} signal=${signal}`));
            });
        });

        // pipe ffmpeg stdout → http response
        ffmpegProc.stdout.pipe(res, { end: false });
        await exitPromise;

        // ensure all stdout is flushed before ending response
        if (!res.writableEnded) res.end();
        console.log(`[audio-extractor ${jobId}] done`);
    } catch (err) {
        console.error(`[audio-extractor ${jobId}] error:`, err);
        if (!res.headersSent) {
            sendJson(res, 500, { error: err.message || 'extraction failed' });
        } else if (!res.writableEnded) {
            // headers already sent (audio streaming started) — best we can do is end the stream
            res.end();
        }
    } finally {
        await cleanup();
    }
});

server.listen(PORT, () => {
    console.log(`[audio-extractor] listening on :${PORT}`);
});

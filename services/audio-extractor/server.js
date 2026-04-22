/**
 * studiai-audio-extractor — full lesson AI pipeline worker.
 *
 * Runs the entire `runAiJob` flow on Cloud Run (download → ffmpeg → Azure
 * Speech transcribe → Azure OpenAI summarize → upload to Storage → write
 * lesson + job docs in Firestore). Vercel only enqueues the job and pings
 * this service.
 *
 * Endpoints:
 *   GET  /healthz             → 200 { ok: true, inflight }
 *   POST /jobs/run            → 202 { ok: true, jobId } (auth required)
 *      body: { jobId: string }
 *      headers: Authorization: Bearer <AUDIO_EXTRACTOR_TOKEN>
 *
 * The HTTP request returns immediately (202) while the pipeline keeps
 * running in this process. Cancellation flows through Firestore
 * (aiJobs/{jobId}.cancelRequested = true), polled by the pipeline.
 *
 * Env:
 *   AUDIO_EXTRACTOR_TOKEN     bearer token shared with Vercel
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY      (with \n escapes; sanitized by lib/firebase.js)
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   AZURE_SPEECH_KEY
 *   AZURE_SPEECH_REGION
 *   AZURE_OPENAI_ENDPOINT
 *   AZURE_OPENAI_API_KEY
 *   AZURE_OPENAI_DEPLOYMENT
 *   AZURE_OPENAI_API_VERSION  (optional)
 */

import http from 'node:http';
import { runJob } from './lib/pipeline.js';

const PORT = Number(process.env.PORT) || 8080;
const TOKEN = process.env.AUDIO_EXTRACTOR_TOKEN || '';

if (!TOKEN) {
    console.warn('[worker] WARNING: AUDIO_EXTRACTOR_TOKEN is empty; refusing all /jobs/run calls.');
}

const inflight = new Set();

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

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(body),
    });
    res.end(body);
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://x');

    if (req.method === 'GET' && url.pathname === '/healthz') {
        sendJson(res, 200, { ok: true, inflight: inflight.size });
        return;
    }

    if (req.method !== 'POST' || url.pathname !== '/jobs/run') {
        sendJson(res, 404, { error: 'not found' });
        return;
    }

    const auth = req.headers['authorization'] || '';
    const provided = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!TOKEN || provided !== TOKEN) {
        sendJson(res, 401, { error: 'unauthorized' });
        return;
    }

    let body;
    try { body = await readJsonBody(req); }
    catch (e) { sendJson(res, 400, { error: `invalid body: ${e.message}` }); return; }

    const jobId = String(body?.jobId || '').trim();
    if (!jobId) {
        sendJson(res, 400, { error: 'jobId is required' });
        return;
    }

    console.log(`[worker] starting job ${jobId} (${inflight.size + 1} in flight)`);
    inflight.add(jobId);
    runJob(jobId)
        .catch((e) => console.error(`[worker] job ${jobId} threw at top level:`, e))
        .finally(() => {
            inflight.delete(jobId);
            console.log(`[worker] finished job ${jobId} (${inflight.size} remaining)`);
        });

    sendJson(res, 202, { ok: true, jobId });
});

server.listen(PORT, () => {
    console.log(`[worker] listening on :${PORT}`);
});

function shutdown(sig) {
    console.log(`[worker] received ${sig}, ${inflight.size} jobs in flight`);
    server.close(() => console.log('[worker] http server closed'));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

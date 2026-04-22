/**
 * Waveform peak extraction.
 *
 * Pipes the source MP3 through ffmpeg as 8 kHz mono signed-16-bit PCM, then
 * downsamples to a fixed number of buckets (default 600) using the per-bucket
 * peak absolute amplitude normalized to [0, 1]. Returns the array.
 *
 * The result is small (~600 floats) and meant to be uploaded as a JSON file
 * so the player can render an SVG waveform without decoding the audio
 * client-side.
 *
 * Also derives speech-vs-silence regions from the supplied phrase list
 * (already produced by Azure Speech). Adjacent phrases closer than
 * MERGE_GAP_MS are merged into a single segment.
 */

import { spawn } from 'node:child_process';

const FFMPEG_BIN = process.env.FFMPEG_BIN || 'ffmpeg';
const SAMPLE_RATE = 8000;          // Hz, mono — plenty for visual peaks
const BYTES_PER_SAMPLE = 2;        // s16le
const DEFAULT_BUCKETS = 600;
const MERGE_GAP_MS = 350;

/**
 * @param {string} mp3Path absolute path to a local MP3 file
 * @param {object} [opts]
 * @param {number} [opts.buckets=600] number of waveform buckets
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<number[]>}  array of `buckets` floats in [0, 1]
 */
export function computeWaveformPeaks(mp3Path, opts = {}) {
    const buckets = Math.max(50, Math.min(2000, opts.buckets || DEFAULT_BUCKETS));
    const signal = opts.signal;

    return new Promise((resolve, reject) => {
        const args = [
            '-hide_banner', '-loglevel', 'error',
            '-i', mp3Path,
            '-ac', '1',
            '-ar', String(SAMPLE_RATE),
            '-f', 's16le',
            'pipe:1',
        ];
        const proc = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });

        // Two-pass strategy: first collect total sample count to size buckets.
        // To avoid two passes, we accumulate raw |sample| sums into a growable
        // array and downsample to the final bucket count when ffmpeg finishes.
        // The downsample buffer holds ONE float per ~10 ms (8000/800 ≈ 10) so
        // memory is small even for hour-long lectures (~360k floats / 1.4 MB).
        const SUB_BUCKET_SIZE = SAMPLE_RATE / 100;   // 80 samples = 10 ms slice
        const subPeaks = [];
        let pendingPeak = 0;
        let pendingCount = 0;
        let leftoverByte = -1; // for odd byte alignment

        const onData = (chunk) => {
            let i = 0;
            // Handle a leftover odd byte from the previous chunk
            if (leftoverByte !== -1) {
                const lo = leftoverByte;
                const hi = chunk[0];
                let v = (hi << 8) | lo;
                if (v & 0x8000) v -= 0x10000;
                const a = Math.abs(v);
                if (a > pendingPeak) pendingPeak = a;
                pendingCount++;
                if (pendingCount >= SUB_BUCKET_SIZE) {
                    subPeaks.push(pendingPeak);
                    pendingPeak = 0; pendingCount = 0;
                }
                leftoverByte = -1;
                i = 1;
            }
            const end = chunk.length - ((chunk.length - i) % 2);
            for (; i < end; i += 2) {
                const lo = chunk[i];
                const hi = chunk[i + 1];
                let v = (hi << 8) | lo;
                if (v & 0x8000) v -= 0x10000;
                const a = Math.abs(v);
                if (a > pendingPeak) pendingPeak = a;
                pendingCount++;
                if (pendingCount >= SUB_BUCKET_SIZE) {
                    subPeaks.push(pendingPeak);
                    pendingPeak = 0; pendingCount = 0;
                }
            }
            if (i < chunk.length) leftoverByte = chunk[i];
        };
        proc.stdout.on('data', onData);

        let stderrTail = '';
        proc.stderr.on('data', (d) => {
            const s = d.toString();
            stderrTail = (stderrTail + s).slice(-500);
        });

        const onCancel = () => { try { proc.kill('SIGKILL'); } catch { /* ignore */ } };
        signal?.addEventListener('abort', onCancel);

        proc.on('error', (err) => {
            signal?.removeEventListener('abort', onCancel);
            reject(err);
        });
        proc.on('close', (code) => {
            signal?.removeEventListener('abort', onCancel);
            if (signal?.aborted) return reject(new Error('Cancelled'));
            if (code !== 0) return reject(new Error(`ffmpeg pcm exit ${code}: ${stderrTail.trim()}`));

            // Flush trailing partial sub-bucket
            if (pendingCount > 0) subPeaks.push(pendingPeak);

            if (subPeaks.length === 0) return resolve(new Array(buckets).fill(0));

            // Downsample subPeaks → final buckets, peak per bucket.
            const out = new Array(buckets).fill(0);
            const ratio = subPeaks.length / buckets;
            for (let b = 0; b < buckets; b++) {
                const start = Math.floor(b * ratio);
                const end = Math.max(start + 1, Math.floor((b + 1) * ratio));
                let peak = 0;
                for (let j = start; j < end && j < subPeaks.length; j++) {
                    if (subPeaks[j] > peak) peak = subPeaks[j];
                }
                out[b] = peak;
            }
            // Normalize 0..1 against the loudest peak in the file.
            let max = 0;
            for (let i = 0; i < out.length; i++) if (out[i] > max) max = out[i];
            if (max > 0) for (let i = 0; i < out.length; i++) out[i] = +(out[i] / max).toFixed(4);
            resolve(out);
        });
    });
}

/**
 * Convert Azure Speech phrases into clean speech-segment intervals (in
 * seconds), merging adjacent phrases separated by < 350 ms of silence.
 *
 * @param {{offset:number,duration:number,text?:string}[]} phrases
 * @returns {{startSeconds:number,endSeconds:number}[]}
 */
export function phrasesToSpeechSegments(phrases) {
    if (!Array.isArray(phrases) || phrases.length === 0) return [];
    const sorted = phrases
        .filter((p) => (p?.text || '').trim().length > 0 && Number.isFinite(p.offset) && Number.isFinite(p.duration))
        .sort((a, b) => a.offset - b.offset);

    const merged = [];
    for (const p of sorted) {
        const startMs = Math.max(0, p.offset);
        const endMs = startMs + Math.max(p.duration, 100);
        const last = merged[merged.length - 1];
        if (last && startMs - last.endMs <= MERGE_GAP_MS) {
            if (endMs > last.endMs) last.endMs = endMs;
        } else {
            merged.push({ startMs, endMs });
        }
    }
    return merged.map((s) => ({
        startSeconds: +(s.startMs / 1000).toFixed(2),
        endSeconds: +(s.endMs / 1000).toFixed(2),
    }));
}

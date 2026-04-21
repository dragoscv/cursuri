/**
 * POST /api/admin/lessons/ai-process
 *
 * Admin-only endpoint that, for a single lesson video:
 *   1. Downloads the source video to a temp dir
 *   2. Extracts a 16kHz mono PCM WAV audio track + a downloadable MP3
 *   3. Runs Azure Speech continuous recognition to produce transcript + WEBVTT
 *   4. Calls Azure OpenAI to generate a short summary + key points
 *   5. Uploads audio + VTT to Firebase Storage and persists everything on the
 *      lesson document.
 *
 * Body: { courseId: string, lessonId: string, videoUrl?: string, language?: string }
 *
 * Returns 200 with the resulting lesson asset record.
 */

import { NextResponse, type NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300; // up to 5 minutes for long lessons

interface AiProcessBody {
  courseId?: string;
  lessonId?: string;
  videoUrl?: string;
  language?: string;
}

export async function POST(req: NextRequest) {
  // Lazy imports keep the route bundle small and avoid breaking edge.
  const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { getStorage } = await import('firebase-admin/storage');

  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult.user!;

  const allowed = await checkRateLimit(`lesson-ai:${user.uid}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  let body: AiProcessBody;
  try {
    body = (await req.json()) as AiProcessBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const courseId = body.courseId?.trim();
  const lessonId = body.lessonId?.trim();
  const language = (body.language || 'en-US').trim();

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: 'Missing required fields: courseId, lessonId' },
      { status: 400 }
    );
  }

  // Resolve the storage bucket name once. The admin SDK may already be
  // initialized elsewhere (e.g. by requireAdmin) WITHOUT storageBucket, in
  // which case getStorage().bucket() would throw. We always pass the bucket
  // name explicitly to be safe.
  const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucketName) {
    console.error('[ai-process] missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
    return NextResponse.json(
      { error: 'Server is missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.' },
      { status: 503 }
    );
  }

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[ai-process] firebase admin credentials missing', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
      });
      return NextResponse.json(
        { error: 'Firebase Admin credentials are not fully configured on the server.' },
        { status: 503 }
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: storageBucketName,
    });
    console.log('[ai-process] firebase-admin initialized with bucket', storageBucketName);
  }

  const db = getFirestore();
  const bucket = getStorage().bucket(storageBucketName);
  console.log('[ai-process] start', { courseId, lessonId, language, bucket: bucket.name });
  const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);

  const lessonSnap = await lessonRef.get();
  if (!lessonSnap.exists) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }
  const lessonData = lessonSnap.data() || {};
  const videoUrl: string = body.videoUrl || lessonData.file || lessonData.videoUrl;

  if (!videoUrl) {
    return NextResponse.json(
      {
        error:
          'Lesson has no uploaded video URL (lesson.file). Upload a video before generating AI assets.',
      },
      { status: 400 }
    );
  }

  // Mark processing
  await lessonRef.update({
    aiProcessingStatus: 'processing',
    aiProcessingError: null,
    aiProcessingStage: 'queued',
    aiProcessingProgress: 1,
    aiProcessingMessage: 'Preparing AI pipeline…',
    captionsProcessing: true,
  });

  // Helper to push progress updates that the admin UI subscribes to.
  const setStage = async (
    stage:
      | 'queued'
      | 'downloading'
      | 'extracting_audio'
      | 'transcribing'
      | 'summarizing'
      | 'uploading'
      | 'finalizing',
    progress: number,
    message: string
  ) => {
    console.log(`[ai-process] stage=${stage} progress=${progress}% — ${message}`);
    try {
      await lessonRef.update({
        aiProcessingStage: stage,
        aiProcessingProgress: progress,
        aiProcessingMessage: message,
      });
    } catch (e) {
      console.warn('[ai-process] progress write failed:', e);
    }
  };

  const tempDir = path.join(os.tmpdir(), `lesson-ai-${uuidv4()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const ext = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase().slice(0, 4);
  const videoPath = path.join(tempDir, `source.${ext}`);
  const wavPath = path.join(tempDir, 'audio.wav');
  const mp3Path = path.join(tempDir, 'audio.mp3');

  // Throttled progress writer so we never spam Firestore from inner loops.
  let lastProgressWriteAt = 0;
  const writeProgressThrottled = async (
    stage: 'downloading' | 'extracting_audio' | 'transcribing',
    progress: number,
    message: string,
    minIntervalMs = 1500
  ) => {
    const now = Date.now();
    if (now - lastProgressWriteAt < minIntervalMs) return;
    lastProgressWriteAt = now;
    try {
      await lessonRef.update({
        aiProcessingStage: stage,
        aiProcessingProgress: Math.max(0, Math.min(100, Math.round(progress))),
        aiProcessingMessage: message,
      });
    } catch {
      /* ignore */
    }
  };

  try {
    // 1) Stream-download the video to disk so we never hold a multi-GB buffer
    //    in memory.
    await setStage('downloading', 5, 'Downloading the lesson video…');
    const res = await fetch(videoUrl);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
    }
    const totalBytes = Number(res.headers.get('content-length')) || 0;
    const { Readable } = await import('node:stream');
    const { pipeline } = await import('node:stream/promises');
    const outStream = fs.createWriteStream(videoPath);

    let downloaded = 0;
    const downloadStream = Readable.fromWeb(res.body as any);
    downloadStream.on('data', (chunk: Buffer | string) => {
      const len = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
      downloaded += len;
      if (totalBytes > 0) {
        const dlPct = downloaded / totalBytes;
        // Map download progress to the 5..17 band (extraction takes the rest).
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

    const videoBytes = totalBytes || (await fs.promises.stat(videoPath)).size;

    // 2) Single ffmpeg pass producing BOTH the MP3 (for playback/download) and
    //    the 16kHz mono WAV (for Azure Speech). Decoding the source video once
    //    is roughly 2× faster than running ffmpeg twice for huge inputs.
    await setStage(
      'extracting_audio',
      18,
      `Extracting audio from ${(videoBytes / (1024 * 1024)).toFixed(1)} MB video (single pass, multithreaded)…`
    );
    const ffmpegMod = await import('fluent-ffmpeg');
    const ffmpeg = (ffmpegMod as { default?: typeof ffmpegMod }).default || ffmpegMod;
    try {
      const ffStatic = await import('ffmpeg-static');
      const binPath =
        (ffStatic as { default?: string }).default || (ffStatic as unknown as string);
      if (binPath) {
        ffmpeg.setFfmpegPath(binPath);
      }
    } catch {
      /* fall back to system ffmpeg */
    }

    let extractedAudioDurationSeconds: number | undefined;

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg(videoPath)
        // -threads 0 → ffmpeg picks an optimal worker count for the host.
        .inputOptions(['-threads', '0'])
        // Output 1: WAV for Azure Speech (16kHz, mono, 16-bit PCM)
        .output(wavPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .noVideo()
        .format('wav')
        // Output 2: MP3 for the public lesson page
        .output(mp3Path)
        .audioCodec('libmp3lame')
        .audioBitrate('96k')
        .audioChannels(1)
        .noVideo()
        .format('mp3')
        .on('codecData', (data: { duration?: string }) => {
          // duration string like "00:48:13.45" → seconds
          if (data?.duration) {
            const m = data.duration.match(/^(\d+):(\d+):(\d+(?:\.\d+)?)$/);
            if (m) {
              extractedAudioDurationSeconds =
                Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
            }
          }
        })
        .on('progress', (p: { percent?: number; timemark?: string }) => {
          const pct = typeof p.percent === 'number' ? Math.max(0, Math.min(100, p.percent)) : 0;
          // Map ffmpeg's own 0..100 onto the 18..32 band.
          const overall = 18 + (pct / 100) * 14;
          void writeProgressThrottled(
            'extracting_audio',
            overall,
            `Extracting audio… ${pct.toFixed(0)}% (t=${p.timemark || '0'})`
          );
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`ffmpeg failed: ${err.message}`)));
      cmd.run();
    });

    // 3) Transcribe with Azure Speech (streamed PushStream + live partial hook)
    await setStage(
      'transcribing',
      35,
      `Transcribing with Azure Speech (${language})… this is the longest step.`
    );
    const { transcribeWavFile } = await import('@/utils/azure/speech');
    const transcription = await transcribeWavFile(wavPath, language, {
      onProgress: ({ chars, phrases }) => {
        // Map a soft estimate based on phrase count onto 35..70.
        const overall = Math.min(70, 35 + Math.min(35, phrases * 0.8));
        void writeProgressThrottled(
          'transcribing',
          overall,
          `Transcribing… ${phrases.toLocaleString()} segments, ${chars.toLocaleString()} chars`,
          2500
        );
      },
    });

    // 4) Summarize with Azure OpenAI
    await setStage(
      'summarizing',
      72,
      `Summarizing ${transcription.transcript.length.toLocaleString()} chars with Azure OpenAI…`
    );
    const { summarizeTranscript } = await import('@/utils/azure/openai');
    let summaryResult = { summary: '', keyPoints: [] as string[], model: '' };
    try {
      summaryResult = await summarizeTranscript({
        transcript: transcription.transcript,
        lessonTitle: lessonData.name || lessonData.title,
        lessonDescription: lessonData.description,
      });
    } catch (sumErr) {
      console.error('[ai-process] summarization failed (continuing):', sumErr);
    }

    // 5) Upload MP3 + VTT to Firebase Storage
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

    // Duration came from the ffmpeg codecData event during extraction —
    // skip a separate ffprobe pass for speed.
    const audioDurationSeconds = extractedAudioDurationSeconds;

    await setStage('finalizing', 96, 'Saving everything on the lesson…');

    const captionsField = {
      ...(lessonData.captions || {}),
      [transcription.language]: {
        url: vttUrl,
        content: transcription.transcript,
      },
    };

    const update: Record<string, unknown> = {
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
      aiProcessingStage: 'completed',
      aiProcessingProgress: 100,
      aiProcessingMessage: 'All AI assets generated and saved.',
      aiProcessingError: null,
    };

    await lessonRef.update(update);

    return NextResponse.json({
      success: true,
      lessonId,
      courseId,
      audioUrl,
      vttUrl,
      transcription: transcription.transcript,
      transcriptionLanguage: transcription.language,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      audioDurationSeconds: audioDurationSeconds ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[ai-process] failed:', { message, stack, courseId, lessonId });
    try {
      await lessonRef.update({
        aiProcessingStatus: 'failed',
        aiProcessingStage: 'failed',
        aiProcessingMessage: `Failed: ${message.slice(0, 200)}`,
        aiProcessingError: message.slice(0, 500),
        captionsProcessing: false,
      });
    } catch (writeErr) {
      console.error('[ai-process] failed to record failure on lesson:', writeErr);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

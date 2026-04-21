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

  // Initialize Firebase Admin once.
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
      return NextResponse.json(
        { error: 'Firebase Admin credentials are not fully configured on the server.' },
        { status: 503 }
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  }

  const db = getFirestore();
  const bucket = getStorage().bucket();
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

  try {
    // 1) Download video
    await setStage('downloading', 5, 'Downloading the lesson video…');
    const res = await fetch(videoUrl);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
    }
    const arrayBuf = await res.arrayBuffer();
    await fs.promises.writeFile(videoPath, Buffer.from(arrayBuf));
    const videoBytes = arrayBuf.byteLength;

    // 2) Extract audio (WAV for Azure, MP3 for download/playback)
    await setStage(
      'extracting_audio',
      18,
      `Extracting audio (${(videoBytes / (1024 * 1024)).toFixed(1)} MB video → MP3 + WAV)…`
    );
    const ffmpegMod = await import('fluent-ffmpeg');
    const ffmpeg = (ffmpegMod as { default?: typeof ffmpegMod }).default || ffmpegMod;
    // Pin ffmpeg binary path from ffmpeg-static so it works in serverless.
    try {
      const ffStatic = await import('ffmpeg-static');
      const binPath = (ffStatic as { default?: string }).default || (ffStatic as unknown as string);
      if (binPath) {
        ffmpeg.setFfmpegPath(binPath);
      }
    } catch {
      /* fall back to system ffmpeg */
    }

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(wavPath);
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('96k')
        .audioChannels(1)
        .format('mp3')
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(mp3Path);
    });

    // 3) Transcribe with Azure Speech
    await setStage(
      'transcribing',
      35,
      `Transcribing audio with Azure Speech (${language})… this is the longest step.`
    );
    const { transcribeWavFile } = await import('@/utils/azure/speech');
    const transcription = await transcribeWavFile(wavPath, language);

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
    const vttObjectName = `lesson-assets/${courseId}/${lessonId}/captions.${language}.vtt`;

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

    // Probe audio duration via ffprobe (best effort)
    let audioDurationSeconds: number | undefined;
    try {
      audioDurationSeconds = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(mp3Path, (err: Error | null, data: any) => {
          if (err) return reject(err);
          resolve(Number(data?.format?.duration) || 0);
        });
      });
    } catch {
      /* ignore */
    }

    await setStage('finalizing', 96, 'Saving everything on the lesson…');

    const captionsField = {
      ...(lessonData.captions || {}),
      [language]: {
        url: vttUrl,
        content: transcription.transcript,
      },
    };

    const update: Record<string, unknown> = {
      audioUrl,
      audioFileName: 'audio.mp3',
      audioDurationSeconds: audioDurationSeconds ?? null,
      transcription: transcription.transcript,
      transcriptionLanguage: language,
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
      transcriptionLanguage: language,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
      audioDurationSeconds: audioDurationSeconds ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai-process] failed:', err);
    try {
      await lessonRef.update({
        aiProcessingStatus: 'failed',
        aiProcessingStage: 'failed',
        aiProcessingMessage: `Failed: ${message.slice(0, 200)}`,
        aiProcessingError: message.slice(0, 500),
        captionsProcessing: false,
      });
    } catch {
      /* ignore */
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

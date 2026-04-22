/**
 * POST /api/admin/lessons/translate
 *
 * Translates lesson content into one or more target locales using the
 * Azure OpenAI deployment (gpt-4.1-mini). For each target locale we:
 *   1. Translate text fields (name/description/content/summary/keyPoints/transcription/objectives/tags).
 *   2. Optionally translate the source-language WEBVTT captions and upload
 *      the translated VTT to Storage, registering it under
 *      `lesson.captions[targetLocale]`.
 *   3. Persist results under `lesson.translations[targetLocale]`.
 *
 * A `translationJobs/{jobId}` Firestore document tracks per-locale progress
 * so the admin UI can render an animated progress panel via onSnapshot.
 *
 * Body:
 *   {
 *     courseId: string,
 *     lessonId: string,
 *     targetLocales: string[],     // BCP-47 codes
 *     sourceLocale?: string,        // defaults to lesson.transcriptionLanguage or 'en'
 *     includeCaptions?: boolean,    // default true
 *     retranslate?: boolean,        // overwrite existing complete translations
 *   }
 *
 * Returns: 202 { jobId, locales: [...] }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { after } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { CONTENT_LOCALE_CODES, getContentLocale } from '@/config/locales';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface Body {
    courseId?: string;
    lessonId?: string;
    targetLocales?: string[];
    sourceLocale?: string;
    includeCaptions?: boolean;
    retranslate?: boolean;
}

export async function POST(req: NextRequest) {
    const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
    const { getStorage } = await import('firebase-admin/storage');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult.user!;

    const allowed = await checkRateLimit(`lesson-translate:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a minute and try again.' },
            { status: 429 }
        );
    }

    let body: Body;
    try {
        body = (await req.json()) as Body;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const courseId = body.courseId?.trim();
    const lessonId = body.lessonId?.trim();
    if (!courseId || !lessonId) {
        return NextResponse.json(
            { error: 'Missing required fields: courseId, lessonId' },
            { status: 400 }
        );
    }
    const requestedLocales = Array.isArray(body.targetLocales)
        ? Array.from(
            new Set(
                body.targetLocales
                    .map((l) => (typeof l === 'string' ? l.trim() : ''))
                    .filter((l) => l.length > 0)
            )
        )
        : [];
    if (requestedLocales.length === 0) {
        return NextResponse.json({ error: 'targetLocales must be a non-empty array' }, { status: 400 });
    }
    const unsupported = requestedLocales.filter((l) => !CONTENT_LOCALE_CODES.includes(l));
    if (unsupported.length > 0) {
        return NextResponse.json(
            { error: `Unsupported locales: ${unsupported.join(', ')}` },
            { status: 400 }
        );
    }
    if (requestedLocales.length > 12) {
        return NextResponse.json(
            { error: 'Translate at most 12 locales per request — split larger batches client-side.' },
            { status: 400 }
        );
    }

    const storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!getApps().length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            return NextResponse.json(
                { error: 'Firebase Admin credentials are not fully configured on the server.' },
                { status: 503 }
            );
        }
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            storageBucket: storageBucketName,
        });
    }

    const db = getFirestore();
    const lessonRef = db.doc(`courses/${courseId}/lessons/${lessonId}`);
    const lessonSnap = await lessonRef.get();
    if (!lessonSnap.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    const lessonData = lessonSnap.data() || {};
    const courseSnap = await db.doc(`courses/${courseId}`).get();
    const courseData = courseSnap.exists ? courseSnap.data() || {} : {};

    // Refuse a second active job for the same lesson.
    if (lessonData.currentTranslationJobId) {
        const existingSnap = await db.doc(`translationJobs/${lessonData.currentTranslationJobId}`).get();
        if (existingSnap.exists) {
            const ex = existingSnap.data() as { status?: string };
            if (ex?.status === 'queued' || ex?.status === 'processing') {
                return NextResponse.json(
                    {
                        error: 'A translation job is already running for this lesson. Cancel it first.',
                        jobId: lessonData.currentTranslationJobId,
                    },
                    { status: 409 }
                );
            }
        }
    }

    // Resolve source locale.
    const sourceLocale =
        body.sourceLocale ||
        getContentLocale(lessonData.transcriptionLanguage)?.code ||
        'en';

    // Filter out target == source, and (when not retranslating) already-fresh translations.
    const { hashLessonSource } = await import('@/utils/azure/translator');
    const sourceHash = hashLessonSource({
        name: lessonData.name,
        description: lessonData.description,
        content: lessonData.content,
        summary: lessonData.summary,
        keyPoints: lessonData.keyPoints,
        transcription: lessonData.transcription,
        objectives: lessonData.learningObjectives || lessonData.objectives,
        tags: lessonData.tags,
    });

    const localesToProcess = requestedLocales.filter((target) => {
        if (target === sourceLocale) return false;
        if (body.retranslate) return true;
        const existing = (lessonData.translations || {})[target];
        return !existing || existing.status !== 'complete' || existing.sourceHash !== sourceHash;
    });

    if (localesToProcess.length === 0) {
        return NextResponse.json(
            { skipped: true, message: 'All requested locales are already up to date.' },
            { status: 200 }
        );
    }

    const includeCaptions = body.includeCaptions !== false;

    const jobId = uuidv4();
    const now = Date.now();
    const jobRef = db.doc(`translationJobs/${jobId}`);

    const initialLocales: Record<string, { status: string; progress: number; message: string }> = {};
    for (const code of localesToProcess) {
        initialLocales[code] = { status: 'queued', progress: 0, message: 'Queued' };
    }

    await jobRef.set({
        jobId,
        kind: 'lesson',
        courseId,
        lessonId,
        sourceLocale,
        includeCaptions,
        retranslate: !!body.retranslate,
        targetLocales: localesToProcess,
        locales: initialLocales,
        status: 'queued',
        progress: 0,
        message: 'Queued',
        createdAt: now,
        startedAt: null,
        finishedAt: null,
        cancelRequested: false,
        createdBy: user.uid,
    });

    await lessonRef.update({
        currentTranslationJobId: jobId,
    });

    // Run the work in the background within this same invocation.
    after(async () => {
        const { translateLesson, translateVtt } = await import('@/utils/azure/translator');

        async function isCancelled(): Promise<boolean> {
            const s = await jobRef.get();
            return !!(s.data() as any)?.cancelRequested;
        }

        async function setLocale(code: string, patch: Record<string, unknown>) {
            await jobRef.update({
                [`locales.${code}.status`]: patch.status ?? FieldValue.delete(),
                ...(patch.progress !== undefined ? { [`locales.${code}.progress`]: patch.progress } : {}),
                ...(patch.message !== undefined ? { [`locales.${code}.message`]: patch.message } : {}),
                ...(patch.error !== undefined ? { [`locales.${code}.error`]: patch.error } : {}),
            });
        }

        await jobRef.update({ status: 'processing', startedAt: Date.now(), message: 'Translating…' });

        let completed = 0;
        const total = localesToProcess.length;
        let hadError = false;

        for (const target of localesToProcess) {
            if (await isCancelled()) {
                await jobRef.update({ status: 'cancelled', finishedAt: Date.now(), message: 'Cancelled' });
                await lessonRef.update({ currentTranslationJobId: FieldValue.delete() });
                return;
            }
            try {
                await setLocale(target, { status: 'processing', progress: 5, message: 'Translating text…' });

                const translation = await translateLesson({
                    lesson: {
                        name: lessonData.name,
                        description: lessonData.description,
                        content: lessonData.content,
                        summary: lessonData.summary,
                        keyPoints: lessonData.keyPoints,
                        transcription: lessonData.transcription,
                        objectives: lessonData.learningObjectives || lessonData.objectives,
                        tags: lessonData.tags,
                    },
                    targetLocale: target,
                    sourceLocale,
                    courseName: courseData.name || courseData.title,
                });

                let captionsTranslated = false;
                let translatedCaption: { url?: string; content?: string } | undefined;

                // Translate captions if a source VTT exists.
                const captions = (lessonData.captions || {}) as Record<string, { url?: string; content?: string }>;
                const sourceCaption =
                    captions[sourceLocale] ||
                    captions[getContentLocale(sourceLocale)?.speechCode || ''] ||
                    Object.values(captions).find((c) => c?.content);

                if (includeCaptions && sourceCaption?.content) {
                    await setLocale(target, { progress: 50, message: 'Translating captions (VTT)…' });
                    try {
                        const translatedVtt = await translateVtt({
                            vttContent: sourceCaption.content,
                            sourceLocale,
                            targetLocale: target,
                        });

                        // Upload to Firebase Storage.
                        if (storageBucketName) {
                            const bucket = getStorage().bucket(storageBucketName);
                            const objectName = `lesson-assets/${courseId}/${lessonId}/captions.${target}.vtt`;
                            const file = bucket.file(objectName);
                            await file.save(translatedVtt, {
                                metadata: { contentType: 'text/vtt; charset=utf-8' },
                                resumable: false,
                            });
                            await file.makePublic().catch(() => {/* ignore if uniform */ });
                            const url = `https://storage.googleapis.com/${bucket.name}/${objectName}`;
                            translatedCaption = { url, content: translatedVtt };
                            captionsTranslated = true;
                        } else {
                            // No storage bucket configured — keep inline.
                            translatedCaption = { content: translatedVtt };
                            captionsTranslated = true;
                        }
                    } catch (capErr) {
                        console.warn('[lesson-translate] caption translation failed', { target, err: (capErr as Error).message });
                    }
                }

                // Persist on lesson document.
                const lessonPatch: Record<string, unknown> = {
                    [`translations.${target}`]: { ...translation, captionsTranslated },
                };
                if (translatedCaption) {
                    lessonPatch[`captions.${target}`] = translatedCaption;
                }
                await lessonRef.update(lessonPatch);

                completed++;
                await setLocale(target, { status: 'complete', progress: 100, message: 'Done', error: null });
                await jobRef.update({
                    progress: Math.round((completed / total) * 100),
                    message: `Translated ${completed}/${total}`,
                });
            } catch (err) {
                hadError = true;
                const message = err instanceof Error ? err.message : String(err);
                console.error('[lesson-translate] locale failed', { target, err: message });
                await setLocale(target, { status: 'failed', message: 'Failed', error: message });
            }
        }

        await jobRef.update({
            status: hadError ? (completed > 0 ? 'partial' : 'failed') : 'completed',
            finishedAt: Date.now(),
            progress: 100,
            message: hadError ? `Done with errors (${completed}/${total})` : `All ${total} locales translated`,
        });
        await lessonRef.update({ currentTranslationJobId: FieldValue.delete() });
    });

    return NextResponse.json(
        { jobId, status: 'queued', locales: localesToProcess },
        { status: 202 }
    );
}

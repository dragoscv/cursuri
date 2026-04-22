/**
 * POST /api/admin/courses/translate
 *
 * Translates course-level content (name, description, fullDescription,
 * benefits, objectives, requirements, tags) into one or more target
 * locales using the Azure OpenAI deployment.
 *
 * Body:
 *   {
 *     courseId: string,
 *     targetLocales: string[],
 *     sourceLocale?: string,
 *     retranslate?: boolean,
 *   }
 *
 * Returns: 202 { jobId, locales }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { after } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { CONTENT_LOCALE_CODES } from '@/config/locales';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface Body {
    courseId?: string;
    targetLocales?: string[];
    sourceLocale?: string;
    retranslate?: boolean;
}

export async function POST(req: NextRequest) {
    const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult.user!;

    const allowed = await checkRateLimit(`course-translate:${user.uid}`, 30, 60_000);
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
    if (!courseId) {
        return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
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
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    }

    const db = getFirestore();
    const courseRef = db.doc(`courses/${courseId}`);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const courseData = courseSnap.data() || {};

    if (courseData.currentTranslationJobId) {
        const existingSnap = await db.doc(`translationJobs/${courseData.currentTranslationJobId}`).get();
        if (existingSnap.exists) {
            const ex = existingSnap.data() as { status?: string };
            if (ex?.status === 'queued' || ex?.status === 'processing') {
                return NextResponse.json(
                    {
                        error: 'A translation job is already running for this course. Cancel it first.',
                        jobId: courseData.currentTranslationJobId,
                    },
                    { status: 409 }
                );
            }
        }
    }

    const sourceLocale = body.sourceLocale || 'ro';

    const { hashCourseSource } = await import('@/utils/azure/translator');
    const sourceHash = hashCourseSource({
        name: courseData.name,
        description: courseData.description,
        fullDescription: courseData.fullDescription,
        benefits: courseData.benefits,
        objectives: courseData.objectives,
        requirements: courseData.requirements,
        tags: courseData.tags,
    });

    const localesToProcess = requestedLocales.filter((target) => {
        if (target === sourceLocale) return false;
        if (body.retranslate) return true;
        const existing = (courseData.translations || {})[target];
        return !existing || existing.status !== 'complete' || existing.sourceHash !== sourceHash;
    });

    if (localesToProcess.length === 0) {
        return NextResponse.json(
            { skipped: true, message: 'All requested locales are already up to date.' },
            { status: 200 }
        );
    }

    const jobId = uuidv4();
    const now = Date.now();
    const jobRef = db.doc(`translationJobs/${jobId}`);

    const initialLocales: Record<string, { status: string; progress: number; message: string }> = {};
    for (const code of localesToProcess) {
        initialLocales[code] = { status: 'queued', progress: 0, message: 'Queued' };
    }

    await jobRef.set({
        jobId,
        kind: 'course',
        courseId,
        sourceLocale,
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

    await courseRef.update({ currentTranslationJobId: jobId });

    after(async () => {
        const { translateCourse } = await import('@/utils/azure/translator');

        async function isCancelled(): Promise<boolean> {
            const s = await jobRef.get();
            return !!(s.data() as any)?.cancelRequested;
        }

        async function setLocale(code: string, patch: Record<string, unknown>) {
            await jobRef.update({
                ...(patch.status !== undefined ? { [`locales.${code}.status`]: patch.status } : {}),
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
                await courseRef.update({ currentTranslationJobId: FieldValue.delete() });
                return;
            }
            try {
                await setLocale(target, { status: 'processing', progress: 10, message: 'Translating…' });
                const translation = await translateCourse({
                    course: {
                        name: courseData.name,
                        description: courseData.description,
                        fullDescription: courseData.fullDescription,
                        benefits: courseData.benefits,
                        objectives: courseData.objectives,
                        requirements: courseData.requirements,
                        tags: courseData.tags,
                    },
                    targetLocale: target,
                    sourceLocale,
                });
                await courseRef.update({ [`translations.${target}`]: translation });
                completed++;
                await setLocale(target, { status: 'complete', progress: 100, message: 'Done', error: null });
                await jobRef.update({
                    progress: Math.round((completed / total) * 100),
                    message: `Translated ${completed}/${total}`,
                });
            } catch (err) {
                hadError = true;
                const message = err instanceof Error ? err.message : String(err);
                console.error('[course-translate] locale failed', { target, err: message });
                await setLocale(target, { status: 'failed', message: 'Failed', error: message });
            }
        }

        await jobRef.update({
            status: hadError ? (completed > 0 ? 'partial' : 'failed') : 'completed',
            finishedAt: Date.now(),
            progress: 100,
            message: hadError ? `Done with errors (${completed}/${total})` : `All ${total} locales translated`,
        });
        await courseRef.update({ currentTranslationJobId: FieldValue.delete() });
    });

    return NextResponse.json(
        { jobId, status: 'queued', locales: localesToProcess },
        { status: 202 }
    );
}

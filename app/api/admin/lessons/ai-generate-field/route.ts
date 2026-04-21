/**
 * POST /api/admin/lessons/ai-generate-field
 *
 * Generates a single lesson field with Azure OpenAI, grounded in the
 * lesson's transcript + summary that ai-process produced.
 *
 * Body:
 *   {
 *     courseId: string,
 *     lessonId: string,
 *     field: 'name' | 'description' | 'content' | 'objectives' | 'tags' | 'keywords' | 'summary',
 *     currentValue?: string,
 *     customInstruction?: string,
 *   }
 *
 * Returns: { value?: string, values?: string[], field, model }
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_FIELDS = new Set([
    'name',
    'description',
    'content',
    'objectives',
    'tags',
    'keywords',
    'summary',
]);

interface Body {
    courseId?: string;
    lessonId?: string;
    field?: string;
    currentValue?: string;
    customInstruction?: string;
}

export async function POST(req: NextRequest) {
    const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult.user!;

    const allowed = await checkRateLimit(`lesson-ai-field:${user.uid}`, 30, 60_000);
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
    const field = body.field?.trim();
    if (!courseId || !lessonId || !field) {
        return NextResponse.json(
            { error: 'Missing required fields: courseId, lessonId, field' },
            { status: 400 }
        );
    }
    if (!ALLOWED_FIELDS.has(field)) {
        return NextResponse.json({ error: `Unsupported field: ${field}` }, { status: 400 });
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
    const lessonSnap = await db.doc(`courses/${courseId}/lessons/${lessonId}`).get();
    if (!lessonSnap.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    const lesson = lessonSnap.data() || {};

    const courseSnap = await db.doc(`courses/${courseId}`).get();
    const course = courseSnap.exists ? courseSnap.data() || {} : {};

    if (!lesson.transcription && !lesson.summary) {
        return NextResponse.json(
            {
                error:
                    'This lesson has no transcript or summary yet. Run "Generate AI assets" first, then use the magic-wand buttons.',
            },
            { status: 409 }
        );
    }

    try {
        const { generateLessonField } = await import('@/utils/azure/openai');
        const result = await generateLessonField({
            field: field as Parameters<typeof generateLessonField>[0]['field'],
            currentValue: body.currentValue,
            customInstruction: body.customInstruction,
            context: {
                transcript: lesson.transcription,
                summary: lesson.summary,
                keyPoints: lesson.keyPoints,
                lessonName: lesson.name || lesson.title,
                lessonDescription: lesson.description,
                courseName: course.name || course.title,
            },
        });
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ai-generate-field] failed', { field, message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

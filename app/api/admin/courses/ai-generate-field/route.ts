/**
 * POST /api/admin/courses/ai-generate-field
 *
 * Generates a single COURSE-level field with Azure OpenAI, grounded in
 * every lesson of the course (titles, summaries, key points, transcript
 * excerpts).
 *
 * Body:
 *   {
 *     courseId: string,
 *     field: 'name' | 'description' | 'objectives' | 'requirements' | 'tags' | 'categories' | 'keywords' | 'badges',
 *     currentValue?: string,
 *     customInstruction?: string,
 *   }
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_FIELDS = new Set([
    'name',
    'description',
    'objectives',
    'requirements',
    'tags',
    'categories',
    'keywords',
    'badges',
]);

interface Body {
    courseId?: string;
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

    const allowed = await checkRateLimit(`course-ai-field:${user.uid}`, 30, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute and try again.' }, { status: 429 });
    }

    let body: Body;
    try { body = (await req.json()) as Body; }
    catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const courseId = body.courseId?.trim();
    const field = body.field?.trim();
    if (!courseId || !field) {
        return NextResponse.json({ error: 'Missing required fields: courseId, field' }, { status: 400 });
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
    const courseSnap = await db.doc(`courses/${courseId}`).get();
    if (!courseSnap.exists) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseSnap.data() || {};

    const lessonsSnap = await db.collection(`courses/${courseId}/lessons`).get();
    const lessons = lessonsSnap.docs
        .map((d) => d.data() as Record<string, unknown>)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((l) => ({
            name: typeof l.name === 'string' ? l.name : (typeof l.title === 'string' ? l.title : ''),
            description: typeof l.description === 'string' ? l.description : undefined,
            summary: typeof l.summary === 'string' ? l.summary : undefined,
            keyPoints: Array.isArray(l.keyPoints) ? (l.keyPoints as string[]).filter((k) => typeof k === 'string') : undefined,
            transcript: typeof l.transcription === 'string' ? l.transcription : undefined,
        }));

    const instructorName = typeof course.instructor === 'string'
        ? course.instructor
        : (course.instructor && typeof course.instructor === 'object' && typeof (course.instructor as Record<string, unknown>).name === 'string'
            ? (course.instructor as { name: string }).name
            : undefined);

    try {
        const { generateCourseField } = await import('@/utils/azure/openai');
        const result = await generateCourseField({
            field: field as Parameters<typeof generateCourseField>[0]['field'],
            currentValue: body.currentValue,
            customInstruction: body.customInstruction,
            context: {
                courseName: typeof course.name === 'string' ? course.name : undefined,
                courseDescription: typeof course.description === 'string' ? course.description : undefined,
                instructorName,
                difficulty: typeof course.level === 'string' ? course.level : undefined,
                duration: typeof course.duration === 'string' ? course.duration : undefined,
                lessons,
            },
        });
        return NextResponse.json({ success: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[course/ai-generate-field] failed', { field, message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

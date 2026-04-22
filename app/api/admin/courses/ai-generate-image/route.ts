/**
 * POST /api/admin/courses/ai-generate-image
 *
 * Generates a course cover image with Azure OpenAI Images (gpt-image-1):
 *   1. Builds an art-direction prompt from the course context (or uses an
 *      admin-supplied one).
 *   2. Renders a 1536x1024 PNG via the Images API.
 *   3. Uploads the bytes to Firebase Storage at
 *      `course-assets/<courseId>/cover-<timestamp>.png` and makes them public.
 *   4. Returns the public URL + the prompt that was used.
 *
 * Body:
 *   {
 *     courseId: string,
 *     customPrompt?: string,    // skip prompt-generation step if provided
 *     customStyle?: string,     // optional art-direction hint for prompt step
 *     size?: '1024x1024' | '1536x1024' | '1024x1536',
 *     quality?: 'low' | 'medium' | 'high' | 'auto'
 *   }
 */

import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface Body {
    courseId?: string;
    customPrompt?: string;
    customStyle?: string;
    size?: '1024x1024' | '1536x1024' | '1024x1536';
    quality?: 'low' | 'medium' | 'high' | 'auto';
}

export async function POST(req: NextRequest) {
    const { requireAdmin, checkRateLimit } = await import('@/utils/api/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getStorage } = await import('firebase-admin/storage');

    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult.user!;

    // Image generation is more expensive than text — tighter budget.
    const allowed = await checkRateLimit(`course-ai-image:${user.uid}`, 6, 60_000);
    if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded for image generation. Please wait a minute.' }, { status: 429 });
    }

    let body: Body;
    try { body = (await req.json()) as Body; }
    catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const courseId = body.courseId?.trim();
    if (!courseId) {
        return NextResponse.json({ error: 'Missing required field: courseId' }, { status: 400 });
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
        .slice(0, 30)
        .map((l) => ({
            name: typeof l.name === 'string' ? l.name : (typeof l.title === 'string' ? l.title : ''),
            summary: typeof l.summary === 'string' ? l.summary : undefined,
        }));

    const courseName = typeof course.name === 'string' ? course.name : undefined;
    const courseDescription = typeof course.description === 'string' ? course.description : undefined;
    const difficulty = typeof course.level === 'string' ? course.level : undefined;
    const tags = Array.isArray(course.tags)
        ? (course.tags as unknown[]).filter((t): t is string => typeof t === 'string')
        : undefined;

    try {
        const { generateCourseImagePrompt, generateCourseImage } = await import('@/utils/azure/openai');

        const prompt = body.customPrompt && body.customPrompt.trim().length > 10
            ? body.customPrompt.trim()
            : (await generateCourseImagePrompt({
                courseName,
                courseDescription,
                difficulty,
                tags,
                lessons,
                customStyle: body.customStyle,
            })).prompt;

        const image = await generateCourseImage({
            prompt,
            size: body.size || '1536x1024',
            quality: body.quality || 'high',
        });

        // Upload to Firebase Storage as a public file.
        const bucket = getStorage().bucket();
        const objectName = `course-assets/${courseId}/cover-${Date.now()}.png`;
        const file = bucket.file(objectName);
        await file.save(image.bytes, {
            metadata: {
                contentType: image.contentType,
                cacheControl: 'public, max-age=31536000, immutable',
            },
            resumable: false,
        });
        await file.makePublic();
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${objectName}`;

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt,
            size: image.size,
            model: image.model,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[course/ai-generate-image] failed', { message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

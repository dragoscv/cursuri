import { NextRequest, NextResponse } from 'next/server';
import { getLessonById, getCourseLessons } from '@/utils/firebase/server';
import { checkRateLimit } from '@/utils/api/auth';
import { logAPIAccess } from '@/utils/auditLog';

/**
 * API endpoint to sync lesson data
 * This helps resolve issues when directly accessing lesson URLs
 *
 * Security:
 * - Public endpoint (no auth required for lesson existence check)
 * - Rate limited to 60 requests per minute per IP
 * - Does not return sensitive lesson content
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting by IP address for public endpoint
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitAllowed = await checkRateLimit(`sync-lesson:${ip}`, 60, 60000);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    // Validate required parameters
    if (!courseId || !lessonId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate parameter format (basic validation)
    if (courseId.length < 10 || lessonId.length < 10) {
      return NextResponse.json(
        {
          error: 'Invalid parameter format',
          success: false,
        },
        { status: 400 }
      );
    }

    // First try to get the specific lesson
    let lesson = await getLessonById(courseId, lessonId);

    // If not found, load all lessons for the course
    if (!lesson) {
      const allLessons = await getCourseLessons(courseId);

      // Check if the lesson exists in the returned collection
      if (allLessons[lessonId]) {
        lesson = allLessons[lessonId];
      }
    }

    const response = NextResponse.json({
      success: !!lesson,
      lessonExists: !!lesson,
      courseId,
      lessonId,
    });

    // Log API access (only if lesson not found, as per API access logging policy)
    if (!lesson) {
      await logAPIAccess('/api/sync-lesson', request, undefined, 404);
    }

    return response;
  } catch (error) {
    // This indicates a real problem and should be logged as an error
    console.error('Sync-lesson API: Unexpected error:', error);

    // Log API error
    await logAPIAccess('/api/sync-lesson', request, undefined, 500);

    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

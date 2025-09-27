import { NextRequest, NextResponse } from 'next/server';
import { getLessonById, getCourseLessons } from '@/utils/firebase/server';

/**
 * API endpoint to sync lesson data
 * This helps resolve issues when directly accessing lesson URLs
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const courseId = searchParams.get('courseId');
        const lessonId = searchParams.get('lessonId');

        // Validate required parameters
        if (!courseId || !lessonId) {
            // Log for debugging but this is expected behavior for malformed requests
            console.log(`Sync-lesson API: Missing required parameters. courseId: ${courseId}, lessonId: ${lessonId}`);
            return NextResponse.json({
                error: 'Missing required parameters',
                success: false
            }, { status: 400 });
        }

        // Validate parameter format (basic validation)
        if (courseId.length < 10 || lessonId.length < 10) {
            console.log(`Sync-lesson API: Invalid parameter format. courseId: ${courseId}, lessonId: ${lessonId}`);
            return NextResponse.json({
                error: 'Invalid parameter format',
                success: false
            }, { status: 400 });
        }

        // First try to get the specific lesson
        let lesson = await getLessonById(courseId, lessonId);

        // If not found, load all lessons for the course
        if (!lesson) {
            console.log(`Sync-lesson API: Lesson ${lessonId} not found directly. Loading all course lessons...`);
            const allLessons = await getCourseLessons(courseId);

            // Check if the lesson exists in the returned collection
            if (allLessons[lessonId]) {
                lesson = allLessons[lessonId];
                console.log('Sync-lesson API: Found lesson in complete course lessons');
            } else {
                // This is expected behavior for non-existent lessons
                console.log(`Sync-lesson API: Lesson ${lessonId} does not exist in course ${courseId}`);
            }
        }

        return NextResponse.json({
            success: !!lesson,
            lessonExists: !!lesson,
            courseId,
            lessonId
        });
    } catch (error) {
        // This indicates a real problem and should be logged as an error
        console.error('Sync-lesson API: Unexpected error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            success: false
        }, { status: 500 });
    }
}

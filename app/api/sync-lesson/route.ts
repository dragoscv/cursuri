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

        if (!courseId || !lessonId) {
            return NextResponse.json({
                error: 'Missing required parameters',
                success: false
            }, { status: 400 });
        }

        // First try to get the specific lesson
        let lesson = await getLessonById(courseId, lessonId);

        // If not found, load all lessons for the course
        if (!lesson) {
            console.log(`Lesson ${lessonId} not found directly. Loading all course lessons...`);
            const allLessons = await getCourseLessons(courseId);

            // Check if the lesson exists in the returned collection
            if (allLessons[lessonId]) {
                lesson = allLessons[lessonId];
                console.log('Found lesson in complete course lessons');
            }
        }

        return NextResponse.json({
            success: !!lesson,
            lessonExists: !!lesson,
            courseId,
            lessonId
        });
    } catch (error) {
        console.error('Error in sync-lesson API:', error);
        return NextResponse.json({
            error: 'Internal server error',
            success: false
        }, { status: 500 });
    }
}

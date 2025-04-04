import React from 'react';
import Link from 'next/link';
import { Lesson } from '../../types';
// ...import other necessary dependencies...

interface LessonNavigationProps {
    courseId: string;
    currentLessonId: string;
    previousLesson: Lesson | null;
    nextLesson: Lesson | null;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
    courseId,
    currentLessonId,
    previousLesson,
    nextLesson
}) => {
    return (
        <div className="flex justify-between mt-8">
            {previousLesson ? (
                <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
                    <button className="btn btn-outline">
                        ← Previous: {previousLesson.title}
                    </button>
                </Link>
            ) : (
                <div></div>
            )}

            {nextLesson && (
                <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                    <button className="btn btn-primary">
                        Next: {nextLesson.title} →
                    </button>
                </Link>
            )}
        </div>
    );
};

export default LessonNavigation;

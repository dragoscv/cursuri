import React from 'react';
import Link from 'next/link';
import { Lesson, Course } from '../../types';
// ...import other necessary dependencies...

interface LessonsListProps {
    lessons: Lesson[];
    course: Course;
    courseId: string;
}

export const LessonsList: React.FC<LessonsListProps> = ({ lessons, course, courseId }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Course Lessons</h2>

            {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                    <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                        {/* ...existing lesson list item content... */}
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default LessonsList;

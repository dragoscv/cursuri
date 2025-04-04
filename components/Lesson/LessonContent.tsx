import React from 'react';
import { Lesson } from '../../types';
// ...import other necessary dependencies...

interface LessonContentProps {
    lesson: Lesson;
}

export const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>

            <div className="prose dark:prose-invert max-w-none">
                {/* ...existing lesson content... */}
                {lesson.videoUrl && (
                    <div className="aspect-video mb-6">
                        {/* ...video player implementation... */}
                    </div>
                )}

                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
        </div>
    );
};

export default LessonContent;

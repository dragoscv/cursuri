import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LessonsList({ lessons }: any) {
    const params = useParams();
    const courseId = params.courseId;

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-10">
                <p>No lessons found.</p>
            </div>
        );
    }

    // Sort lessons by their order property to ensure consistency with admin view
    const sortedLessons = [...lessons].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });

    return (
        <div className="grid grid-cols-1 gap-4 p-4">
            {sortedLessons.map((lesson: any) => (
                <div key={lesson.id} className="bg-[color:var(--ai-card-bg)] rounded-lg p-4 shadow-md">
                    <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-[color:var(--ai-primary)]">
                            {lesson.title}
                        </h3>
                    </Link>
                    <p className="text-[color:var(--ai-muted)]">{lesson.description}</p>
                </div>
            ))}
        </div>
    );
}

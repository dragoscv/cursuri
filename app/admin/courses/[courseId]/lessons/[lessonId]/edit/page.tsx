'use client';

import LessonForm from "@/components/Course/Form/LessonForm";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditLessonPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Lesson</h1>
                <Link
                    href={`/admin/courses/${courseId}`}
                    replace
                    scroll={false}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Back to Course
                </Link>
            </div>

            <Card className="shadow-md">
                <CardBody>
                    <LessonForm courseId={courseId} lessonId={lessonId} />
                </CardBody>
            </Card>
        </div>
    );
}
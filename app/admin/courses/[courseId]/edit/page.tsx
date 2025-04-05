'use client';

import CourseForm from "@/components/Course/Form/CourseForm";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
                <Link
                    href="/admin/courses"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Back to All Courses
                </Link>
            </div>

            <Card className="shadow-md">
                <CardBody>
                    <CourseForm courseId={courseId} />
                </CardBody>
            </Card>
        </div>
    );
}
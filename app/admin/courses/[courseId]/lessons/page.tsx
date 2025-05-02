"use client";
import React, { useContext, useCallback } from "react";
import { AppContext } from "@/components/AppContext";
import LessonsTable from "@/components/Admin/LessonsTable";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function AdminLessonsListPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const context = useContext(AppContext);
    const lessons = context?.lessons?.[courseId] ? Object.values(context.lessons[courseId]) : [];

    const handleEdit = useCallback((lessonId: string) => {
        router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`);
    }, [router, courseId]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Lessons</h1>
                <Button color="primary" onPress={() => router.push(`/admin/courses/${courseId}/lessons/add`)}>
                    Add Lesson
                </Button>
            </div>
            <LessonsTable lessons={lessons} courseId={courseId} onEdit={handleEdit} />
        </div>
    );
}

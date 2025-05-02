'use client';

import AddLesson from "@/components/Course/AddLesson";
import { Card, CardBody } from "@heroui/react";
import { useParams } from "next/navigation";

export default function EditLessonPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    return (
        <div className="max-w-7xl mx-auto px-4">            <Card className="shadow-md">
            <CardBody>
                <AddLesson courseId={courseId} lessonId={lessonId} onClose={() => { }} />
            </CardBody>
        </Card>
        </div>
    );
}
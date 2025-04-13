'use client';

import AddLesson from "@/components/Course/AddLesson";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AddLessonPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    return (
        <div className="max-w-7xl mx-auto px-4">

            <Card className="shadow-md">
                <CardBody>
                    <AddLesson courseId={courseId} />
                </CardBody>
            </Card>
        </div>
    );
}
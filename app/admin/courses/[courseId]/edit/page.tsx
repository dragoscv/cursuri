'use client';

import AddCourse from "@/components/Course/AddCourse";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditCoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;

    return (
        <div className="max-w-7xl mx-auto px-4">

            <Card className="shadow-md">                <CardBody>
                <AddCourse courseId={courseId} onClose={() => { }} />
            </CardBody>
            </Card>
        </div>
    );
}
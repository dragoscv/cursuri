'use client';

import AddCourse from "@/components/Course/AddCourse";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";

export default function AddCoursePage() {
    return (
        <div className="max-w-7xl mx-auto px-4">


            <Card className="shadow-md">                <CardBody>
                <AddCourse onClose={() => { }} />
            </CardBody>
            </Card>
        </div>
    );
}
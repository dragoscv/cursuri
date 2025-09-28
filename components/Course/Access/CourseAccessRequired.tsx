import React from 'react';
import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import { FiBookOpen } from '@/components/icons/FeatherIcons';
import Link from 'next/link';

interface CourseAccessRequiredProps {
    courseId: string;
}

export default function CourseAccessRequired({ courseId }: CourseAccessRequiredProps) {
    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-col items-center gap-3">
                    <FiBookOpen className="text-4xl text-primary-500" />
                    <h1 className="text-2xl font-bold text-center">Course Access Required</h1>
                </CardHeader>
                <CardBody className="text-center">
                    <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-6">
                        You need to purchase this course to access the lessons.
                    </p>
                    <Link href={`/courses/${courseId}`}>
                        <Button color="primary" size="lg">
                            Go to Course Page
                        </Button>
                    </Link>
                </CardBody>
            </Card>
        </div>
    );
}
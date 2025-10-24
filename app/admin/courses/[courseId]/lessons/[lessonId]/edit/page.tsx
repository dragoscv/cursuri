'use client';

import AddLesson from '@/components/Course/AddLesson';
import { Card, CardBody } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const handleClose = () => {
    router.push(`/admin/courses/${courseId}/lessons`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Card className="shadow-md">
        <CardBody>
          <AddLesson courseId={courseId} lessonId={lessonId} onClose={handleClose} />
        </CardBody>
      </Card>
    </div>
  );
}

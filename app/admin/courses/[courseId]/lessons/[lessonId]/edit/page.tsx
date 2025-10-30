'use client';

import AddLesson from '@/components/Course/AddLesson';
import { Card, CardBody } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClose = () => {
    router.push(`/admin/courses/${courseId}/lessons`);
  };

  const handleSave = () => {
    // Refresh the form to show updated data
    setRefreshKey((prev) => prev + 1);
    // Optionally show a success message
    console.log('Lesson updated successfully, staying on page');
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Card className="shadow-md">
        <CardBody>
          <AddLesson
            key={refreshKey}
            courseId={courseId}
            lessonId={lessonId}
            onClose={handleClose}
            onSave={handleSave}
          />
        </CardBody>
      </Card>
    </div>
  );
}

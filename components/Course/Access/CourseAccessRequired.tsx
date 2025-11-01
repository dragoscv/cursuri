import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiBookOpen } from '@/components/icons/FeatherIcons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CourseAccessRequiredProps {
  courseId: string;
}

export default function CourseAccessRequired({ courseId }: CourseAccessRequiredProps) {
  const t = useTranslations('courses.courseAccessRequired');
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center gap-3">
          <FiBookOpen className="text-4xl text-primary-500" />
          <h1 className="text-2xl font-bold text-center">{t('title')}</h1>
        </CardHeader>
        <CardBody className="text-center">
          <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mb-6">
            {t('message')}
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button color="primary" size="lg">
              {t('goToCourse')}
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

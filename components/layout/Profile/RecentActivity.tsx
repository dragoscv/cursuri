import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiCalendar, FiBook, FiChevronRight } from '@/components/icons/FeatherIcons';
import Link from 'next/link';

interface ActivityItem {
  type: string;
  courseId: string;
  lessonId?: string;
  courseName: string;
  lessonName?: string;
  date: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations('profile.recentActivity');

  return (
    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-secondary)] via-[color:var(--ai-accent)] to-[color:var(--ai-primary)]"></div>
      <CardBody className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-[color:var(--ai-secondary)]/10">
            <FiCalendar className="text-[color:var(--ai-secondary)]" />
          </div>
          {t('title')}
        </h2>

        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg border border-[color:var(--ai-card-border)]/10 bg-[color:var(--ai-card-bg)]/50 hover:bg-[color:var(--ai-card-bg)] transition-all duration-200 hover:shadow-sm group"
              >
                <div className="rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 p-2.5 flex-shrink-0 group-hover:from-[color:var(--ai-primary)]/30 group-hover:to-[color:var(--ai-secondary)]/30 transition-all duration-300">
                  <FiBook className="h-5 w-5 text-[color:var(--ai-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[color:var(--ai-foreground)]">
                    {activity.lessonName
                      ? `${t('continued')} "${activity.lessonName}"`
                      : `${t('accessed')} "${activity.courseName}"`}
                  </p>
                  <p className="text-xs text-[color:var(--ai-muted)] truncate">
                    {t('courseLabel')}: {activity.courseName}
                  </p>
                  <p className="text-xs text-[color:var(--ai-muted)] flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ai-secondary)]/50"></span>
                    {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
                  </p>
                </div>
                <Link
                  href={`/courses/${activity.courseId}${activity.lessonId ? `/lessons/${activity.lessonId}` : ''}`}
                  className="group-hover:translate-x-0.5 transition-transform duration-300"
                >
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    className="bg-[color:var(--ai-card-bg)]/80 border border-[color:var(--ai-card-border)]/20 rounded-full"
                  >
                    <FiChevronRight className="text-[color:var(--ai-primary)]" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center justify-center mb-3 p-3 rounded-full bg-[color:var(--ai-primary)]/10">
              <FiBook className="h-6 w-6 text-[color:var(--ai-primary)]" />
            </div>
            <p className="text-[color:var(--ai-foreground)] font-medium mb-1">{t('noActivity')}</p>
            <p className="text-[color:var(--ai-muted)] text-sm mb-4">{t('noActivityDesc')}</p>{' '}
            <Link href="/courses">
              <Button
                size="sm"
                color="primary"
                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium rounded-lg shadow-md hover:shadow-[0_4px_12px_-4px_rgba(var(--ai-primary-rgb),0.5)] transition-all duration-300 hover:-translate-y-0.5"
              >
                {t('browseCourses')}
              </Button>
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

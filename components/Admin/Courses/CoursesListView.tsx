import React from 'react';
import Link from 'next/link';
import { Card, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { CourseWithPriceProduct } from '@/types';

interface CoursesListViewProps {
  courses: Record<string, CourseWithPriceProduct>;
  formatPrice: (course: CourseWithPriceProduct) => string;
  onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}

export default function CoursesListView({
  courses,
  formatPrice,
  onViewCourse,
  onEditCourse,
  onManageLessons,
}: CoursesListViewProps) {
  return (
    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden hover:shadow-[color:var(--ai-primary)]/5 transition-all">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--ai-card-border)]/60">
          <thead className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider"
              >
                Course Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[color:var(--ai-card-bg)]/80 divide-y divide-[color:var(--ai-card-border)]/40">
            {Object.values(courses).map((course: CourseWithPriceProduct) => (
              <tr
                key={course.id}
                className="hover:bg-[color:var(--ai-primary)]/5 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[color:var(--ai-foreground)]">
                    {course.name}
                  </div>
                  {course.description && (
                    <div className="text-sm text-[color:var(--ai-muted)] truncate max-w-xs">
                      {course.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Chip color={course.status === 'active' ? 'success' : 'warning'} size="sm">
                    {course.status || 'draft'}
                  </Chip>
                </td>{' '}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--ai-foreground)] font-medium">
                  {formatPrice(course)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {' '}
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                        aria-label={`Edit ${course.title}`}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button
                        size="sm"
                        color="default"
                        variant="flat"
                        className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                        aria-label={`View lessons for ${course.title}`}
                      >
                        View Lessons
                      </Button>
                    </Link>
                    {onManageLessons && (
                      <Link href={`/admin/courses/${course.id}/lessons`}>
                        <Button
                          size="sm"
                          color="default"
                          variant="flat"
                          className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                          aria-label={`Manage lessons for ${course.title}`}
                        >
                          Manage Lessons
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

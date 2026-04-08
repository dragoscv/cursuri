import React from 'react';
import Link from 'next/link';
import { Card, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { CourseWithPriceProduct } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CoursesListViewProps {
  courses: CourseWithPriceProduct[] | Record<string, CourseWithPriceProduct>;
  formatPrice: (course: CourseWithPriceProduct) => string;
  onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}

function SortableRow({
  course,
  index,
  formatPrice,
  onEditCourse,
  onManageLessons,
}: {
  course: CourseWithPriceProduct;
  index: number;
  formatPrice: (course: CourseWithPriceProduct) => string;
  onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-[color:var(--ai-primary)]/5 transition-colors duration-200"
    >
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] p-1"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>
      <td className="px-3 py-4 text-center text-sm font-mono text-[color:var(--ai-muted)] w-10">
        {index + 1}
      </td>
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
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {(course as any).badges?.map((badge: string) => (
            <Chip key={badge} size="sm" variant="flat" color="secondary" className="text-xs">
              {badge}
            </Chip>
          ))}
          {!(course as any).badges?.length && (
            <span className="text-xs text-[color:var(--ai-muted)]">—</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--ai-foreground)] font-medium">
        {formatPrice(course)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-2">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
              aria-label={`Edit ${course.name}`}
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
              aria-label={`View lessons for ${course.name}`}
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
                aria-label={`Manage lessons for ${course.name}`}
              >
                Manage Lessons
              </Button>
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function CoursesListView({
  courses,
  formatPrice,
  onViewCourse,
  onEditCourse,
  onManageLessons,
}: CoursesListViewProps) {
  const courseArray = Array.isArray(courses) ? courses : Object.values(courses);

  return (
    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden hover:shadow-[color:var(--ai-primary)]/5 transition-all">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--ai-card-border)]/60">
          <thead className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
            <tr>
              <th scope="col" className="px-3 py-3 w-10"></th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider w-10"
              >
                #
              </th>
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
                Badges
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
            {courseArray.map((course, index) => (
              <SortableRow
                key={course.id}
                course={course}
                index={index}
                formatPrice={formatPrice}
                onEditCourse={onEditCourse}
                onManageLessons={onManageLessons}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

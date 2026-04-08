import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { CourseWithPriceProduct } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CoursesGridViewProps {
  courses: CourseWithPriceProduct[] | Record<string, CourseWithPriceProduct>;
  formatPrice: (course: CourseWithPriceProduct) => string;
  onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
  onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}

function SortableCard({
  course,
  formatPrice,
  onViewCourse,
  onEditCourse,
  onManageLessons,
}: {
  course: CourseWithPriceProduct;
  formatPrice: (course: CourseWithPriceProduct) => string;
  onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
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
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-[color:var(--ai-primary)]/5 transition-all border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80">
        <CardBody className="cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] p-1 shrink-0"
                aria-label="Drag to reorder"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <h3
                className="text-xl font-semibold text-[color:var(--ai-foreground)] line-clamp-1 cursor-pointer"
                onClick={() => onViewCourse(course)}
              >
                {course.name}
              </h3>
            </div>
            <Chip color={course.status === 'active' ? 'success' : 'warning'} size="sm">
              {course.status || 'draft'}
            </Chip>
          </div>
          {(course as any).badges?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(course as any).badges.map((badge: string) => (
                <Chip key={badge} size="sm" variant="flat" color="secondary" className="text-xs">
                  {badge}
                </Chip>
              ))}
            </div>
          )}
          <p
            className="text-[color:var(--ai-muted)] mb-4 line-clamp-2 cursor-pointer"
            onClick={() => onViewCourse(course)}
          >
            {course.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="text-sm font-medium text-[color:var(--ai-foreground)]">
              {formatPrice(course)}
            </div>
            <div className="flex items-center gap-2">
              {course.repoUrl && (
                <a
                  href={course.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--ai-primary)] hover:underline text-sm flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Repo
                </a>
              )}
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
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function CoursesGridView({
  courses,
  formatPrice,
  onViewCourse,
  onEditCourse,
  onManageLessons,
}: CoursesGridViewProps) {
  const courseArray = Array.isArray(courses) ? courses : Object.values(courses);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courseArray.map((course) => (
        <SortableCard
          key={course.id}
          course={course}
          formatPrice={formatPrice}
          onViewCourse={onViewCourse}
          onEditCourse={onEditCourse}
          onManageLessons={onManageLessons}
        />
      ))}
    </div>
  );
}

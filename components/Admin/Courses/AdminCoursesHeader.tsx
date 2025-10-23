import React from 'react';
import Button from '@/components/ui/Button';

interface AdminCoursesHeaderProps {
  onAddCourse: () => void;
}

export default function AdminCoursesHeader({ onAddCourse }: AdminCoursesHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[color:var(--ai-card-border)]/50 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">
            Course Management
          </h1>
          <p className="text-[color:var(--ai-muted)]">
            Manage your courses, add new content, and edit existing courses.
          </p>
        </div>{' '}
        <Button
          color="primary"
          onClick={onAddCourse}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
          startContent={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          aria-label="Add new course"
        >
          Add Course
        </Button>
      </div>
    </div>
  );
}

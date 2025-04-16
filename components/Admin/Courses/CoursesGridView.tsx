import React from 'react';
import { Card, CardBody, Chip, Button } from '@heroui/react';
import { CourseWithPriceProduct } from '@/types';

interface CoursesGridViewProps {
    courses: Record<string, CourseWithPriceProduct>;
    formatPrice: (course: CourseWithPriceProduct) => string;
    onViewCourse: (course: CourseWithPriceProduct) => void;
    onEditCourse: (course: CourseWithPriceProduct) => void;
}

export default function CoursesGridView({
    courses,
    formatPrice,
    onViewCourse,
    onEditCourse
}: CoursesGridViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(courses).map((course: CourseWithPriceProduct) => (<Card key={course.id} className="hover:shadow-[color:var(--ai-primary)]/5 transition-all border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80">
                <CardBody onClick={() => onViewCourse(course)} className="cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-[color:var(--ai-foreground)] line-clamp-1">{course.name}</h3>
                        <Chip
                            color={course.status === "active" ? "success" : "warning"}
                            size="sm"
                        >
                            {course.status || "draft"}
                        </Chip>
                    </div>
                    <p className="text-[color:var(--ai-muted)] mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                    </p>                        <div className="flex items-center justify-between mt-auto">
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
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Repo
                                </a>
                            )}                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCourse(course);
                                }}
                                className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
            ))}
        </div>
    );
}
'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Chip, Divider } from '@heroui/react';
import Button from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { doc, collection, updateDoc, writeBatch, getFirestore } from 'firebase/firestore';
import { firebaseApp, firestoreDB } from '@/utils/firebase/firebase.config';

// Sortable item component
const SortableLesson = ({ lesson, index, handleEditLesson }: { lesson: Lesson, index: number, handleEditLesson: (lesson: Lesson) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
    }; return (
        <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className="hover:bg-[color:var(--ai-primary)]/5 transition-colors duration-200">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--ai-muted)]">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[color:var(--ai-primary)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                    {index + 1}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-[color:var(--ai-foreground)]">{lesson.name}</div>
                {lesson.description && (
                    <div className="text-sm text-[color:var(--ai-muted)] truncate max-w-xs">
                        {lesson.description}
                    </div>
                )}
                {lesson.repoUrl && (
                    <div className="mt-1">
                        <a
                            href={lesson.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[color:var(--ai-primary)] hover:underline text-xs flex items-center group"
                        >
                            <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Repository
                        </a>
                    </div>
                )}            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Chip
                    color={lesson.status === "active" ? "success" : "warning"}
                    size="sm"
                    className={lesson.status === "active"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                    }
                >
                    {lesson.status || "draft"}
                </Chip>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">                    <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20 transition-colors rounded-full"
                    onClick={() => handleEditLesson(lesson)}
                >
                    Edit
                </Button>
                </div>
            </td>
        </tr>
    );
};

export default function AdminCourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { courses, lessons, isAdmin, user, getCourseLessons } = context;
    const course = courses[courseId];
    const [sortedLessons, setSortedLessons] = useState<Lesson[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Set up DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Redirect if not admin
    useEffect(() => {
        if (user && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, user, router]);

    // Fetch course lessons
    useEffect(() => {
        if (courseId) {
            getCourseLessons(courseId);
        }
    }, [courseId, getCourseLessons]);

    // Sort lessons whenever the lessons object changes
    useEffect(() => {
        if (lessons[courseId]) {
            const lessonArray = Object.values(lessons[courseId]).sort(
                (a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0)
            );
            setSortedLessons(lessonArray);
        }
    }, [lessons, courseId]); const handleAddLesson = () => {
        router.push(`/admin/courses/${courseId}/lessons/add`, { scroll: false });
    };

    const handleEditLesson = (lesson: Lesson) => {
        router.push(`/admin/courses/${courseId}/lessons/${lesson.id}/edit`, { scroll: false });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setIsSaving(true);

            // Find the old and new indices
            const oldIndex = sortedLessons.findIndex(item => item.id === active.id);
            const newIndex = sortedLessons.findIndex(item => item.id === over.id);

            // Create a new array with the updated order
            const newSortedLessons = arrayMove([...sortedLessons], oldIndex, newIndex);

            // Update the UI immediately
            setSortedLessons(newSortedLessons);

            // Then update the database with the new order
            try {
                const db = firestoreDB;
                const batch = writeBatch(db);

                // Use the newly created array with updated order
                newSortedLessons.forEach((lesson, index) => {
                    const lessonRef = doc(db, `courses/${courseId}/lessons/${lesson.id}`);
                    batch.update(lessonRef, { order: index });
                });

                await batch.commit();
                console.log("Successfully updated lesson order in database");
            } catch (error) {
                console.error("Error updating lesson order:", error);
                // If there's an error, refresh the lessons to get the correct order
                getCourseLessons(courseId);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const formatPrice = (): string => {
        if (course?.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
            const amount = course.priceProduct.prices[0].unit_amount / 100;
            const currency = course.priceProduct.prices[0].currency || 'RON';
            return amount.toLocaleString('ro-RO', {
                style: 'currency',
                currency: currency,
            });
        }
        return 'Price not available';
    }; if (!course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Course Not Found</h1>                    <Link
                        href="/admin/courses"
                        replace
                        scroll={false}
                    >
                        <Button
                            variant="primary"
                            size="md"
                        >
                            Back to Courses
                        </Button>
                    </Link>
                </div>
                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <h2 className="text-xl font-semibold text-[color:var(--ai-foreground)]">Not Found</h2>
                    </div>
                    <CardBody>
                        <div className="text-center py-8 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-[color:var(--ai-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M12 14a3 3 0 100-6 3 3 0 000 6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[color:var(--ai-muted)]">The requested course could not be found.</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">            <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent truncate max-w-2xl">{course.name}</h1>
            <div className="flex gap-3">
                <Link
                    href={`/admin/courses/${courseId}/edit`}
                    replace
                    scroll={false}
                >
                    <Button
                        variant="primary"
                        size="md"
                        startContent={(
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        )}
                    >
                        Edit Course
                    </Button>
                </Link>
                <Link
                    href="/admin/courses"
                    replace
                    scroll={false}
                >
                    <Button
                        variant="bordered"
                        size="md"
                    >
                        Back to Courses
                    </Button>
                </Link>
            </div>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">                <div className="lg:col-span-2">
                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                    <div className="px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                        <h2 className="text-xl font-semibold text-[color:var(--ai-foreground)] flex items-center">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/20 mr-2">
                                <span className="text-[color:var(--ai-primary)] font-bold text-sm">ℹ</span>
                            </div>
                            Course Details
                        </h2>
                    </div>
                    <CardBody>
                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--ai-muted)] mb-1">Name</label>
                                    <p className="text-[color:var(--ai-foreground)]">{course.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--ai-muted)] mb-1">Status</label>
                                    <Chip
                                        color={course.status === "active" ? "success" : "warning"}
                                        size="sm"
                                        className={course.status === "active"
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/30"
                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30"
                                        }
                                    >
                                        {course.status || "draft"}
                                    </Chip>
                                </div>
                            </div>                                <div className="mb-4">
                                <label className="block text-sm font-medium text-[color:var(--ai-muted)] mb-1">Description</label>
                                <p className="text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/50 p-3 rounded-lg border border-[color:var(--ai-card-border)]/30">{course.description || "No description provided."}</p>
                            </div>

                            {course.repoUrl && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[color:var(--ai-muted)] mb-1">Repository URL</label>
                                    <a
                                        href={course.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[color:var(--ai-primary)] hover:underline break-all flex items-center group"
                                    >
                                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        {course.repoUrl}
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--ai-muted)] mb-1">Price</label>
                                <p className="text-[color:var(--ai-foreground)] font-medium bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 inline-block px-3 py-1 rounded-lg">{formatPrice()}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>                <div className="lg:col-span-1">
                    <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                        <div className="px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                            <h2 className="text-xl font-semibold text-[color:var(--ai-foreground)] flex items-center">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[color:var(--ai-primary)]/20 mr-2">
                                    <span className="text-[color:var(--ai-primary)] font-bold text-sm">📊</span>
                                </div>
                                Course Statistics
                            </h2>
                        </div>
                        <CardBody>
                            <div className="space-y-4">
                                <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/30">
                                    <label className="text-sm text-[color:var(--ai-muted)]">Number of Lessons</label>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                                        {lessons[courseId] ? Object.keys(lessons[courseId]).length : 0}
                                    </p>
                                </div>
                                <Divider className="h-[1px] bg-gradient-to-r from-transparent via-[color:var(--ai-card-border)]/60 to-transparent" />
                                <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/30">
                                    <label className="text-sm text-[color:var(--ai-muted)]">Created At</label>
                                    <p className="text-[color:var(--ai-foreground)] font-medium">
                                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>                                <Divider className="h-[1px] bg-gradient-to-r from-transparent via-[color:var(--ai-card-border)]/60 to-transparent" />
                                <div className="bg-[color:var(--ai-card-bg)]/50 p-4 rounded-xl border border-[color:var(--ai-card-border)]/30">
                                    <label className="text-sm text-[color:var(--ai-muted)]">Last Updated</label>
                                    <p className="text-[color:var(--ai-foreground)] font-medium">
                                        {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Course Lessons</h2>
                        {isSaving && (
                            <span className="ml-3 text-sm text-[color:var(--ai-primary)] inline-flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[color:var(--ai-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving order...
                            </span>
                        )}
                    </div>                    <Button
                        color="primary"
                        onClick={handleAddLesson}
                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all rounded-full"
                        startContent={(
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    >
                        Add Lesson
                    </Button>
                </div>                <Card className="shadow-xl border border-[color:var(--ai-card-border)] overflow-hidden hover:shadow-[color:var(--ai-primary)]/5 transition-all rounded-xl">
                    {sortedLessons.length > 0 ? (
                        <div className="overflow-x-auto">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            ><table className="min-w-full divide-y divide-[color:var(--ai-card-border)]/60">
                                    <thead className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider">
                                                #
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-foreground)] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[color:var(--ai-card-bg)]/80 divide-y divide-[color:var(--ai-card-border)]/40">
                                        <SortableContext items={sortedLessons.map(lesson => lesson.id)} strategy={verticalListSortingStrategy}>
                                            {sortedLessons.map((lesson, index) => (
                                                <SortableLesson
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    index={index}
                                                    handleEditLesson={handleEditLesson}
                                                />
                                            ))}
                                        </SortableContext>
                                    </tbody>
                                </table>
                            </DndContext>
                            <div className="p-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Drag and drop lessons to reorder them
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CardBody>
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No lessons found for this course</p>
                                <Button
                                    color="primary"
                                    onClick={handleAddLesson}
                                    size="sm"
                                >
                                    Add First Lesson
                                </Button>
                            </div>
                        </CardBody>
                    )}
                </Card>
            </div>
        </div>
    );
}
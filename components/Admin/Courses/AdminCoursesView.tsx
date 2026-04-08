'use client'

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { CourseWithPriceProduct } from '@/types';
import AdminCoursesHeader from './AdminCoursesHeader';
import ViewToggle from './ViewToggle';
import CoursesGridView from './CoursesGridView';
import CoursesListView from './CoursesListView';
import { formatCoursePrice } from './utils';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { doc, writeBatch } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

interface AdminCoursesViewProps {
    courses: Record<string, CourseWithPriceProduct>;
    onAddCourse: (e?: React.MouseEvent) => void;
    onViewCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
    onEditCourse: (course: CourseWithPriceProduct, e?: React.MouseEvent) => void;
    onManageLessons?: (courseId: string, e?: React.MouseEvent) => void;
}

export default function AdminCoursesView({
    courses,
    onAddCourse,
    onViewCourse,
    onEditCourse,
    onManageLessons
}: AdminCoursesViewProps) {
    const [view, setView] = useState<"grid" | "list">("list");
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const context = useContext(AppContext);
    const products = context?.products;
    const [orderedCourses, setOrderedCourses] = useState<CourseWithPriceProduct[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sort courses by displayOrder, then by name as fallback
    useEffect(() => {
        const sorted = Object.values(courses).sort((a, b) => {
            const orderA = (a as any).displayOrder ?? 999;
            const orderB = (b as any).displayOrder ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return (a.name || '').localeCompare(b.name || '');
        });
        setOrderedCourses(sorted);
    }, [courses]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedCourses.findIndex(c => c.id === active.id);
        const newIndex = orderedCourses.findIndex(c => c.id === over.id);
        const reordered = arrayMove(orderedCourses, oldIndex, newIndex);
        setOrderedCourses(reordered);

        // Persist order to Firestore
        setIsSaving(true);
        try {
            const batch = writeBatch(firestoreDB);
            reordered.forEach((course, index) => {
                const ref = doc(firestoreDB, 'courses', course.id);
                batch.update(ref, { displayOrder: index });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error saving course order:', error);
        } finally {
            setIsSaving(false);
        }
    }, [orderedCourses]);

    const handleManageLessons = (courseId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (onManageLessons) {
            onManageLessons(courseId, e);
        } else if (isMounted) {
            router.push(`/admin/courses/${courseId}/lessons`);
        }
    };

    if (!isMounted) {
        return <div className="max-w-7xl mx-auto px-4 py-8">Loading courses...</div>;
    }

    const courseIds = orderedCourses.map(c => c.id);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <AdminCoursesHeader onAddCourse={onAddCourse} />

            <div className="flex items-center justify-between mb-4">
                <ViewToggle view={view} onViewChange={setView} />
                {isSaving && (
                    <span className="text-xs text-[color:var(--ai-muted)] animate-pulse">
                        Saving order...
                    </span>
                )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={courseIds} strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
                    {view === "grid" ? (
                        <CoursesGridView
                            courses={orderedCourses}
                            formatPrice={(course) => formatCoursePrice(course, undefined, products)}
                            onViewCourse={onViewCourse}
                            onEditCourse={onEditCourse}
                            onManageLessons={handleManageLessons}
                        />
                    ) : (
                        <CoursesListView
                            courses={orderedCourses}
                            formatPrice={(course) => formatCoursePrice(course, undefined, products)}
                            onViewCourse={onViewCourse}
                            onEditCourse={onEditCourse}
                            onManageLessons={handleManageLessons}
                        />
                    )}
                </SortableContext>
            </DndContext>
        </div>
    );
}
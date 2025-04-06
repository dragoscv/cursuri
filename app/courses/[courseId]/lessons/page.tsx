import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../../../../components/AppContext';
import EnhancedLessonsList from '../../../../components/Lessons/EnhancedLessonsList';
import { Spinner } from "@heroui/react";
import { motion } from 'framer-motion';
import { Course, Lesson, UserPaidProduct } from '@/types';
import CourseProgressHeader from '@/components/Lessons/CourseProgressHeader';
import CourseAccessRequired from '@/components/Course/Access/CourseAccessRequired';

// Define the props interface for the page component
interface LessonsPageProps {
    params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function LessonsPage(props: LessonsPageProps) {
    // Unwrap the params using React.use() to handle both Promise and non-Promise cases
    const unwrappedParams = React.use(props.params instanceof Promise ? props.params : Promise.resolve(props.params));
    const { courseId } = unwrappedParams;

    const context = useContext(AppContext);

    if (!context) {
        throw new Error('LessonsPage must be used within an AppContextProvider');
    }

    const { courses, lessons, userPurchases, user } = context;
    const router = useRouter();
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Find the course and its associated lessons
    const course = Object.values(courses || {}).find((c: Course) => c.id === courseId);

    // Get all lessons for this course and convert to array
    const courseLessons = lessons[courseId]
        ? Object.values(lessons[courseId])
        : [];

    useEffect(() => {
        // Simulate fetching completed lessons
        // In a real app, you'd fetch this from your database
        if (user && courseLessons) {
            // This is just a placeholder - replace with your actual data fetching logic
            const mockCompletedLessons = courseLessons
                .filter((_: Lesson, index: number) => index % 3 === 0) // Just for demo: mark every third lesson as completed
                .map((lesson: Lesson) => lesson.id);

            setCompletedLessons(mockCompletedLessons);
            setIsLoading(false);
        } else if (courseLessons) {
            setIsLoading(false);
        }
    }, [user, courseLessons]);

    // Check if the user has purchased this course
    const hasPurchased = userPurchases
        ? Object.values(userPurchases).some((purchase: UserPaidProduct) =>
            purchase.metadata?.courseId === courseId)
        : false;

    if (!course) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    // If the user hasn't purchased the course, redirect to the course page
    if (user && !hasPurchased && !course.isFree) {
        return <CourseAccessRequired courseId={courseId} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <CourseProgressHeader
                courseId={courseId}
                courseName={course.name}
                difficulty={course.difficulty || 'All levels'}
                lessonCount={courseLessons?.length || 0}
                completedLessonsCount={completedLessons.length}
                isLoading={isLoading}
            />

            <EnhancedLessonsList
                lessons={courseLessons || []}
                course={course}
                courseId={courseId}
                completedLessons={completedLessons}
                userHasAccess={hasPurchased || course.isFree}
            />
        </motion.div>
    );
}

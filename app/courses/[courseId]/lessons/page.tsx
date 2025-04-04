import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '../../../../components/AppContext';
import EnhancedLessonsList from '../../../../components/Lessons/EnhancedLessonsList';
import { Card, CardHeader, CardBody, Spinner, Button } from "@heroui/react";
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBookOpen } from '../../../../components/icons/FeatherIcons';
import Link from 'next/link';
import { Course, Lesson, UserPaidProduct } from '@/types';
import { useCourseParams } from '@/utils/hooks/useParams';

// Define the props interface for the page component
interface LessonsPageProps {
    params: {
        courseId: string;
    }
}

export default function LessonsPage(props: LessonsPageProps) {
    // Use the custom hook to safely access params
    const { courseId } = useCourseParams(props.params);
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
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="flex flex-col items-center gap-3">
                        <FiBookOpen className="text-4xl text-primary-500" />
                        <h1 className="text-2xl font-bold text-center">Course Access Required</h1>
                    </CardHeader>
                    <CardBody className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            You need to purchase this course to access the lessons.
                        </p>
                        <Link href={`/courses/${courseId}`}>
                            <Button color="primary" size="lg">
                                Go to Course Page
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <div className="mb-8">
                <Link href={`/courses/${courseId}`}>
                    <Button
                        variant="light"
                        startContent={<FiArrowLeft />}
                        className="mb-4"
                    >
                        Back to Course
                    </Button>
                </Link>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold">{course.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {courseLessons?.length || 0} lessons • {course.difficulty || 'All levels'}
                        </p>
                    </div>

                    {isLoading ? (
                        <Spinner size="sm" color="primary" />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="relative w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-primary-500 transition-all duration-300 ease-in-out rounded-full"
                                        style={{ width: `${(completedLessons.length / (courseLessons?.length || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {Math.round((completedLessons.length / (courseLessons?.length || 1)) * 100)}% Complete
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <EnhancedLessonsList
                lessons={courseLessons || []}
                course={course}
                courseId={courseId}
                completedLessons={completedLessons}
            />
        </motion.div>
    );
}

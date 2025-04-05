'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Button, Chip, Divider } from '@heroui/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';

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

    const handleAddLesson = () => {
        router.push(`/admin/courses/${courseId}/lessons/add`);
    };

    const handleEditLesson = (lesson: Lesson) => {
        router.push(`/admin/courses/${courseId}/lessons/${lesson.id}/edit`);
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
    };

    if (!course) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Not Found</h1>
                    <Link
                        href="/admin/courses"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Courses
                    </Link>
                </div>
                <Card className="shadow-md">
                    <CardBody>
                        <p className="text-center py-8">The requested course could not be found.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate max-w-2xl">{course.name}</h1>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/courses/${courseId}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Course
                    </Link>
                    <Link
                        href="/admin/courses"
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Back to Courses
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-md">
                        <CardBody>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold mb-4">Course Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                        <p className="text-gray-900 dark:text-white">{course.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                                        <Chip
                                            color={course.status === "active" ? "success" : "warning"}
                                            size="sm"
                                        >
                                            {course.status || "draft"}
                                        </Chip>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                                    <p className="text-gray-900 dark:text-white">{course.description || "No description provided."}</p>
                                </div>

                                {course.repoUrl && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Repository URL</label>
                                        <a
                                            href={course.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                        >
                                            {course.repoUrl}
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price</label>
                                    <p className="text-gray-900 dark:text-white font-medium">{formatPrice()}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="shadow-md">
                        <CardBody>
                            <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Number of Lessons</label>
                                    <p className="text-2xl font-bold">
                                        {lessons[courseId] ? Object.keys(lessons[courseId]).length : 0}
                                    </p>
                                </div>
                                <Divider />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Created At</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                                <Divider />
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Course Lessons</h2>
                    <Button
                        color="primary"
                        onClick={handleAddLesson}
                        startContent={(
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    >
                        Add Lesson
                    </Button>
                </div>

                <Card className="shadow-md">
                    {lessons[courseId] && Object.keys(lessons[courseId]).length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {Object.values(lessons[courseId])
                                        .sort((a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0))
                                        .map((lesson: Lesson, index: number) => (
                                            <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{lesson.name}</div>
                                                    {lesson.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                            {lesson.description}
                                                        </div>
                                                    )}
                                                    {lesson.repoUrl && (
                                                        <div className="mt-1">
                                                            <a
                                                                href={lesson.repoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center"
                                                            >
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                                </svg>
                                                                Repository
                                                            </a>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Chip
                                                        color={lesson.status === "active" ? "success" : "warning"}
                                                        size="sm"
                                                    >
                                                        {lesson.status || "draft"}
                                                    </Chip>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            variant="flat"
                                                            onClick={() => handleEditLesson(lesson)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
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
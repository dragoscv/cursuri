'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { CourseWithPriceProduct } from '@/types';

export default function AdminCoursesPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const router = useRouter();

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext not found");
    }

    const { courses, isAdmin, user } = context;

    // Redirect if not admin
    useEffect(() => {
        if (user && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, user, router]);

    const handleAddCourse = () => {
        router.push('/admin/courses/add');
    };

    const handleEditCourse = (course: CourseWithPriceProduct) => {
        router.push(`/admin/courses/${course.id}/edit`);
    };

    const handleViewCourse = (course: CourseWithPriceProduct) => {
        router.push(`/admin/courses/${course.id}`);
    };

    const formatPrice = (course: CourseWithPriceProduct): string => {
        if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
            const amount = course.priceProduct.prices[0].unit_amount / 100;
            const currency = course.priceProduct.prices[0].currency || 'RON';
            return amount.toLocaleString('ro-RO', {
                style: 'currency',
                currency: currency,
            });
        }
        return 'Price not available';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-gray-800/50 shadow-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Course Management</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Manage your courses, add new content, and edit existing courses.
                        </p>
                    </div>
                    <Button
                        color="primary"
                        onClick={handleAddCourse}
                        startContent={(
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    >
                        Add Course
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Button
                    color={view === "grid" ? "primary" : "default"}
                    variant={view === "grid" ? "solid" : "light"}
                    onClick={() => setView("grid")}
                    size="sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="ml-2">Grid</span>
                </Button>
                <Button
                    color={view === "list" ? "primary" : "default"}
                    variant={view === "list" ? "solid" : "light"}
                    onClick={() => setView("list")}
                    size="sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">List</span>
                </Button>
            </div>

            {view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(courses).map((course: any) => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                            <CardBody onClick={() => handleViewCourse(course)} className="cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">{course.name}</h3>
                                    <Chip
                                        color={course.status === "active" ? "success" : "warning"}
                                        size="sm"
                                    >
                                        {course.status || "draft"}
                                    </Chip>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                    {course.description || 'No description available'}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatPrice(course)}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {course.repoUrl && (
                                            <a
                                                href={course.repoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                Repo
                                            </a>
                                        )}

                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCourse(course);
                                            }}
                                            className="ml-2"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Course Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.values(courses).map((course: any) => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</div>
                                            {course.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {course.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Chip
                                                color={course.status === "active" ? "success" : "warning"}
                                                size="sm"
                                            >
                                                {course.status || "draft"}
                                            </Chip>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatPrice(course)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onClick={() => handleEditCourse(course)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="default"
                                                    variant="flat"
                                                    onClick={() => handleViewCourse(course)}
                                                >
                                                    View Lessons
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
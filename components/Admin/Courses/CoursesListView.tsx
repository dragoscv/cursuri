import React from 'react';
import { Card, Chip, Button } from '@heroui/react';
import { CourseWithPriceProduct } from '@/types';

interface CoursesListViewProps {
    courses: Record<string, CourseWithPriceProduct>;
    formatPrice: (course: CourseWithPriceProduct) => string;
    onViewCourse: (course: CourseWithPriceProduct) => void;
    onEditCourse: (course: CourseWithPriceProduct) => void;
}

export default function CoursesListView({
    courses,
    formatPrice,
    onViewCourse,
    onEditCourse
}: CoursesListViewProps) {
    return (
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
                        {Object.values(courses).map((course: CourseWithPriceProduct) => (
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
                                            onClick={() => onEditCourse(course)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="default"
                                            variant="flat"
                                            onClick={() => onViewCourse(course)}
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
    );
}
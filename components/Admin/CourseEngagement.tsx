'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Button } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { collection, getDocs, query, where, getFirestore, orderBy, limit } from 'firebase/firestore';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import { Course, Lesson } from '@/types';

interface CourseEngagementData {
    courseId: string;
    courseName: string;
    totalViews: number;
    completionRate: number;
    averageTime: number; // in minutes
    totalStudents: number;
    lastUpdated: Date;
    progressData?: {
        completeCount: number;
        inProgressCount: number;
        notStartedCount: number;
    }
}

const CourseEngagement: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("CourseEngagement must be used within an AppProvider");
    }

    const { courses, lessons } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [engagementData, setEngagementData] = useState<CourseEngagementData[]>([]);
    const [page, setPage] = useState<number>(1);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const rowsPerPage = 5;

    useEffect(() => {
        const fetchEngagementData = async () => {
            setLoading(true);
            try {
                const db = getFirestore(firebaseApp);
                const courseEngagementData: CourseEngagementData[] = [];

                // Process each course to get engagement metrics
                for (const courseId in courses) {
                    // Get all progress records for this course
                    const progressQuery = query(
                        collection(db, "users"),
                        // We'd ideally use a different collection structure for this
                        // but for now we'll work with what we have
                    );

                    // For this demo we're creating sample data
                    // In a real app, you'd query actual progress data
                    const course = courses[courseId];

                    // Generate some realistic sample data
                    const totalStudents = Math.floor(Math.random() * 200) + 10;
                    const completeCount = Math.floor(Math.random() * totalStudents * 0.8);
                    const inProgressCount = Math.floor(Math.random() * (totalStudents - completeCount));
                    const notStartedCount = totalStudents - completeCount - inProgressCount;

                    const totalViews = totalStudents * Math.floor(Math.random() * 5 + 1);
                    const completionRate = (completeCount / totalStudents) * 100;
                    const averageTime = Math.floor(Math.random() * 120 + 30); // 30-150 minutes

                    courseEngagementData.push({
                        courseId,
                        courseName: course.name,
                        totalViews,
                        completionRate,
                        averageTime,
                        totalStudents,
                        lastUpdated: new Date(),
                        progressData: {
                            completeCount,
                            inProgressCount,
                            notStartedCount
                        }
                    });
                }

                // Sort by total students descending
                courseEngagementData.sort((a, b) => b.totalStudents - a.totalStudents);

                setEngagementData(courseEngagementData);
            } catch (error) {
                console.error('Error fetching engagement data:', error);
                setError('Failed to load engagement data');
            } finally {
                setLoading(false);
            }
        };

        if (Object.keys(courses).length > 0) {
            fetchEngagementData();
        } else {
            setLoading(false);
        }
    }, [courses]);

    const paginatedData = engagementData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const totalPages = Math.ceil(engagementData.length / rowsPerPage);

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return hours > 0
            ? `${hours}h ${mins}m`
            : `${mins}m`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Course Engagement</h1>

                <Button
                    color="primary"
                    variant="flat"
                    className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export Report
                </Button>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-md">
                    <CardBody className="text-center p-6">
                        <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                            {Object.keys(courses).length}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Total Courses</p>
                    </CardBody>
                </Card>

                <Card className="shadow-md">
                    <CardBody className="text-center p-6">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {engagementData.reduce((sum, course) => sum + course.totalStudents, 0).toLocaleString()}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Total Enrollments</p>
                    </CardBody>
                </Card>

                <Card className="shadow-md">
                    <CardBody className="text-center p-6">
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {Math.round(engagementData.reduce((sum, course) => sum + course.completionRate, 0) / engagementData.length)}%
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Avg. Completion Rate</p>
                    </CardBody>
                </Card>

                <Card className="shadow-md">
                    <CardBody className="text-center p-6">
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            {formatTime(Math.round(engagementData.reduce((sum, course) => sum + course.averageTime, 0) / engagementData.length))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Avg. Completion Time</p>
                    </CardBody>
                </Card>
            </div>

            {/* Course engagement table */}
            <Card className="shadow-md">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Course Engagement Metrics</h2>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Course engagement metrics table">
                        <TableHeader>
                            <TableColumn>COURSE</TableColumn>
                            <TableColumn>STUDENTS</TableColumn>
                            <TableColumn>COMPLETION RATE</TableColumn>
                            <TableColumn>AVG. TIME</TableColumn>
                            <TableColumn>VIEWS</TableColumn>
                            <TableColumn>ENGAGEMENT</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((course) => (
                                    <TableRow key={course.courseId} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <TableCell>
                                            <div className="font-medium">{course.courseName}</div>
                                        </TableCell>
                                        <TableCell>{course.totalStudents}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span className="mr-2">{course.completionRate.toFixed(1)}%</span>
                                                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${course.completionRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatTime(course.averageTime)}</TableCell>
                                        <TableCell>{course.totalViews.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="w-full h-6 flex rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${(course.progressData?.completeCount || 0) / course.totalStudents * 100}%` }}
                                                    title={`Completed: ${course.progressData?.completeCount || 0} students`}
                                                ></div>
                                                <div
                                                    className="h-full bg-yellow-500"
                                                    style={{ width: `${(course.progressData?.inProgressCount || 0) / course.totalStudents * 100}%` }}
                                                    title={`In Progress: ${course.progressData?.inProgressCount || 0} students`}
                                                ></div>
                                                <div
                                                    className="h-full bg-gray-300 dark:bg-gray-600"
                                                    style={{ width: `${(course.progressData?.notStartedCount || 0) / course.totalStudents * 100}%` }}
                                                    title={`Not Started: ${course.progressData?.notStartedCount || 0} students`}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Completed</span>
                                                <span>In Progress</span>
                                                <span>Not Started</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No courses found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                total={totalPages}
                                initialPage={1}
                                page={page}
                                onChange={setPage}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Legend for the engagement chart */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Engagement Chart Legend</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-sm mr-2"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm mr-2"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Not Started</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseEngagement;

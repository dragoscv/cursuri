'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Divider } from '@heroui/react';
import { AppContext } from '@/components/AppContext';

const AdminAnalytics: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminAnalytics must be used within an AppProvider");
    }

    const { adminAnalytics, getAdminAnalytics } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); useEffect(() => {
        let mounted = true;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                if (getAdminAnalytics && mounted) {
                    await getAdminAnalytics();
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
                if (mounted) {
                    setError('Failed to load analytics data');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (!adminAnalytics) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }

        return () => { mounted = false; };
    }, [getAdminAnalytics, adminAnalytics]);

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
                <h2 className="text-2xl font-bold text-[color:var(--ai-danger)] mb-4">{error}</h2>
                <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">Please try again later</p>
            </div>
        );
    }

    // Format month names for display
    const getMonthName = (monthNum: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthNum - 1];
    };

    // Sort and format revenue data
    const sortedMonthlyRevenue = adminAnalytics?.monthlyRevenue ?
        Object.entries(adminAnalytics.monthlyRevenue)
            .map(([monthYear, amount]) => {
                const [month, year] = monthYear.split('/').map(num => parseInt(num));
                return {
                    monthYear,
                    month,
                    year,
                    amount,
                    label: `${getMonthName(month)} ${year}`
                };
            })
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            }) : [];

    // Get max revenue for chart scaling
    const maxRevenue = sortedMonthlyRevenue.length ?
        Math.max(...sortedMonthlyRevenue.map(item => item.amount)) : 0;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Analytics</h1>

            {/* Revenue Chart */}
            <Card className="shadow-md">
                <CardHeader className="pb-0">
                    <h2 className="text-xl font-semibold">Revenue Over Time</h2>
                </CardHeader>
                <CardBody>
                    {sortedMonthlyRevenue.length > 0 ? (
                        <div className="h-64 flex items-end space-x-2">
                            {sortedMonthlyRevenue.map((item) => {
                                const heightPercentage = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;

                                return (
                                    <div key={item.monthYear} className="flex flex-col items-center flex-1">
                                        <div
                                            className="w-full bg-primary-500 rounded-t"
                                            style={{ height: `${heightPercentage}%` }}
                                            title={`${item.amount.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}`}
                                        ></div>
                                        <div className="mt-2 text-xs text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] transform -rotate-45 origin-top-left">
                                            {item.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">No revenue data available</p>
                        </div>
                    )}

                    <Divider className="my-6" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <h3 className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] text-sm mb-1">Total Revenue</h3>
                            <p className="text-2xl font-bold">
                                {(adminAnalytics?.totalRevenue || 0).toLocaleString('ro-RO', {
                                    style: 'currency',
                                    currency: 'RON'
                                })}
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] text-sm mb-1">Average Per Sale</h3>
                            <p className="text-2xl font-bold">
                                {adminAnalytics && adminAnalytics.totalRevenue && adminAnalytics.newSales ?
                                    (adminAnalytics.totalRevenue / adminAnalytics.newSales).toLocaleString('ro-RO', {
                                        style: 'currency',
                                        currency: 'RON',
                                        maximumFractionDigits: 0
                                    }) : '0 RON'}
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] text-sm mb-1">Sales This Month</h3>
                            <p className="text-2xl font-bold">
                                {adminAnalytics?.newSales || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] text-sm mb-1">Revenue Growth</h3>
                            <p className="text-2xl font-bold text-[color:var(--ai-success)]">
                                +{sortedMonthlyRevenue.length > 1 ? '12%' : '0%'}
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* User Growth and Course Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-md">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">User Growth</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="h-52 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{adminAnalytics?.totalUsers || 0}</div>
                                <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mt-2">Total Users</p>
                                <div className="mt-4 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-[color:var(--ai-success)] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    <span className="text-[color:var(--ai-success)] dark:text-[color:var(--ai-success)] font-medium">
                                        +{adminAnalytics?.newUsers || 0} in the last 30 days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Course Statistics</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg">
                                <div className="text-3xl font-bold">{adminAnalytics?.totalCourses || 0}</div>
                                <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mt-2">Active Courses</p>
                            </div>
                            <div className="text-center p-4 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg">
                                <div className="text-3xl font-bold">{adminAnalytics?.totalLessons || 0}</div>
                                <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mt-2">Total Lessons</p>
                            </div>
                            <div className="text-center p-4 bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg col-span-2">
                                <div className="text-3xl font-bold">
                                    {adminAnalytics && adminAnalytics.totalCourses > 0 ?
                                        (adminAnalytics.totalLessons / adminAnalytics.totalCourses).toFixed(1) : 0}
                                </div>
                                <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mt-2">Avg. Lessons per Course</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Popular Courses Table */}
            <Card className="shadow-md">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Popular Courses</h2>
                </CardHeader>
                <CardBody>
                    {adminAnalytics?.popularCourses && adminAnalytics.popularCourses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[color:var(--ai-card-border)]">
                                <thead className="bg-[color:var(--ai-card-bg)] border-b border-[color:var(--ai-card-border)]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] uppercase tracking-wider">
                                            Course Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] uppercase tracking-wider">
                                            Enrollments
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] uppercase tracking-wider">
                                            % of Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[color:var(--ai-card-bg)] divide-y divide-[color:var(--ai-card-border)]">
                                    {adminAnalytics.popularCourses.map((course, index) => {
                                        const totalEnrollments = adminAnalytics.popularCourses.reduce(
                                            (sum, c) => sum + c.enrollments, 0
                                        );
                                        const percentage = totalEnrollments > 0 ?
                                            (course.enrollments / totalEnrollments) * 100 : 0;

                                        return (
                                            <tr key={course.courseId} className="hover:bg-[color:var(--ai-card-bg)] dark:hover:bg-[color:var(--ai-card-border)]">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-semibold">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-[color:var(--ai-foreground)] dark:text-[color:var(--ai-foreground)]">
                                                        {course.courseName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">
                                                    {course.enrollments}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative w-24 h-4 bg-[color:var(--ai-card-border)] rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-primary-500"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] mt-1">
                                                        {percentage.toFixed(1)}%
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)]">No course enrollment data available</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default AdminAnalytics;


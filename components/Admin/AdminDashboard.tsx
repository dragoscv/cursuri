'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody, CardFooter, Spinner } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import { AdminAnalytics } from '@/types';

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminDashboard must be used within an AppProvider");
    }

    const { adminAnalytics, getAdminAnalytics } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [onTabChange, setOnTabChange] = useState<(tab: string) => void>(() => () => { });

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                if (getAdminAnalytics) {
                    await getAdminAnalytics();
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [getAdminAnalytics]);

    useEffect(() => {
        if (window.changeAdminTab && typeof window.changeAdminTab === 'function') {
            setOnTabChange(() => window.changeAdminTab);
        }
    }, []);

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
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Key metrics - top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={adminAnalytics?.totalUsers || 0}
                    description="Registered users"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    change={adminAnalytics?.newUsers || 0}
                    changeLabel="new in last 30 days"
                />

                <StatCard
                    title="Total Courses"
                    value={adminAnalytics?.totalCourses || 0}
                    description="Active courses"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                />

                <StatCard
                    title="Total Revenue"
                    value={adminAnalytics?.totalRevenue || 0}
                    description="Lifetime earnings"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    isMonetary
                    currency="RON"
                />

                <StatCard
                    title="New Sales"
                    value={adminAnalytics?.newSales || 0}
                    description="In the last 30 days"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                />
            </div>

            {/* Popular courses and lesson count */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="shadow-md">
                        <CardBody>
                            <h2 className="text-xl font-semibold mb-4">Popular Courses</h2>
                            {adminAnalytics?.popularCourses && adminAnalytics.popularCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {adminAnalytics.popularCourses.map((course, index) => (
                                        <div key={course.courseId} className="flex items-center justify-between py-2">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold mr-3">
                                                    {index + 1}
                                                </div>
                                                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                                    {course.courseName}
                                                </h3>
                                            </div>
                                            <div className="font-medium">
                                                {course.enrollments} enrollments
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    No enrollment data available yet
                                </p>
                            )}
                        </CardBody>
                    </Card>
                </div>
                <div>
                    <Card className="shadow-md">
                        <CardBody>
                            <h2 className="text-xl font-semibold mb-4">Lessons</h2>
                            <div className="text-center py-4">
                                <div className="text-4xl font-bold text-primary-500">
                                    {adminAnalytics?.totalLessons || 0}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Total lessons created</p>
                                <div className="mt-4 text-gray-700 dark:text-gray-300">
                                    Average {adminAnalytics && adminAnalytics.totalCourses > 0 ?
                                        (adminAnalytics.totalLessons / adminAnalytics.totalCourses).toFixed(1) : 0} lessons per course
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Recent activity and revenue chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md">
                    <CardBody>
                        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
                        {adminAnalytics?.monthlyRevenue && Object.keys(adminAnalytics.monthlyRevenue).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(adminAnalytics.monthlyRevenue)
                                    .sort(([monthA], [monthB]) => {
                                        // Sort by date (MM/YYYY format)
                                        const [monthA_num, yearA] = monthA.split('/').map(Number);
                                        const [monthB_num, yearB] = monthB.split('/').map(Number);

                                        if (yearA !== yearB) return yearB - yearA;
                                        return monthB_num - monthA_num;
                                    })
                                    .slice(0, 6)
                                    .map(([month, revenue]) => (
                                        <div key={month} className="flex items-center justify-between py-2">
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {month}
                                            </div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {revenue.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                No revenue data available yet
                            </p>
                        )}
                    </CardBody>
                </Card>

                <Card className="shadow-md">
                    <CardBody>
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <ActionButton
                                title="Add Course"
                                href="/admin/courses/add"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                }
                            />
                            <ActionButton
                                title="Manage Users"
                                href="#"
                                onClick={() => onTabChange('users')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                            />
                            <ActionButton
                                title="View Analytics"
                                href="#"
                                onClick={() => onTabChange('analytics')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                            />
                            <ActionButton
                                title="Settings"
                                href="#"
                                onClick={() => onTabChange('settings')}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    change?: number;
    changeLabel?: string;
    isMonetary?: boolean;
    currency?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    description,
    icon,
    change,
    changeLabel,
    isMonetary = false,
    currency = 'USD'
}) => {
    const formattedValue = isMonetary
        ? value.toLocaleString('ro-RO', { style: 'currency', currency })
        : value.toLocaleString();

    return (
        <Card className="shadow-md">
            <CardBody>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h3>
                    <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                        {icon}
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {formattedValue}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </CardBody>
            {change !== undefined && (
                <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                            +{change} {changeLabel}
                        </span>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
};

interface ActionButtonProps {
    title: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, href, onClick, icon }) => {
    return (
        <a
            href={href || "#"}
            onClick={onClick}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-[color:var(--ai-primary)]/5 dark:bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/10 dark:hover:bg-[color:var(--ai-primary)]/15 transition duration-200 cursor-pointer shadow-sm hover:shadow-md border border-[color:var(--ai-card-border)]/30"
        >
            <div className="p-2 rounded-full bg-[color:var(--ai-primary)]/10 dark:bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)] mb-3">
                {icon}
            </div>
            <span className="font-medium text-[color:var(--ai-foreground)]">{title}</span>
        </a>
    );
};

export default AdminDashboard;
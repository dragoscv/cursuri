'use client'

import React, { useState, useEffect } from 'react';
import AdminAnalyticsSection from './AdminAnalyticsSection';
import AdminLessonsSection from './AdminLessonsSection';
import AdminRevenueSection from './AdminRevenueSection';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import AdminCoursesView from './Courses/AdminCoursesView';
import { AppContext } from '@/components/AppContext';
import { CourseWithPriceProduct } from '@/types';
import { useRouter } from 'next/navigation';

interface AdminDashboardTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    analytics: any;
}

const TABS = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'courses', label: 'Courses' },
    { key: 'users', label: 'Users' },
    { key: 'settings', label: 'Settings' },
];

export default function AdminDashboardTabs({ activeTab, onTabChange, analytics }: AdminDashboardTabsProps) {
    const context = React.useContext(AppContext);
    const courses = context?.courses || {};
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const coursesWithPrice: Record<string, CourseWithPriceProduct> = Object.fromEntries(
        Object.entries(courses).filter(([, c]) => c.priceProduct && c.priceProduct.prices && c.priceProduct.id)
            .map(([id, c]) => [id, c as CourseWithPriceProduct])
    );

    // Handlers for navigation
    const handleAddCourse = () => {
        if (mounted) {
            router.push('/admin/courses/add');
        }
    };

    const handleEditCourse = (course: CourseWithPriceProduct) => {
        if (mounted) {
            router.push(`/admin/courses/${course.id}/edit`);
        }
    };

    const handleViewCourse = (course: CourseWithPriceProduct) => {
        if (mounted) {
            router.push(`/admin/courses/${course.id}`);
        }
    };

    const handleManageLessons = (courseId: string) => {
        if (mounted) {
            router.push(`/admin/courses/${courseId}/lessons`);
        }
    };

    // Only render full tabs when mounted on client
    if (!mounted) {
        return (
            <div>
                <div className="flex gap-2 border-b border-[color:var(--ai-card-border)] mb-8">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-150 focus:outline-none ${activeTab === tab.key ? 'bg-[color:var(--ai-card-bg)] text-[color:var(--ai-primary)] border-b-2 border-[color:var(--ai-primary)]' : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)]'}`}
                            onClick={() => onTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div>
                    <p>Loading admin content...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2 border-b border-[color:var(--ai-card-border)] mb-8">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-150 focus:outline-none ${activeTab === tab.key ? 'bg-[color:var(--ai-card-bg)] text-[color:var(--ai-primary)] border-b-2 border-[color:var(--ai-primary)]' : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)]'}`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div>
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <AdminAnalyticsSection analytics={analytics} />
                        </div>
                        <div>
                            <AdminLessonsSection analytics={analytics} />
                        </div>
                        <div className="lg:col-span-3 mt-6">
                            <AdminRevenueSection analytics={analytics} />
                        </div>
                    </div>
                )}
                {activeTab === 'courses' && (
                    <AdminCoursesView
                        courses={coursesWithPrice}
                        onAddCourse={handleAddCourse}
                        onViewCourse={handleViewCourse}
                        onEditCourse={handleEditCourse}
                        onManageLessons={handleManageLessons}
                    />
                )}
                {activeTab === 'users' && (
                    <AdminUsers />
                )}
                {activeTab === 'settings' && (
                    <AdminSettings />
                )}
            </div>
        </div>
    );
}

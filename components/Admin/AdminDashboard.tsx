'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import AdminAnalyticsSection from './AdminAnalyticsSection';
import AdminLessonsSection from './AdminLessonsSection';
import AdminRevenueSection from './AdminRevenueSection';

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminDashboard must be used within an AppProvider");
    }

    const { adminAnalytics, getAdminAnalytics } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null); // Reset error state
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminAnalytics]); // Only depend on adminAnalytics, not getAdminAnalytics to prevent infinite loop

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
                <p className="text-[color:var(--ai-muted-foreground)]">Please try again later</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[color:var(--ai-foreground)]">
                    Admin Dashboard
                </h1>
                <p className="text-[color:var(--ai-muted)] mt-2">
                    Overview of your platform analytics and performance
                </p>
            </div>

            {/* Analytics Content - Sidebar handles navigation to other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AdminAnalyticsSection analytics={adminAnalytics ?? null} />
                </div>
                <div>
                    <AdminLessonsSection analytics={adminAnalytics ?? null} />
                </div>
                <div className="lg:col-span-3 mt-6">
                    <AdminRevenueSection analytics={adminAnalytics ?? null} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';
import { AppContext } from '@/components/AppContext';
import AdminDashboardTabs from './AdminDashboardTabs';

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AdminDashboard must be used within an AppProvider");
    }

    const { adminAnalytics, getAdminAnalytics } = context;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('analytics'); useEffect(() => {
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
                <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
            </div>
        );
    } return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <AdminDashboardTabs activeTab={activeTab} onTabChange={setActiveTab} analytics={adminAnalytics ?? null} />
        </div>
    );
};

export default AdminDashboard;
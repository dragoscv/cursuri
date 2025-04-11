'use client'

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { motion } from 'framer-motion';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, authLoading } = context;

    // Redirect if not logged in, but only after auth check is complete
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, router, authLoading]);

    // Show loading state while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[color:var(--ai-background)] pt-16 pb-12 flex items-center justify-center">
                <div className="animate-pulse text-[color:var(--ai-primary)] text-lg">Loading...</div>
            </div>
        );
    }

    // Don't render profile content if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[color:var(--ai-background)] pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Profile Sidebar */}
                    <div className="lg:col-span-3">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
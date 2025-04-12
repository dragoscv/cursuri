'use client'

import React, { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { motion } from 'framer-motion';
import ProfileSidebar from '@/components/Profile/ProfileSidebar';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, authLoading } = context;

    // Check if current path is exactly the main profile dashboard
    const isMainProfilePage = pathname === '/profile';

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
    } return (
        <div className="min-h-screen bg-[color:var(--ai-background)] pt-12 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Profile Sidebar - Hidden on mobile except on main profile page */}
                    <div className={`${isMainProfilePage ? 'col-span-12' : 'hidden'} md:block lg:col-span-3`}>
                        <ProfileSidebar />
                    </div>

                    {/* Main Content - Takes full width on mobile except on main profile page */}
                    <div className={`${isMainProfilePage ? 'mt-8 md:mt-0' : ''} lg:col-span-9 col-span-12`}>
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
'use client'

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/components/AppContext';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/Admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);

    // Safe access to context
    const isAdmin = context?.isAdmin || false;
    const user = context?.user || null;    // Redirect if not admin
    useEffect(() => {
        // Only run this effect once when context is available
        if (context && isLoading) {
            if (!isAdmin && user) {
                router.push('/');
            }
            setIsLoading(false);
        }
    }, [isAdmin, user, router, context, isLoading]);// Content to show based on authentication state
    const adminLayout = (
        <div className="min-h-screen bg-[color:var(--ai-background)] pt-8 md:pt-16 pb-6 md:pb-12">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Admin Sidebar */}
                    <div className="lg:col-span-3">
                        <AdminSidebar />
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

    const loadingView = (
        <div className="min-h-screen bg-[color:var(--ai-background)] pt-16 pb-12 flex items-center justify-center">
            <div className="animate-pulse text-[color:var(--ai-primary)] text-lg">Loading...</div>
        </div>
    );    // Render based on authentication and loading state
    return isLoading || !isAdmin ? loadingView : adminLayout;
}

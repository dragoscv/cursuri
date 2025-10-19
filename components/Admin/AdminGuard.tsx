'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/components/AppContext';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@heroui/react';

interface AdminGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * AdminGuard component to protect admin routes
 * Shows loading state while checking admin status
 * Redirects non-admin users to home page
 */
export default function AdminGuard({ children, fallback }: AdminGuardProps) {
    const context = useContext(AppContext);
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    if (!context) {
        throw new Error('AdminGuard must be used within AppContextProvider');
    }

    const { user, isAdmin, authLoading } = context;

    useEffect(() => {
        // Wait for auth to finish loading
        if (!authLoading) {
            setIsChecking(false);

            // If user is not authenticated, redirect to home
            if (!user) {
                router.push('/');
                return;
            }

            // If user is authenticated but not admin, show error
            if (!isAdmin) {
                console.error('Access denied: User does not have admin privileges');
            }
        }
    }, [user, isAdmin, authLoading, router]);

    // Show loading state while checking authentication
    if (authLoading || isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--ai-primary)] mb-4"></div>
                        <p className="text-[color:var(--ai-foreground)]">Checking admin access...</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Show error if user is not authenticated
    if (!user) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md border-red-500/20">
                    <CardBody className="text-center py-8">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-2">Authentication Required</h2>
                        <p className="text-[color:var(--ai-muted)] mb-4">Please sign in to access this page.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Show error if user is not admin
    if (!isAdmin) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md border-red-500/20">
                    <CardBody className="text-center py-8">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[color:var(--ai-foreground)] mb-2">Access Denied</h2>
                        <p className="text-[color:var(--ai-muted)] mb-4">
                            You don&apos;t have permission to access this page.
                        </p>
                        <p className="text-sm text-[color:var(--ai-muted)]">
                            Admin privileges are required. Please contact your system administrator.
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // User is admin, render children
    return <>{children}</>;
}

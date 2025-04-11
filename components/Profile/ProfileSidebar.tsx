'use client'

import React, { useContext } from 'react';
import Link from 'next/link';
import { Card, Chip, Avatar, Button } from '@heroui/react';
import { FiHome, FiSettings, FiCreditCard, FiBookOpen, FiUser, FiLogOut } from '@/components/icons/FeatherIcons';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { useRouter } from 'next/navigation';

// Calculate overall progress across all courses
const calculateOverallProgress = (userPaidProducts: any[], lessonProgress: any) => {
    if (!userPaidProducts || !lessonProgress) return 0;

    let completedLessons = 0;
    let totalLessons = 0;

    userPaidProducts.forEach(product => {
        const courseId = product.metadata?.courseId;
        if (courseId && lessonProgress[courseId]) {
            Object.values(lessonProgress[courseId]).forEach(progress => {
                if ((progress as any).isCompleted) {
                    completedLessons++;
                }
                totalLessons++;
            });
        }
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

const ProfileSidebar: React.FC = () => {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user, isDark, lessonProgress, userPaidProducts, toggleTheme } = context;

    if (!user) return null;

    // Count enrolled courses
    const enrolledCoursesCount = userPaidProducts?.length || 0;

    // Navigation items
    const navItems = [
        { label: 'Dashboard', href: '/profile', icon: FiHome },
        { label: 'My Courses', href: '/profile/courses', icon: FiBookOpen },
        { label: 'Payment History', href: '/profile/payments', icon: FiCreditCard },
        { label: 'Settings', href: '/profile/settings', icon: FiSettings },
    ];

    // Handle sign out
    const handleSignOut = async () => {
        await signOut(firebaseAuth);
        router.push('/');
    };

    return (
        <div className="sticky top-24">
            <Card className="mb-6 overflow-hidden border border-[color:var(--ai-card-border)]">
                <div className="relative bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] h-24">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>

                <div className="relative px-6 pt-0 pb-6">
                    <div className="-mt-12 flex justify-center">
                        <Avatar
                            src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`}
                            className="border-4 border-white dark:border-[color:var(--ai-background)] w-24 h-24"
                            size="lg"
                        />
                    </div>

                    <div className="mt-4 text-center">
                        <h2 className="text-xl font-bold text-[color:var(--ai-foreground)] truncate">
                            {user?.displayName || user?.email?.split('@')[0]}
                        </h2>
                        <p className="text-sm text-[color:var(--ai-muted)] mb-4 truncate">
                            {user?.email}
                        </p>

                        <div className="flex justify-center space-x-2 mb-4">
                            <Chip color="primary" variant="flat" size="sm">
                                {enrolledCoursesCount} {enrolledCoursesCount === 1 ? 'Course' : 'Courses'}
                            </Chip>
                            <Chip color="success" variant="flat" size="sm">
                                {calculateOverallProgress(userPaidProducts || [], lessonProgress)}% Complete
                            </Chip>
                        </div>

                        <Button
                            color="danger"
                            variant="flat"
                            size="sm"
                            startContent={<FiLogOut />}
                            onClick={handleSignOut}
                            className="w-full"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Navigation */}
            <Card className="overflow-hidden border border-[color:var(--ai-card-border)]">
                <nav className="flex flex-col">
                    {navItems.map((item, index) => {
                        const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`
                                      flex items-center gap-3 px-6 py-4 transition-colors duration-200
                                      ${index !== navItems.length - 1 ? 'border-b border-[color:var(--ai-card-border)]' : ''}
                                      ${isActive
                                            ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] font-medium'
                                            : 'hover:bg-[color:var(--ai-primary)]/5 text-[color:var(--ai-foreground)]'}
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1 h-6 bg-[color:var(--ai-primary)] rounded-full"></div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </Card>

            {/* Theme Toggle */}
            <div className="mt-6 flex justify-center">
                <Button
                    variant="flat"
                    color="default"
                    className="w-full"
                    onClick={toggleTheme}
                >
                    {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </Button>
            </div>
        </div>
    );
};

export default ProfileSidebar;

'use client'

import React, { useContext } from 'react';
import Link from 'next/link';
import { Card, Chip, Avatar } from '@heroui/react';
import { FiHome, FiSettings, FiUsers, FiBookOpen, FiBarChart2, FiLogOut } from '@/components/icons/FeatherIcons';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { AppContext } from '@/components/AppContext';
import { useRouter, usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { user } = context;

    if (!user) return null;

    // Navigation items
    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: FiHome },
        { label: 'Courses', href: '/admin/courses', icon: FiBookOpen },
        { label: 'Users', href: '/admin/users', icon: FiUsers },
        { label: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
        { label: 'Settings', href: '/admin/settings', icon: FiSettings },
    ];

    // Handle sign out
    const handleSignOut = async () => {
        await signOut(firebaseAuth);
        router.push('/');
    };

    return (
        <div className="sticky top-24">
            <Card className="mb-6 overflow-hidden border border-[color:var(--ai-card-border)] shadow-lg rounded-xl">
                <div className="relative bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] h-28">
                    {/* Circuit pattern overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-white/30 animate-pulse"></div>
                    <div className="absolute top-6 right-8 h-2 w-2 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>

                <div className="relative px-6 pt-0 pb-6">
                    <div className="-mt-14 flex justify-center">
                        <Avatar
                            src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`}
                            className="border-4 border-white dark:border-[color:var(--ai-background)] w-28 h-28 shadow-lg"
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

                        <div className="flex justify-center mb-4">
                            <Chip color="primary" variant="flat" size="sm">
                                Admin Portal
                            </Chip>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Navigation */}
            <Card className="overflow-hidden border border-[color:var(--ai-card-border)] shadow-md rounded-xl">
                <nav className="flex flex-col py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link key={item.href} href={item.href} className="block">
                                <div
                                    className={`
                                      flex items-center gap-3 px-6 py-3.5 mx-2 my-1 transition-all duration-200 rounded-lg
                                      ${isActive
                                            ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/10 text-[color:var(--ai-primary)] font-medium shadow-sm'
                                            : 'hover:bg-[color:var(--ai-primary)]/5 text-[color:var(--ai-foreground)] hover:translate-x-1'}
                                    `}
                                >
                                    <div className={`p-1.5 rounded-full ${isActive ? 'bg-[color:var(--ai-primary)]/10' : ''}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"></div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {/* Sign Out Button */}
                    <div
                        className="flex items-center gap-3 px-6 py-3.5 mx-2 my-1 transition-all duration-200 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                        onClick={handleSignOut}
                    >
                        <div className="p-1.5 rounded-full">
                            <FiLogOut className="w-4 h-4" />
                        </div>
                        <span>Sign Out</span>
                    </div>
                </nav>
            </Card>
        </div>
    );
};

export default AdminSidebar;

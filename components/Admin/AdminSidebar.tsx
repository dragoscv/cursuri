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
    }; return (
        <div className="md:sticky md:top-24 fixed md:relative bottom-0 left-0 right-0 md:bottom-auto z-50">
            {/* Profile Card - Only visible on desktop */}
            <Card className="mb-6 overflow-hidden border border-[color:var(--ai-card-border)] shadow-lg rounded-xl hidden md:block">
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
            </Card>            {/* Navigation */}
            <Card className="overflow-hidden border border-[color:var(--ai-card-border)] shadow-md md:shadow-lg rounded-xl md:rounded-t-xl rounded-b-none md:bg-[color:var(--ai-card-bg)] md:backdrop-blur-none bg-[color:var(--ai-card-bg)]/80 backdrop-blur-md">
                <nav className="flex md:flex-col flex-row justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link key={item.href} href={item.href} className="block">
                                <div
                                    className={`
                                      flex md:flex-row flex-col items-center md:gap-3 gap-1 
                                      md:px-6 px-2 md:py-3.5 py-3 md:mx-2 mx-0 md:my-1 my-0 transition-all duration-200 
                                      md:rounded-lg rounded-md
                                      ${isActive
                                            ? 'md:bg-gradient-to-r md:from-[color:var(--ai-primary)]/20 md:to-[color:var(--ai-secondary)]/10 text-[color:var(--ai-primary)] font-medium md:shadow-sm'
                                            : 'hover:bg-[color:var(--ai-primary)]/5 text-[color:var(--ai-foreground)] md:hover:translate-x-1'}
                                    `}
                                >
                                    <div className={`p-1.5 rounded-full ${isActive ? 'bg-[color:var(--ai-primary)]/10' : ''}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="md:block text-xs md:text-base">{item.label}</span>
                                    {isActive && (
                                        <div className="md:ml-auto md:w-1.5 md:h-6 h-0.5 w-1/2 mt-1 md:mt-0 bg-gradient-to-b md:bg-gradient-to-b md:from-[color:var(--ai-primary)] md:to-[color:var(--ai-secondary)] from-[color:var(--ai-primary)] to-[color:var(--ai-primary)] rounded-full"></div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {/* Sign Out Button - Only visible on desktop */}
                    <div
                        className="hidden md:flex items-center gap-3 px-6 py-3.5 mx-2 my-1 transition-all duration-200 rounded-lg text-[color:var(--ai-danger)] hover:bg-[color:var(--ai-danger)] dark:hover:bg-[color:var(--ai-danger)]/10 cursor-pointer"
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


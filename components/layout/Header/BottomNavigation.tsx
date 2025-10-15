'use client'

import React, { useContext } from 'react';
import Link from 'next/link';
import { Card } from '@heroui/react';
import { FiHome, FiBookOpen, FiUser } from '@/components/icons/FeatherIcons';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/components/AppContext';

export default function BottomNavigation() {
    const pathname = usePathname();
    const context = useContext(AppContext);    // Get authentication status from context
    const isAuthenticated = !!context?.user;
    const isAdmin = context?.isAdmin || false;

    // Check if we're on the homepage or in admin section
    const isHomepage = pathname === '/';
    const isAdminRoute = pathname.startsWith('/admin');

    // Hide navigation if user is not authenticated or on admin routes
    if (!isAuthenticated || isAdminRoute) {
        return null;
    }

    // Only show on mobile devices
    const navItems = [
        { label: 'Explore', href: '/courses', icon: FiHome },
        { label: 'My Courses', href: '/profile/courses', icon: FiBookOpen },
        { label: 'Profile', href: '/profile', icon: FiUser },
    ]; return (<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 overflow-hidden">
        {/* Themed blur background that stays within rounded corners */}
        <div className="absolute inset-x-0 bottom-0 h-full rounded-t-xl bg-gradient-to-b from-[color:var(--ai-primary)]/5 to-[color:var(--ai-secondary)]/5 backdrop-blur-xl overflow-hidden"></div>
        <Card className="overflow-hidden border border-[color:var(--ai-card-border)] shadow-lg rounded-t-xl rounded-b-none bg-[color:var(--ai-card-bg)]/60 backdrop-blur-2xl">
            <div className="h-0.5 w-full bg-gradient-to-r from-[color:var(--ai-primary)]/40 via-[color:var(--ai-secondary)]/40 to-[color:var(--ai-accent)]/40"></div>
            <nav className="flex flex-row justify-around py-3 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link key={item.href} href={item.href} className="block w-full">
                            <div
                                className={`
                    flex flex-col items-center gap-1.5
                    px-2 py-2.5 mx-0 my-0 transition-all duration-500
                    rounded-lg relative
                    ${isActive
                                        ? 'text-[color:var(--ai-primary)] font-medium'
                                        : 'text-[color:var(--ai-foreground)] hover:text-[color:var(--ai-primary)]'}
                  `}
                            >
                                {/* Glow effect for active item */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--ai-primary)]/5 to-transparent rounded-xl blur-sm -z-10"></div>
                                )}

                                {/* Icon with animated container */}
                                <div
                                    className={`p-2 rounded-full transition-all duration-500 ease-out transform 
                                        ${isActive
                                            ? 'bg-gradient-to-br from-[color:var(--ai-primary)]/15 to-[color:var(--ai-secondary)]/10 scale-110 shadow-sm'
                                            : 'bg-[color:var(--ai-card-bg)]/50 hover:scale-110 hover:bg-[color:var(--ai-primary)]/5'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} />
                                </div>

                                {/* Label with animated underline */}
                                <div className="relative">
                                    <span className="text-xs font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-2/3 bg-gradient-to-r from-transparent via-[color:var(--ai-primary)] to-transparent rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </Card>
    </div>
    );
}

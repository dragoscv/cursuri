'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Card } from '@heroui/react';
import { FiHome, FiBookOpen, FiUser } from '@/components/icons/FeatherIcons';
import { usePathname } from 'next/navigation';
import { AppContext } from '@/components/AppContext';

export default function BottomNavigation() {
  const pathname = usePathname();
  const context = useContext(AppContext); // Get authentication status from context
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
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <Card className="overflow-hidden border-t border-[color:var(--ai-card-border)] border-x-0 border-b-0 shadow-none rounded-none bg-[color:var(--ai-background)]">
        <div className="h-[2px] w-full bg-amber-500"></div>
        <nav className="flex flex-row justify-around py-3 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className="block w-full">
                <div
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 mx-0 my-0 transition-colors duration-200 rounded-lg relative ${
                    isActive
                      ? 'text-amber-500'
                      : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isActive ? 'bg-amber-500/10' : 'bg-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="relative">
                    <span className="text-xs font-medium">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-2/3 bg-amber-500 rounded-full"></div>
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

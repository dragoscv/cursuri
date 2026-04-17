'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const isAdminPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

/**
 * Hides global chrome (Header, Footer, BottomNav) when rendering inside
 * the dedicated admin panel, which provides its own shell.
 */
const HideOnAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname() || '';
    if (isAdminPath(pathname)) return null;
    return <>{children}</>;
};

/**
 * Wraps children with extra top-padding on non-admin pages (since the global
 * Header is fixed). Inside the admin panel this padding would create dead
 * space at the top of the admin shell, so we drop it.
 */
export const ContentArea: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    const pathname = usePathname() || '';
    const onAdmin = isAdminPath(pathname);
    return <div className={`${onAdmin ? '' : 'pt-20 md:pt-24'} ${className}`}>{children}</div>;
};

export default HideOnAdmin;


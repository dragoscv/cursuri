'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView, initAnalytics } from '@/utils/analytics';

/**
 * Client component that tracks page views automatically
 * Place in layout.tsx to track all page navigations
 */
export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Initialize analytics on mount
        initAnalytics();
    }, []);

    useEffect(() => {
        if (pathname) {
            // Get page title from document
            const pageTitle = document.title || pathname;

            // Log page view
            logPageView(pathname, pageTitle);
        }
    }, [pathname]);

    return null;
}

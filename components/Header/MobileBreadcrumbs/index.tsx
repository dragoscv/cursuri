'use client'

import React from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePathname } from "next/navigation";

/**
 * MobileBreadcrumbs component that displays breadcrumbs on mobile devices
 */
export default function MobileBreadcrumbs() {
    const pathname = usePathname();

    // Check if current route is a course or lesson page
    const isCourseOrLessonPage = pathname.includes('/courses/');

    // Don't show mobile breadcrumbs if not on a course or lesson page
    if (!isCourseOrLessonPage) {
        return null;
    }

    return (
        <div className="md:hidden w-full overflow-x-auto whitespace-nowrap py-2 -mx-3 px-3 scrollbar-hide no-scrollbar">
            <Breadcrumbs />
        </div>
    );
}
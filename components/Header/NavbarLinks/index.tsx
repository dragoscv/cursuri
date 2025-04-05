'use client'

import React from 'react';
import { NavbarContent, NavbarItem, Link } from "@heroui/react";
import { usePathname } from "next/navigation";

/**
 * NavbarLinks component that displays the main navigation links
 */
export default function NavbarLinks() {
    const pathname = usePathname();

    // Check if current route is a course or lesson page
    const isCourseOrLessonPage = pathname.includes('/courses/');

    // Don't show navigation items if on a course or lesson page
    if (isCourseOrLessonPage) {
        return null;
    }

    return (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
                <Link
                    href="/#courses-section"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
                >
                    Courses
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link
                    href="#"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
                >
                    About
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link
                    href="#"
                    className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
                >
                    Contact
                </Link>
            </NavbarItem>
        </NavbarContent>
    );
}
'use client'

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "@/components/AppContext";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import SearchBar from "@/components/SearchBar";

// Import modular Header components
import NavbarBrand from "@/components/Header/NavbarBrand";
import NavbarLinks from "@/components/Header/NavbarLinks";
import MobileBreadcrumbs from "@/components/Header/MobileBreadcrumbs";
import UserDropdown from "@/components/Header/UserDropdown";
import AuthActions from "@/components/Header/AuthActions";
import AdminActions from "@/components/Header/AdminActions";

/**
 * Main Header component for the application
 */
export default function Header() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("Missing context value");
    }

    const [isScrolled, setIsScrolled] = useState(false);

    // Add scroll event listener to detect when the page is scrolled
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <Navbar
            maxWidth="xl"
            isBordered
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled
                ? 'bg-white/90 dark:bg-[color:var(--ai-background)]/95 shadow-sm backdrop-blur-md'
                : 'bg-white/70 dark:bg-[color:var(--ai-background)]/80 backdrop-blur-sm'
                } border-b border-[color:var(--ai-card-border)]`}
        >
            {/* Logo and desktop breadcrumbs */}
            <NavbarBrand />

            {/* Main navigation links */}
            <NavbarLinks />

            {/* Mobile breadcrumbs section */}
            <MobileBreadcrumbs />

            {/* Right side content with search, auth and user actions */}
            <NavbarContent justify="end" as="div">
                {/* Search Bar */}
                <NavbarItem>
                    <SearchBar />
                </NavbarItem>

                {/* Admin Actions - only visible if user is admin */}
                <NavbarItem className="hidden md:flex">
                    <AdminActions />
                </NavbarItem>

                {/* Auth Actions - only visible if user is not logged in */}
                <NavbarItem className="hidden md:flex">
                    <AuthActions />
                </NavbarItem>

                {/* User Dropdown Menu - always visible, handles logged in/out states */}
                <NavbarItem>
                    <UserDropdown />
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}

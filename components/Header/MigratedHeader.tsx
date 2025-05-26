'use client'

import React, { useState, useEffect } from "react";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import SearchBar from "@/components/SearchBar";

// Import modular Header components
import NavbarBrand from "@/components/Header/NavbarBrand";
import NavbarLinks from "@/components/Header/NavbarLinks";
import MobileBreadcrumbs from "@/components/Header/MobileBreadcrumbs";
import UserDropdown from "@/components/Header/UserDropdown";
import AuthActions from "@/components/Header/AuthActions";
import AdminActions from "@/components/Header/AdminActions";

// Import specific context hooks instead of the monolithic AppContext
import { useAuth } from "@/components/contexts/modules";

/**
 * Main Header component for the application - Migrated to use modular contexts
 */
export default function Header() {
    // Use specific context hooks for only what this component needs
    const { isAdmin } = useAuth();

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-md shadow-sm'
                : 'bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 backdrop-blur-sm'
                } border-b border-[color:var(--ai-card-border)]/50`}
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

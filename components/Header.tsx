'use client'

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "@/components/AppContext";
import { Navbar, NavbarContent, NavbarItem } from "@heroui/react";
import SearchBar from "@/components/SearchBar";
import { useTranslations } from 'next-intl';

// Import modular Header components
import NavbarBrand from "@/components/Header/NavbarBrand";
import NavbarLinks from "@/components/Header/NavbarLinks";
import MobileBreadcrumbs from "@/components/Header/MobileBreadcrumbs";
import UserDropdown from "@/components/Header/UserDropdown";
import AuthActions from "@/components/Header/AuthActions";
import AdminActions from "@/components/Header/AdminActions";
import ThemeToggle from "@/components/Header/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * Main Header component for the application
 */
export default function Header() {
    const t = useTranslations('common');
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("Missing context value");
    }

    const { user } = context;
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

            {/* Right side content with search, language switcher, theme toggle, auth and user actions */}
            <NavbarContent justify="end" as="div" className="flex items-center gap-4">
                {/* Search Bar */}
                <NavbarItem className="flex-shrink-0">
                    <SearchBar />
                </NavbarItem>

                {/* Language Switcher */}
                <NavbarItem className="flex-shrink-0">
                    <LanguageSwitcher />
                </NavbarItem>

                {/* Theme Toggle */}
                <NavbarItem className="flex-shrink-0">
                    <ThemeToggle />
                </NavbarItem>

                {/* Admin Actions - only visible if user is admin */}
                <NavbarItem className="hidden md:flex flex-shrink-0">
                    <AdminActions />
                </NavbarItem>

                {/* Auth Actions - visible on desktop when not logged in, visible on mobile when not logged in */}
                <NavbarItem className={`flex-shrink-0 ${user ? 'hidden md:flex' : 'flex'}`}>
                    <AuthActions />
                </NavbarItem>

                {/* User Dropdown Menu - only visible when user is logged in */}
                <NavbarItem className="flex-shrink-0">
                    <UserDropdown />
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}

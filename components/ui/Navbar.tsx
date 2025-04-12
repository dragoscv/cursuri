'use client';

import React, { forwardRef } from 'react';
import {
    Navbar as HeroNavbar,
    NavbarBrand as HeroNavbarBrand,
    NavbarContent as HeroNavbarContent,
    NavbarItem as HeroNavbarItem,
    NavbarMenuToggle as HeroNavbarMenuToggle,
    NavbarMenu as HeroNavbarMenu,
    NavbarMenuItem as HeroNavbarMenuItem,
    type NavbarProps as HeroNavbarProps
} from '@heroui/react';

export interface NavbarProps {
    /**
     * The content of the navbar
     */
    children: React.ReactNode;

    /**
     * Whether the navbar should have a shadow
     */
    shouldHideOnScroll?: boolean;

    /**
     * Whether the navbar is currently visible
     */
    isMenuOpen?: boolean;

    /**
     * The default state of the menu
     */
    defaultOpen?: boolean;

    /**
     * Callback when the menu state changes
     */
    onMenuOpenChange?: (isOpen: boolean) => void;

    /**
     * Whether the navbar is transparent
     */
    isBlurred?: boolean;

    /**
     * Whether the navbar has a border at the bottom
     */
    isBordered?: boolean;

    /**
     * Maximum width of the navbar content
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'fluid';

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Additional props
     */
    [key: string]: any;
}

/**
 * Navbar component for site navigation
 */
const Navbar = forwardRef<HTMLElement, NavbarProps>((props, ref) => {
    const {
        children,
        shouldHideOnScroll = false,
        isMenuOpen,
        defaultOpen,
        onMenuOpenChange,
        isBlurred = false,
        isBordered = false,
        maxWidth = 'lg',
        className = '',
        ...rest
    } = props;

    // Default styling with theme variables
    const defaultClassName = "bg-[color:var(--ai-background)]/80 backdrop-blur-md";

    return (
        <HeroNavbar
            ref={ref}
            shouldHideOnScroll={shouldHideOnScroll}
            isMenuOpen={isMenuOpen}
            defaultOpen={defaultOpen}
            onMenuOpenChange={onMenuOpenChange}
            isBlurred={isBlurred}
            isBordered={isBordered}
            maxWidth={maxWidth as HeroNavbarProps['maxWidth']}
            className={`${defaultClassName} ${className}`}
            {...rest}
        >
            {children}
        </HeroNavbar>
    );
});

/**
 * NavbarBrand component for logo/brand display
 */
const NavbarBrand = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroNavbarBrand ref={ref} className={className} {...rest} />;
});

/**
 * NavbarContent component for content sections
 */
const NavbarContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { justify?: 'start' | 'end' | 'center' }>((props, ref) => {
    const { className = '', justify = 'start', ...rest } = props;
    return <HeroNavbarContent ref={ref} className={className} justify={justify} {...rest} />;
});

/**
 * NavbarItem component for individual navigation items
 */
const NavbarItem = forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement> & { isActive?: boolean }>((props, ref) => {
    const { className = '', isActive = false, ...rest } = props;

    // Add active styling if the item is active
    const activeClass = isActive ? 'text-[color:var(--ai-primary)] font-medium' : '';

    return <HeroNavbarItem ref={ref} className={`${activeClass} ${className}`} isActive={isActive} {...rest} />;
});

/**
 * NavbarMenuToggle component for mobile menu toggle
 */
const NavbarMenuToggle = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroNavbarMenuToggle ref={ref} className={className} {...rest} />;
});

/**
 * NavbarMenu component for mobile dropdown menu
 */
const NavbarMenu = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const { className = '', ...rest } = props;

    // Default styling for mobile menu
    const defaultClassName = "bg-[color:var(--ai-background)]/90 backdrop-blur-md pt-6";

    return <HeroNavbarMenu ref={ref} className={`${defaultClassName} ${className}`} {...rest} />;
});

/**
 * NavbarMenuItem component for mobile menu items
 */
const NavbarMenuItem = forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>((props, ref) => {
    const { className = '', ...rest } = props;
    return <HeroNavbarMenuItem ref={ref} className={className} {...rest} />;
});

Navbar.displayName = 'Navbar';
NavbarBrand.displayName = 'NavbarBrand';
NavbarContent.displayName = 'NavbarContent';
NavbarItem.displayName = 'NavbarItem';
NavbarMenuToggle.displayName = 'NavbarMenuToggle';
NavbarMenu.displayName = 'NavbarMenu';
NavbarMenuItem.displayName = 'NavbarMenuItem';

export { NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem };
export default Navbar;

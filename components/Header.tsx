'use client';

import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import { useTranslations } from 'next-intl';

// Import modular Header components
import NavbarBrand from '@/components/Header/NavbarBrand';
import NavbarLinks from '@/components/Header/NavbarLinks';
import MobileBreadcrumbs from '@/components/Header/MobileBreadcrumbs';
import UserDropdown from '@/components/Header/UserDropdown';
import AuthActions from '@/components/Header/AuthActions';
import AdminActions from '@/components/Header/AdminActions';
import ThemeToggle from '@/components/Header/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileMenu from '@/components/Header/MobileMenu';

/**
 * Main Header component for the application.
 * Modern glass-morphism header with scroll-aware shrink, animated gradient
 * border, and smooth element transitions.
 */
const Header = React.memo(function Header() {
  const t = useTranslations('common');
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Missing context value');
  }

  const { user } = context;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      role="navigation"
      aria-label={t('accessibility.mainNavigation')}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,backdrop-filter,box-shadow] duration-500 ease-out ${
        isScrolled
          ? 'py-1.5 bg-[color:var(--ai-background)]/75 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)]'
          : 'py-3 bg-[color:var(--ai-background)]/40 backdrop-blur-md'
      }`}
    >
      {/* Animated gradient hairline border */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--ai-primary) 60%, transparent) 25%, color-mix(in srgb, var(--ai-secondary) 60%, transparent) 50%, color-mix(in srgb, var(--ai-accent) 60%, transparent) 75%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'header-shimmer 8s linear infinite',
        }}
      />

      {/* Subtle animated glow on scroll */}
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 transition-opacity duration-700 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 800px 100px at 50% 0%, color-mix(in srgb, var(--ai-primary) 10%, transparent), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <NavbarBrand />
          </div>

          {/* Center: nav links (desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
            <NavbarLinks />
          </div>

          {/* Mobile breadcrumbs (only on course/lesson pages, mobile) */}
          <div className="md:hidden flex-1 min-w-0">
            <MobileBreadcrumbs />
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="flex-shrink-0">
              <SearchBar />
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
              <AdminActions />
              {!user && <AuthActions />}
            </div>

            <div className="md:hidden flex-shrink-0">
              <MobileMenu />
            </div>

            <div className="flex-shrink-0">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes header-shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.header>
  );
});

export default Header;

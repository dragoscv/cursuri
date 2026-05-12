'use client';

import React, { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const isCourseOrLessonPage = pathname?.includes('/courses/') ?? false;
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
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,border-color] duration-200 ease-out ${
        isScrolled
          ? 'py-2 bg-[color:var(--ai-background)] border-b border-[color:var(--ai-card-border)]'
          : 'py-3 bg-transparent border-b border-transparent'
      }`}
    >
      {/* Subtle gold rim accent on scroll only */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 cinematic-rim-divider transition-opacity duration-200 ${
          isScrolled ? 'opacity-50' : 'opacity-0'
        }`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <NavbarBrand />
          </div>

          {/* Center: nav links (desktop). On course/lesson pages, only lg+ to leave room for breadcrumbs. */}
          <div
            className={`${isCourseOrLessonPage ? 'hidden lg:flex' : 'hidden md:flex'} flex-1 items-center justify-center min-w-0`}
          >
            <NavbarLinks />
          </div>

          {/* Mobile breadcrumbs (only on course/lesson pages, below lg) */}
          <div className="lg:hidden flex-1 min-w-0">
            <MobileBreadcrumbs />
          </div>

          {/* Right cluster — unified rail */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <SearchBar />
            <div className="hidden md:flex items-center gap-0.5">
              <span aria-hidden className="w-px h-5 bg-[color:var(--ai-card-border)] mx-1" />
              <LanguageSwitcher />
              <ThemeToggle />
              <AdminActions />
              {!user && <AuthActions />}
            </div>
            <div className="md:hidden">
              <MobileMenu />
            </div>
            <UserDropdown />
          </div>
        </div>
      </div>
    </motion.header>
  );
});

export default Header;

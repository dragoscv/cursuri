'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * NavbarLinks — main desktop navigation with animated active-state pill
 * (framer-motion shared layout) and hover micro-interactions.
 */
export default function NavbarLinks() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const items = [
    { href: '/courses', label: t('nav.courses') },
    { href: '/subscriptions', label: t('nav.subscriptions') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="flex items-center gap-1 rounded-full border border-[color:var(--ai-card-border)]/50 bg-[color:var(--ai-card-bg)]/30 backdrop-blur-sm px-1.5 py-1 shadow-sm">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
              active
                ? 'text-white'
                : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-md shadow-[color:var(--ai-primary)]/30"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

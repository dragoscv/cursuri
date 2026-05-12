'use client';

/**
 * NavbarLinks v2 — flat editorial row with a 2px gold underline for the
 * active route. No background pill, no nested chrome, no gradient fills.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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
    <nav className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-3 py-1.5 text-[14px] font-medium tracking-[-0.005em] rounded-md transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)] ${
              active
                ? 'text-[color:var(--ai-foreground)]'
                : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
            {active ? (
              <motion.span
                layoutId="nav-active-underline"
                aria-hidden
                className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

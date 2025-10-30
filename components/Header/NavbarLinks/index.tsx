'use client';

import React from 'react';
import { NavbarContent, NavbarItem, Link } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * NavbarLinks component that displays the main navigation links
 */
export default function NavbarLinks() {
  const t = useTranslations('common');
  const pathname = usePathname();

  return (
    <NavbarContent className="hidden sm:flex gap-4" justify="center">
      <NavbarItem>
        <Link
          href="/courses"
          className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
        >
          {t('nav.courses')}
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link
          href="/about"
          className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
        >
          {t('nav.about')}
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link
          href="/contact"
          className="text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] transition-colors"
        >
          {t('nav.contact')}
        </Link>
      </NavbarItem>
    </NavbarContent>
  );
}

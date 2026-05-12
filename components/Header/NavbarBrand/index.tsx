'use client';

/**
 * NavbarBrand v2 — calm editorial monogram + plain wordmark.
 *
 * No gradients, no rotation springs, no animated halos. Just a single
 * gold-accented "S" in a thin rounded square + the brand name in the
 * standard foreground type. On course/lesson pages, hides the wordmark
 * and shows breadcrumbs instead (saves horizontal real estate).
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Breadcrumbs from '@/components/Breadcrumbs';

export default function NavbarBrand() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const isCourseOrLessonPage = pathname.includes('/courses/');

  return (
    <div className="flex items-center gap-3 min-w-0">
      <Link
        href="/"
        aria-label={t('nav.brandName')}
        className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-primary)] rounded-md"
      >
        <span
          aria-hidden
          className="grid place-items-center w-8 h-8 rounded-lg border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] font-semibold text-[15px] tracking-tight transition-colors group-hover:border-[color:var(--ai-primary)]/60 group-hover:text-[color:var(--ai-primary)]"
        >
          S
        </span>
        {!isCourseOrLessonPage ? (
          <span className="font-semibold text-[15px] tracking-[-0.01em] text-[color:var(--ai-foreground)] hidden sm:inline">
            {t('nav.brandName')}
          </span>
        ) : null}
      </Link>
      {isCourseOrLessonPage ? (
        <div className="hidden md:block max-w-[200px] lg:max-w-[300px] xl:max-w-[400px] overflow-hidden border-l border-[color:var(--ai-card-border)]/60 pl-3">
          <Breadcrumbs />
        </div>
      ) : null}
    </div>
  );
}

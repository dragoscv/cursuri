'use client';

/**
 * CoursesFilter v2 — flat editorial filter bar. No outer pill chrome,
 * no colored icon boxes, no gradient active pill. Plain search input +
 * inline chip row with underline-active, stacked above the grid.
 */

import React, { useContext, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { AppContext } from '../AppContext';
import { Course } from '../../types';
import { FiX, FiSearch } from '@/components/icons/FeatherIcons';

interface CoursesFilterProps {
  onFilterChange: (filter: string) => void;
  onCategoryChange: (category: string) => void;
  currentFilter: string;
  currentCategory: string;
}

export const CoursesFilter: React.FC<CoursesFilterProps> = ({
  onFilterChange,
  onCategoryChange,
  currentFilter,
  currentCategory,
}) => {
  const t = useTranslations('courses.filter');
  const context = useContext(AppContext);
  const [searchText, setSearchText] = useState(currentFilter);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'all');

  if (!context) {
    throw new Error('CoursesFilter must be used within AppContext');
  }

  const { courses } = context;

  const categories = useMemo(() => {
    if (!courses || Object.keys(courses).length === 0) return [];
    const allCategories = Object.values(courses).flatMap((course: Course) => {
      if (course.metadata?.categories && Array.isArray(course.metadata.categories)) {
        return course.metadata.categories;
      }
      if (course.metadata?.category) return [course.metadata.category];
      return [];
    });
    const counts = allCategories.reduce((acc: Record<string, number>, c: string) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([key, count]) => ({ key, label: key, count }));
  }, [courses]);

  useEffect(() => {
    const timer = setTimeout(() => onFilterChange(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText, onFilterChange]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const hasActive = currentFilter || (currentCategory && currentCategory !== 'all');

  const allChips = useMemo(
    () => [
      { key: 'all', label: t('allCategories'), count: undefined as number | undefined },
      ...categories,
    ],
    [categories, t]
  );

  return (
    <div className="mb-8">
      {/* Search */}
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--ai-muted)] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full h-11 pl-9 pr-3 rounded-md bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] text-[14px] text-[color:var(--ai-foreground)] placeholder:text-[color:var(--ai-muted)] outline-none focus:border-[color:var(--ai-foreground)] transition-colors"
        />
      </div>

      {/* Category chips */}
      <div
        className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[color:var(--ai-card-border)]/60 pb-1"
        role="tablist"
        aria-label={t('allCategories')}
      >
        {allChips.map((c) => {
          const active =
            c.key === 'all'
              ? !selectedCategory || selectedCategory === 'all'
              : selectedCategory === c.label;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleCategoryChange(c.key === 'all' ? 'all' : c.label)}
              className={`relative inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium tracking-[-0.005em] transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md ${
                active
                  ? 'text-[color:var(--ai-foreground)]'
                  : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)]'
              }`}
            >
              <span>{c.label}</span>
              {c.count !== undefined ? (
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    active ? 'text-[color:var(--ai-foreground)]' : 'text-[color:var(--ai-muted)]/70'
                  }`}
                >
                  {String(c.count)}
                </span>
              ) : null}
              {active ? (
                <motion.span
                  layoutId="courses-cat-underline"
                  aria-hidden
                  className="absolute left-2 right-2 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Active filters strip */}
      {hasActive ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[color:var(--ai-muted)]">
            {t('activeFilters')}
          </span>
          {currentFilter ? (
            <ActiveChip
              label={`"${currentFilter}"`}
              onClear={() => {
                setSearchText('');
                onFilterChange('');
              }}
              ariaLabel={t('clearSearchFilter')}
            />
          ) : null}
          {currentCategory && currentCategory !== 'all' ? (
            <ActiveChip
              label={currentCategory}
              onClear={() => {
                setSelectedCategory('all');
                onCategoryChange('all');
              }}
              ariaLabel={t('clearCategoryFilter')}
            />
          ) : null}
          <button
            type="button"
            onClick={() => {
              setSearchText('');
              setSelectedCategory('all');
              onFilterChange('');
              onCategoryChange('all');
            }}
            className="ml-auto text-[12px] text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] underline underline-offset-4 cursor-pointer"
          >
            {t('clearAll')}
          </button>
        </div>
      ) : null}
    </div>
  );
};

function ActiveChip({
  label,
  onClear,
  ariaLabel,
}: {
  label: string;
  onClear: () => void;
  ariaLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full text-[12px] bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)]">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={ariaLabel}
        className="grid place-items-center w-4 h-4 rounded-full text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] cursor-pointer"
      >
        <FiX className="w-3 h-3" />
      </button>
    </span>
  );
}

export default CoursesFilter;

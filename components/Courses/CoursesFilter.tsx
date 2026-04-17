'use client';

import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { Input } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '../../types';
import { useTranslations } from 'next-intl';
import { FiX, FiSearch, FiFilter } from '@/components/icons/FeatherIcons';

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

  // Debounce search
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
    () => [{ key: 'all', label: t('allCategories'), count: undefined as number | undefined }, ...categories],
    [categories, t]
  );

  return (
    <div className="mb-8 rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] shrink-0">
            <FiSearch className="w-5 h-5" />
          </div>
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="search"
            size="lg"
            variant="bordered"
            className="flex-1"
            classNames={{
              inputWrapper:
                'bg-transparent border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50',
            }}
          />
        </div>

        {/* Category chips */}
        <div className="flex items-start gap-3">
          <div className="hidden md:grid place-items-center w-10 h-10 rounded-xl bg-[color:var(--ai-secondary)]/10 text-[color:var(--ai-secondary)] shrink-0">
            <FiFilter className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence initial={false}>
              {allChips.map((c) => {
                const active =
                  c.key === 'all' ? !selectedCategory || selectedCategory === 'all' : selectedCategory === c.label;
                return (
                  <motion.button
                    key={c.key}
                    type="button"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    onClick={() => handleCategoryChange(c.key === 'all' ? 'all' : c.label)}
                    className={`relative inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-sm font-medium transition-colors border ${
                      active
                        ? 'text-white border-transparent'
                        : 'text-[color:var(--ai-muted)] hover:text-[color:var(--ai-foreground)] border-[color:var(--ai-card-border)] bg-[color:var(--ai-background)]/40'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="courses-cat-active"
                        className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] shadow-sm"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                    {c.count !== undefined && (
                      <span
                        className={`relative z-10 text-[10px] font-semibold px-1.5 h-4 rounded-full inline-flex items-center ${
                          active ? 'bg-white/25 text-white' : 'bg-[color:var(--ai-card-border)]/60 text-[color:var(--ai-muted)]'
                        }`}
                      >
                        {String(c.count)}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Active filters strip */}
        {hasActive && (
          <div className="pt-2 border-t border-[color:var(--ai-card-border)]/60 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[color:var(--ai-muted)]">
              {t('activeFilters')}
            </span>
            {currentFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]">
                &quot;{currentFilter}&quot;
                <button
                  type="button"
                  onClick={() => {
                    setSearchText('');
                    onFilterChange('');
                  }}
                  className="opacity-70 hover:opacity-100"
                  aria-label={t('clearSearchFilter')}
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {currentCategory && currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs bg-[color:var(--ai-secondary)]/10 text-[color:var(--ai-secondary)]">
                {currentCategory}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    onCategoryChange('all');
                  }}
                  className="opacity-70 hover:opacity-100"
                  aria-label={t('clearCategoryFilter')}
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchText('');
                setSelectedCategory('all');
                onFilterChange('');
                onCategoryChange('all');
              }}
              className="ml-auto text-xs text-[color:var(--ai-muted)] hover:text-[color:var(--ai-danger)] underline-offset-4 hover:underline"
            >
              {t('clearAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesFilter;

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@heroui/react';
import Input from './ui/Input'; // Use custom Input component
import { useRouter, usePathname } from 'next/navigation';
import { useContext } from 'react';
import { AppContext } from './AppContext';
import SearchIcon from './icons/SearchIcon';
import CloseIcon from './icons/CloseIcon';
import { useTranslations } from 'next-intl';

const SearchBar = React.memo(function SearchBar() {
  const t = useTranslations('common');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Only show search on homepage
  const isHomePage = pathname === '/';

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('You probably forgot to put <AppProvider>.');
  }

  const { courses, products } = context;

  // Memoize startContent to prevent recreation
  const searchIconSmall = useMemo(() => <SearchIcon className="w-4 h-4" />, []);
  const searchIconMedium = useMemo(() => <SearchIcon className="w-5 h-5" />, []);
  const searchIconMuted = useMemo(
    () => <SearchIcon className="w-5 h-5 text-[color:var(--ai-muted)]" />,
    []
  );

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Keyboard shortcut (Ctrl+K or Command+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // ESC to close search
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  // Search function
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Search for courses that match the query
    const filteredCourses = Object.values(courses).filter((course: any) => {
      const name = course.name?.toLowerCase() || '';
      const description = course.description?.toLowerCase() || '';
      const difficulty = course.difficulty?.toLowerCase() || '';

      return name.includes(query) || description.includes(query) || difficulty.includes(query);
    });

    // Prepare the results with product info
    const results = filteredCourses.map((course: any) => {
      const product = products?.find((p: any) => p.id === course.priceProduct?.id);
      const price = product?.prices?.find((p: any) => p.id === course.price);

      return {
        ...course,
        image: product?.images?.[0] || '',
        formattedPrice: price
          ? `${price.unit_amount / 100} ${price.currency.toUpperCase()}`
          : 'Free',
      };
    });

    setSearchResults(results);
  };

  // Run search on query change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Handle course selection
  const handleSelectCourse = (courseId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/courses/${courseId}`);
  };

  // Handle search button click with event propagation control
  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSearchOpen(true);
  };

  // Render search component on all pages
  return (
    <div ref={searchContainerRef} className="relative z-50">
      {/* Search toggle button */}
      <Button
        variant="light"
        onClick={handleSearchButtonClick}
        className="hidden md:flex items-center gap-2 text-sm text-[color:var(--ai-muted)]"
        startContent={searchIconSmall}
        aria-label={t('accessibility.openSearch', { default: t('search.buttonText') })}
      >
        {t('search.buttonText')}
        <kbd className="px-2 py-1 ml-2 text-xs font-semibold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 border border-[color:var(--ai-card-border)] rounded-md">
          ⌘K
        </kbd>
      </Button>

      {/* Mobile search button */}
      <Button
        isIconOnly
        variant="light"
        onClick={handleSearchButtonClick}
        className="md:hidden"
        aria-label={t('ariaLabels.searchInput')}
      >
        {searchIconMedium}
      </Button>

      {/* Search modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-dialog-title"
        >
          <div className="w-full max-w-2xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-2xl overflow-hidden">
            <h2 id="search-dialog-title" className="sr-only">
              {t('search.placeholder')}
            </h2>
            <div className="p-4">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    // Select first result when Enter is pressed
                    handleSelectCourse(searchResults[0].id);
                  }
                }}
                variant="bordered"
                startContent={searchIconMuted}
                endContent={
                  searchQuery && (
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      aria-label={t('accessibility.clearSearch', { default: 'Clear search' })}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </Button>
                  )
                }
                className="w-full"
              />
            </div>

            {/* Search results */}
            <div
              className="max-h-[70vh] overflow-y-auto"
              role="region"
              aria-label={t('accessibility.noSearchResults')}
            >
              {searchResults.length > 0 ? (
                <>
                  <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                    {t('accessibility.searchResults', { count: searchResults.length })}
                  </div>
                  <div className="p-2" role="list">
                    {searchResults.map((course) => (
                      <div
                        key={course.id}
                        role="listitem"
                        className="p-3 hover:bg-[color:var(--ai-primary)]/10 rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ai-primary"
                        onClick={() => handleSelectCourse(course.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectCourse(course.id);
                          }
                        }}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          {course.image && (
                            <img
                              src={course.image}
                              alt={course.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-[color:var(--ai-foreground)] truncate">
                              {course.name}
                            </h3>
                            {course.description && (
                              <p className="text-xs text-[color:var(--ai-muted)] line-clamp-1">
                                {course.description}
                              </p>
                            )}
                          </div>
                          <div className="text-xs font-medium text-[color:var(--ai-foreground)]">
                            {course.formattedPrice}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : searchQuery ? (
                <div className="p-8 text-center text-[color:var(--ai-muted)]">
                  <p>{t('search.noResults', { query: searchQuery })}</p>
                </div>
              ) : (
                <div className="p-4 border-t border-[color:var(--ai-card-border)]">
                  <p className="text-sm text-[color:var(--ai-muted)] text-center">
                    {t('search.startTyping')}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with keyboard shortcuts */}
            <div className="p-4 border-t border-[color:var(--ai-card-border)]">
              <div className="flex items-center justify-between text-xs text-[color:var(--ai-muted)]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 font-semibold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-border)]/30 border border-[color:var(--ai-card-border)] rounded-md">
                      {t('search.keyboard.esc')}
                    </kbd>
                    <span>{t('search.keyboard.toClose')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 font-semibold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-border)]/30 border border-[color:var(--ai-card-border)] rounded-md">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 font-semibold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-border)]/30 border border-[color:var(--ai-card-border)] rounded-md">
                      ↓
                    </kbd>
                    <span>{t('search.keyboard.toNavigate')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 font-semibold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-border)]/30 border border-[color:var(--ai-card-border)] rounded-md">
                    {t('search.keyboard.enter')}
                  </kbd>
                  <span>{t('search.keyboard.toSelect')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default SearchBar;

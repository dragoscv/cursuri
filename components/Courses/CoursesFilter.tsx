import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Course } from '../../types';

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
    currentCategory
}) => {
    const context = useContext(AppContext);
    const [searchText, setSearchText] = useState(currentFilter);
    const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'all');
    const [isSelectOpen, setIsSelectOpen] = useState(false);// Extract unique categories from courses
    const categories = React.useMemo(() => {
        if (!context || !context.courses) return [];

        // Extract all tags from all courses
        const allTags = Object.values(context.courses).flatMap((course: Course) =>
            course.tags || []
        );

        // Count occurrences of each tag
        const tagCounts = allTags.reduce((acc: { [key: string]: number }, tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        // Sort by count (descending) and convert to objects with key and label properties
        return Object.entries(tagCounts)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([tag, count]) => ({
                key: tag,
                label: tag,
                count: count
            }));
    }, [context]);

    // Handle search input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(searchText);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText, onFilterChange]);

    // Handle category selection
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        onCategoryChange(category);
    };

    return (
        <div className="mb-8 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl p-4 border border-[color:var(--ai-card-border)] shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search input */}
                <div className="flex-1">
                    <Input
                        placeholder="Search courses..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        startContent={
                            <svg className="w-5 h-5 text-[color:var(--ai-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        type="search"
                        size="lg"
                        className="w-full"
                    />
                </div>                {/* Category custom select dropdown */}
                <div className="md:w-60 relative">
                    <div
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="w-full cursor-pointer bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg px-4 py-2.5 text-left flex items-center justify-between hover:border-[color:var(--ai-primary)]/50 transition-colors duration-200"
                    >
                        <span className="block truncate">
                            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                        </span>
                        <span className="pointer-events-none">
                            <svg
                                className={`w-5 h-5 text-[color:var(--ai-muted)] transition-transform duration-200 ${isSelectOpen ? 'rotate-180 transform' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>

                    {isSelectOpen && (
                        <>
                            {/* Backdrop for clicking outside */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsSelectOpen(false)}
                            ></div>

                            {/* Dropdown options */}
                            <div
                                className="absolute z-20 mt-1 w-full bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                style={{
                                    transformOrigin: 'top center',
                                    animation: 'scaleIn 0.15s ease-out forwards'
                                }}
                            >
                                <div
                                    className={`px-4 py-2.5 cursor-pointer hover:bg-[color:var(--ai-primary)]/5 ${selectedCategory === 'all' ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-foreground)]'
                                        }`}
                                    onClick={() => {
                                        handleCategoryChange('all');
                                        setIsSelectOpen(false);
                                    }}
                                >
                                    All Categories
                                </div>

                                {categories.map((category) => (
                                    <div
                                        key={category.key}
                                        className={`px-4 py-2.5 cursor-pointer hover:bg-[color:var(--ai-primary)]/5 ${selectedCategory === category.label ? 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-foreground)]'
                                            }`}
                                        onClick={() => {
                                            handleCategoryChange(category.label);
                                            setIsSelectOpen(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{category.label}</span>
                                            <span className="text-xs bg-[color:var(--ai-card-border)]/30 text-[color:var(--ai-muted)] rounded-full px-2 py-0.5">
                                                {category.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Selected filters display */}
            {(currentFilter || currentCategory !== 'all') && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-[color:var(--ai-muted)]">Active filters:</span>                    {currentFilter && (
                        <div className="inline-flex items-center gap-1 bg-[color:var(--ai-primary)]/10 dark:bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)] px-3 py-1 rounded-full text-sm">
                            <span>&quot;{currentFilter}&quot;</span>
                            <button
                                title="Clear search filter"
                                aria-label="Clear search filter" onClick={() => {
                                    setSearchText('');
                                    onFilterChange('');
                                }}
                                className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-primary)]/80 ml-1 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {currentCategory !== 'all' && (
                        <div className="inline-flex items-center gap-1 bg-[color:var(--ai-primary)]/10 dark:bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)] px-3 py-1 rounded-full text-sm">
                            <span>{currentCategory}</span>
                            <button
                                title="Clear category filter"
                                aria-label="Clear category filter" onClick={() => {
                                    setSelectedCategory('all');
                                    onCategoryChange('all');
                                }}
                                className="text-[color:var(--ai-primary)] hover:text-[color:var(--ai-primary)]/80 ml-1 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {(currentFilter || currentCategory !== 'all') && (
                        <button
                            title="Clear all filters"
                            aria-label="Clear all filters"
                            onClick={() => {
                                setSearchText('');
                                setSelectedCategory('all');
                                onFilterChange('');
                                onCategoryChange('all');
                            }}
                            className="text-sm text-[color:var(--ai-muted)] hover:text-[color:var(--ai-primary)] underline cursor-pointer"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CoursesFilter;

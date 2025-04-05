import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';

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

    // Extract unique categories from courses
    const categories = React.useMemo(() => {
        if (!context || !context.courses) return [];

        // Extract all tags from all courses
        const allTags = Object.values(context.courses).flatMap((course: any) =>
            course.tags || []
        );

        // Count occurrences of each tag
        const tagCounts = allTags.reduce((acc: { [key: string]: number }, tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        // Sort by count (descending)
        return Object.entries(tagCounts)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([tag]) => tag);
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
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search input */}
                <div className="flex-1">
                    <Input
                        placeholder="Search courses..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        startContent={
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        type="search"
                        size="lg"
                        className="w-full"
                    />
                </div>

                {/* Category dropdown */}
                <div className="md:w-60">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                className="w-full justify-between"
                                endContent={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                }
                            >
                                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Categories"
                            className="max-h-[300px] overflow-y-auto"
                        >
                            <DropdownItem
                                key="all"
                                onClick={() => handleCategoryChange('all')}
                                className={selectedCategory === 'all' ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                            >
                                All Categories
                            </DropdownItem>

                            {categories.map((category) => (
                                <DropdownItem
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={selectedCategory === category ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                                >
                                    <div>{category}</div>
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* Selected filters display */}
            {(currentFilter || currentCategory !== 'all') && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>

                    {currentFilter && (
                        <div className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm">
                            <span>"{currentFilter}"</span>
                            <button
                                title="Clear search filter"
                                aria-label="Clear search filter"
                                onClick={() => {
                                    setSearchText('');
                                    onFilterChange('');
                                }}
                                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 ml-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {currentCategory !== 'all' && (
                        <div className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm">
                            <span>{currentCategory}</span>
                            <button
                                title="Clear category filter"
                                aria-label="Clear category filter"
                                onClick={() => {
                                    setSelectedCategory('all');
                                    onCategoryChange('all');
                                }}
                                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 ml-1"
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
                            className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 underline"
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

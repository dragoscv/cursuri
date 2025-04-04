'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input, Button } from '@heroui/react'  // Updated to use HeroUI
import { useRouter, usePathname } from 'next/navigation'
import { useContext } from 'react'
import { AppContext } from './AppContext'

export default function SearchBar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const searchInputRef = useRef<HTMLInputElement>(null)
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()

    // Only show search on homepage
    const isHomePage = pathname === '/'

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }

    const { courses, products } = context

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node) &&
                isSearchOpen
            ) {
                setIsSearchOpen(false)
                setSearchResults([])
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isSearchOpen])

    // Focus input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearchOpen])

    // Keyboard shortcut (Ctrl+K or Command+K) to open search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setIsSearchOpen(true)
            }

            // ESC to close search
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false)
                setSearchResults([])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isSearchOpen])

    // Search function
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        const query = searchQuery.toLowerCase()

        // Search for courses that match the query
        const filteredCourses = Object.values(courses).filter((course: any) => {
            const name = course.name?.toLowerCase() || ''
            const description = course.description?.toLowerCase() || ''
            const difficulty = course.difficulty?.toLowerCase() || ''

            return (
                name.includes(query) ||
                description.includes(query) ||
                difficulty.includes(query)
            )
        })

        // Prepare the results with product info
        const results = filteredCourses.map((course: any) => {
            const product = products?.find((p: any) => p.id === course.priceProduct?.id)
            const price = product?.prices?.find((p: any) => p.id === course.price)

            return {
                ...course,
                image: product?.images?.[0] || '',
                formattedPrice: price ? `${price.unit_amount / 100} ${price.currency.toUpperCase()}` : 'Free',
            }
        })

        setSearchResults(results)
    }

    // Run search on query change
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            handleSearch()
        }, 300)

        return () => clearTimeout(delaySearch)
    }, [searchQuery])

    // Handle course selection
    const handleSelectCourse = (courseId: string) => {
        setIsSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
        router.push(`/courses/${courseId}`)
    }

    // If not on homepage, don't render the component
    if (!isHomePage) {
        return null
    }

    return (
        <div ref={searchContainerRef} className="relative z-50">
            {/* Search toggle button */}
            <Button
                variant="light"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                startContent={(
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                )}
            >
                Search courses...
                <kbd className="px-2 py-1 ml-2 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    ⌘K
                </kbd>
            </Button>

            {/* Mobile search button */}
            <Button
                isIconOnly
                variant="light"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden"
                aria-label="Search"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </Button>

            {/* Search modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/30 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-4">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                startContent={(
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                                endContent={
                                    searchQuery && (
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    )
                                }
                                classNames={{
                                    base: "w-full",
                                    inputWrapper: "bg-white dark:bg-gray-800"
                                }}
                            />
                        </div>

                        {/* Search results */}
                        <div className="max-h-[70vh] overflow-y-auto">
                            {searchResults.length > 0 ? (
                                <div className="p-2">
                                    {searchResults.map((course) => (
                                        <div
                                            key={course.id}
                                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => handleSelectCourse(course.id)}
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
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {course.name}
                                                    </h3>
                                                    {course.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                            {course.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-xs font-medium text-gray-900 dark:text-white">
                                                    {course.formattedPrice}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <p>No courses found for "{searchQuery}"</p>
                                </div>
                            ) : (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        Start typing to search for courses
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer with keyboard shortcuts */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            ESC
                                        </kbd>
                                        <span>to close</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            ↑
                                        </kbd>
                                        <kbd className="px-1.5 py-0.5 font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            ↓
                                        </kbd>
                                        <span>to navigate</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                        Enter
                                    </kbd>
                                    <span>to select</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
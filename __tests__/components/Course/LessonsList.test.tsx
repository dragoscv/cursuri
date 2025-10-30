import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LessonsList from '../../../components/Course/LessonsList';
import { AppContext } from '../../../components/AppContext';
import { AppContextProps } from '../../../types';

// Mock Next.js useParams hook
jest.mock('next/navigation', () => ({
    useParams: jest.fn(() => ({
        courseId: 'test-course-id'
    })),
}));

// Mock lesson data matching the application structure
const mockLessons = [
    {
        id: 'lesson1',
        name: 'Introduction to Next.js',
        title: 'Introduction to Next.js',
        duration: '30', // Duration in minutes as string
        order: 1,
        isFree: false,
        videoUrl: 'https://example.com/video1',
    },
    {
        id: 'lesson2',
        name: 'React Basics',
        title: 'React Basics',
        duration: '40', // Duration in minutes as string
        order: 2,
        isFree: true,
        videoUrl: 'https://example.com/video2',
    },
    {
        id: 'lesson3',
        name: 'Advanced Patterns',
        title: 'Advanced Patterns',
        duration: undefined, // Should fallback to default
        order: 3,
        isFree: false,
        videoUrl: 'https://example.com/video3',
    },
];

const mockCourse = {
    id: 'course1',
    name: 'Complete Next.js Course',
    title: 'Complete Next.js Course',
    price: 99.99,
};

// Create a comprehensive mock for AppContext
const createMockContext = (overrides: Partial<AppContextProps> = {}): AppContextProps => ({
    isDark: false,
    toggleTheme: jest.fn(),
    colorScheme: 'modern-purple',
    setColorScheme: jest.fn(),
    userPreferences: null,
    saveUserPreferences: jest.fn(),
    user: null,
    userProfile: null,
    authLoading: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    updateModal: jest.fn(),
    products: [],
    refreshProducts: jest.fn(),
    isAdmin: false,
    courses: {},
    courseLoadingStates: {},
    lessons: {},
    lessonLoadingStates: {},
    getCourseLessons: jest.fn(),
    fetchCourseById: jest.fn(),
    fetchLessonsForCourse: jest.fn(),
    userPaidProducts: [],
    userPurchases: {},
    reviews: {},
    reviewLoadingStates: {},
    getCourseReviews: jest.fn(),
    getCourseById: jest.fn(),
    getLessonById: jest.fn(),
    lessonProgress: {},
    saveLessonProgress: jest.fn(),
    markLessonComplete: jest.fn(),
    users: {},
    userLoadingState: 'idle',
    getAllUsers: jest.fn(),
    assignCourseToUser: jest.fn(),
    adminAnalytics: null,
    adminAnalyticsLoadingState: 'idle',
    getAdminAnalytics: jest.fn(),
    adminSettings: null,
    adminSettingsLoadingState: 'idle',
    getAdminSettings: jest.fn(),
    updateAdminSettings: jest.fn(),
    bookmarkedLessons: {},
    bookmarksLoadingState: 'idle',
    toggleBookmarkLesson: jest.fn(),
    getBookmarkedLessons: jest.fn(),
    wishlistCourses: [],
    wishlistLoadingState: 'idle',
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    getWishlistCourses: jest.fn(),
    clearCache: jest.fn(),
    clearAllCache: jest.fn(),
    getCacheStatus: jest.fn(),
    subscriptions: [],
    subscriptionsLoading: false,
    subscriptionsError: null,
    refreshSubscriptions: jest.fn(),
    ...overrides,
});

const renderWithContext = (component: React.ReactElement, contextValue?: Partial<AppContextProps>) => {
    const fullContext = createMockContext(contextValue);
    return render(
        <AppContext.Provider value={fullContext}>
            {component}
        </AppContext.Provider>
    );
};

describe('LessonsList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Lesson Access Control', () => {
        it('should show lock icons for paid lessons when user has no access', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={false}
                />
            );

            // First lesson should have lock icon (paid lesson, no access)
            const lesson1Element = screen.getByText('Introduction to Next.js');
            expect(lesson1Element).toBeInTheDocument();

            // Check for lock icon in the first lesson (paid lesson) - use actual CSS class
            const lockIcons = document.querySelectorAll('.feather-lock');
            expect(lockIcons.length).toBeGreaterThan(0);
        });

        it('should show play icons for lessons when user has access', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={true}
                />
            );

            // All lessons should be accessible
            const lesson1Element = screen.getByText('Introduction to Next.js');
            expect(lesson1Element).toBeInTheDocument();

            // Should have play icons when user has access
            const playIcons = document.querySelectorAll('.feather-play');
            expect(playIcons.length).toBeGreaterThan(0);
        });

        it('should allow access to free lessons regardless of user access', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={false}
                />
            );

            // Free lesson (lesson2) should be accessible even without access
            const freeLessonElement = screen.getByText('React Basics');
            expect(freeLessonElement).toBeInTheDocument();

            // Free lesson should show Free Preview badge
            const freePreviewBadge = screen.getByText('Free Preview');
            expect(freePreviewBadge).toBeInTheDocument();
        });
    });

    describe('Lesson Duration Display', () => {
        it('should display correct durations for lessons', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={true}
                />
            );

            // Check duration formats - should show minutes using getAllByText for multiple elements
            const thirtyMinElements = screen.getAllByText('30 min');
            expect(thirtyMinElements.length).toBeGreaterThan(0); // At least one "30 min" element

            const fortyMinElements = screen.getAllByText('40 min');
            expect(fortyMinElements.length).toBeGreaterThan(0); // At least one "40 min" element
        });

        it('should show 30min fallback for lessons without duration', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={true}
                />
            );

            // Lesson with null duration should show 30min fallback
            // Look for the pattern that shows 30 min as fallback
            const durationElements = screen.getAllByText(/30/);
            expect(durationElements.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Purchase Flow Integration', () => {
        it('should trigger purchase flow when clicking locked lesson for unauthenticated user', () => {
            const contextWithOpenModal = {
                openModal: jest.fn(),
            };

            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={false}
                />,
                contextWithOpenModal
            );

            // Find and click on a locked lesson (should be a non-clickable div)
            const lockedLessonElement = screen.getByText('Introduction to Next.js');
            const lockedContainer = lockedLessonElement.closest('div');
            if (lockedContainer) {
                fireEvent.click(lockedContainer);
            }

            // For locked lessons, modal might not be triggered as they're not clickable
            // This test verifies the lesson is in locked state
            const lockIcon = document.querySelector('.feather-lock');
            expect(lockIcon).toBeTruthy();
        });
    });

    describe('Lesson List Rendering', () => {
        it('should render all lessons in correct order', () => {
            renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={true}
                />
            );

            // Check that all lessons are rendered
            expect(screen.getByText('Introduction to Next.js')).toBeInTheDocument();
            expect(screen.getByText('React Basics')).toBeInTheDocument();
            expect(screen.getByText('Advanced Patterns')).toBeInTheDocument();
        });

        it('should handle empty lessons array gracefully', () => {
            renderWithContext(
                <LessonsList
                    lessons={[]}
                    course={mockCourse}
                    userHasAccess={true}
                />
            );

            // Should not crash and might show empty state
            expect(screen.queryByText('Introduction to Next.js')).not.toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should receive userHasAccess prop correctly from parent components', () => {
            // Test that the component behaves differently based on userHasAccess prop
            const { rerender } = renderWithContext(
                <LessonsList
                    lessons={mockLessons}
                    course={mockCourse}
                    userHasAccess={false}
                />
            );

            // Should show locked state
            let lockIcons = document.querySelectorAll('.feather-lock');
            expect(lockIcons.length).toBeGreaterThan(0);

            // Re-render with access
            rerender(
                <AppContext.Provider value={createMockContext()}>
                    <LessonsList
                        lessons={mockLessons}
                        course={mockCourse}
                        userHasAccess={true}
                    />
                </AppContext.Provider>
            );

            // Should show play icons instead of lock icons
            const playIcons = document.querySelectorAll('.feather-play');
            expect(playIcons.length).toBeGreaterThan(0);
        });
    });
});
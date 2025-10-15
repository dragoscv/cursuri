import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock HeroUI Tooltip to avoid DOM issues
jest.mock('@heroui/react', () => ({
    Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
        <div data-testid="tooltip" title={content}>
            {children}
        </div>
    ),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Breadcrumbs Component', () => {
    const mockContext: Partial<AppContextProps> = {
        courses: {
            'course-1': {
                id: 'course-1',
                name: 'TypeScript Fundamentals',
                description: 'Learn TypeScript basics',
                price: 99,
                imageUrl: '/test-image.jpg',
                duration: '5 hours',
                lessonsCount: 10,
                level: 'Beginner',
                createdAt: '2022-01-01T00:00:00Z',
                updatedAt: '2022-01-01T00:00:00Z',
                status: 'active',
                tags: ['typescript', 'programming'],
            },
            'course-2': {
                id: 'course-2',
                name: 'React Advanced Patterns',
                description: 'Advanced React concepts',
                price: 149,
                imageUrl: '/test-image-2.jpg',
                duration: '8 hours',
                lessonsCount: 15,
                level: 'Advanced',
                createdAt: '2022-01-01T00:00:00Z',
                updatedAt: '2022-01-01T00:00:00Z',
                status: 'active',
                tags: ['react', 'javascript'],
            },
        },
        lessons: {
            'course-1': {
                'lesson-1': {
                    id: 'lesson-1',
                    name: 'Introduction to TypeScript',
                    description: 'Getting started with TypeScript',
                    duration: '30 minutes',
                    videoUrl: '/videos/lesson-1.mp4',
                    order: 1,
                    isFree: true,
                    content: 'Lesson content here',
                },
                'lesson-2': {
                    id: 'lesson-2',
                    name: 'TypeScript Types',
                    description: 'Understanding types in TypeScript',
                    duration: '45 minutes',
                    videoUrl: '/videos/lesson-2.mp4',
                    order: 2,
                    isFree: false,
                    content: 'Advanced lesson content',
                },
            },
            'course-2': {
                'lesson-3': {
                    id: 'lesson-3',
                    name: 'React Hooks Deep Dive',
                    description: 'Advanced React hooks patterns',
                    duration: '60 minutes',
                    videoUrl: '/videos/lesson-3.mp4',
                    order: 1,
                    isFree: false,
                    content: 'Hooks content here',
                },
            },
        },
    };

    const renderWithContext = (contextValue: Partial<AppContextProps> = mockContext) => {
        return render(
            <AppContext.Provider value={contextValue as AppContextProps}>
                <Breadcrumbs />
            </AppContext.Provider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Homepage Navigation', () => {
        it('should not render breadcrumbs on the home page', () => {
            mockUsePathname.mockReturnValue('/');
            renderWithContext();

            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });
    });

    describe('Courses Page Navigation', () => {
        it('should not render breadcrumbs on main courses page', () => {
            mockUsePathname.mockReturnValue('/courses');
            renderWithContext();

            // Single item breadcrumb should not render navigation (per component logic)
            const breadcrumb = screen.queryByRole('navigation');
            expect(breadcrumb).not.toBeInTheDocument();
        });
    });

    describe('Individual Course Navigation', () => {
        it('should render breadcrumbs for a specific course page', () => {
            mockUsePathname.mockReturnValue('/courses/course-1');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Check Courses link
            const coursesLink = screen.getByRole('link', { name: 'Courses' });
            expect(coursesLink).toBeInTheDocument();
            expect(coursesLink).toHaveAttribute('href', '/courses');

            // Check current course name
            const courseName = screen.getByText('TypeScript Fundamentals');
            expect(courseName).toBeInTheDocument();
            expect(courseName).toHaveAttribute('aria-current', 'page');
        });

        it('should render breadcrumbs for unknown course with fallback name', () => {
            mockUsePathname.mockReturnValue('/courses/unknown-course');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Should show fallback "Course" name
            const courseName = screen.getByText('Course');
            expect(courseName).toBeInTheDocument();
            expect(courseName).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('Lesson Page Navigation', () => {
        it('should render complete breadcrumb trail for lesson pages', () => {
            mockUsePathname.mockReturnValue('/courses/course-1/lessons/lesson-1');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Check Courses link
            const coursesLink = screen.getByRole('link', { name: 'Courses' });
            expect(coursesLink).toBeInTheDocument();
            expect(coursesLink).toHaveAttribute('href', '/courses');

            // Check Course link
            const courseLink = screen.getByRole('link', { name: 'TypeScript Fundamentals' });
            expect(courseLink).toBeInTheDocument();
            expect(courseLink).toHaveAttribute('href', '/courses/course-1');

            // Check current lesson name
            const lessonName = screen.getByText('Introduction to TypeScript');
            expect(lessonName).toBeInTheDocument();
            expect(lessonName).toHaveAttribute('aria-current', 'page');
        });

        it('should handle unknown lesson with fallback name', () => {
            mockUsePathname.mockReturnValue('/courses/course-1/lessons/unknown-lesson');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Should show fallback "Lesson" name
            const lessonName = screen.getByText('Lesson');
            expect(lessonName).toBeInTheDocument();
            expect(lessonName).toHaveAttribute('aria-current', 'page');
        });

        it('should handle unknown course and lesson with fallback names', () => {
            mockUsePathname.mockReturnValue('/courses/unknown-course/lessons/unknown-lesson');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Check fallback course name
            const courseLink = screen.getByRole('link', { name: 'Course' });
            expect(courseLink).toBeInTheDocument();

            // Check fallback lesson name
            const lessonName = screen.getByText('Lesson');
            expect(lessonName).toBeInTheDocument();
        });
    });

    describe('Path Separators', () => {
        it('should include path separators between breadcrumb items', () => {
            mockUsePathname.mockReturnValue('/courses/course-1/lessons/lesson-1');
            renderWithContext();

            // Should have separators (/) between items
            const separators = screen.getAllByText('/');
            expect(separators).toHaveLength(2); // Between Courses/Course and Course/Lesson
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            mockUsePathname.mockReturnValue('/courses/course-1');
            renderWithContext();

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb');
        });

        it('should mark the current page with aria-current', () => {
            mockUsePathname.mockReturnValue('/courses/course-1/lessons/lesson-1');
            renderWithContext();

            const currentPage = screen.getByText('Introduction to TypeScript');
            expect(currentPage).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty courses and lessons data', () => {
            mockUsePathname.mockReturnValue('/courses/course-1');
            renderWithContext({ courses: {}, lessons: {} });

            const breadcrumb = screen.getByRole('navigation');
            expect(breadcrumb).toBeInTheDocument();

            // Should show fallback "Course" name
            const courseName = screen.getByText('Course');
            expect(courseName).toBeInTheDocument();
        });

        it('should not render for single breadcrumb item', () => {
            mockUsePathname.mockReturnValue('/courses');
            renderWithContext();

            // Single item breadcrumb should not render the navigation (per component logic)
            const breadcrumb = screen.queryByRole('navigation');
            expect(breadcrumb).not.toBeInTheDocument();
        });

        it('should handle malformed URLs gracefully', () => {
            mockUsePathname.mockReturnValue('/courses//lessons/');
            renderWithContext();

            // Should not crash and should handle empty segments
            expect(() => renderWithContext()).not.toThrow();
        });
    });

    describe('Course and Lesson Name Display', () => {
        it('should display correct course names for different courses', () => {
            mockUsePathname.mockReturnValue('/courses/course-2');
            renderWithContext();

            const courseName = screen.getByText('React Advanced Patterns');
            expect(courseName).toBeInTheDocument();
            expect(courseName).toHaveAttribute('aria-current', 'page');
        });

        it('should display correct lesson names for different lessons', () => {
            mockUsePathname.mockReturnValue('/courses/course-2/lessons/lesson-3');
            renderWithContext();

            const lessonName = screen.getByText('React Hooks Deep Dive');
            expect(lessonName).toBeInTheDocument();
            expect(lessonName).toHaveAttribute('aria-current', 'page');
        });
    });
});
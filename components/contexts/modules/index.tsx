import React, { ReactNode } from 'react';

// Import all context providers
import { CacheProvider, useCache } from './cacheContext';
import { ThemeProvider, useTheme } from './themeContext';
import { AuthProvider, useAuth } from './authContext';
// import { ModalProvider, useModal } from './modalContext';
import { CoursesProvider, useCourses } from './coursesContext';
import { LessonsProvider, useLessons } from './lessonsContext';
import { ReviewsProvider, useReviews } from './reviewsContext';
import { AdminProvider, useAdmin } from './adminContext';

// Re-export all hooks
export { useCache } from './cacheContext';
export { useTheme } from './themeContext';
export { useAuth } from './authContext';
// export { useModal } from './modalContext';
// export type { ModalProps } from './modalContext';
export { useCourses } from './coursesContext';
export type { Course } from './coursesContext';
export { useLessons } from './lessonsContext';
export { useReviews } from './reviewsContext';
export { useAdmin } from './adminContext';

// Consolidated provider that combines all providers
interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <CacheProvider>
            {/* Auth must come before Theme since Theme depends on Auth */}
            <AuthProvider>
                <ThemeProvider>
                    {/* ModalProvider temporarily disabled due to module recognition issue */}
                    <CoursesProvider>
                        <LessonsProvider>
                            <ReviewsProvider>
                                <AdminProvider>
                                    {children}
                                </AdminProvider>
                            </ReviewsProvider>
                        </LessonsProvider>
                    </CoursesProvider>
                    {/* End ModalProvider */}
                </ThemeProvider>
            </AuthProvider>
        </CacheProvider>
    );
};

// Export combined hook for accessing all contexts
export function useAppContext() {
    const cache = useCache();
    const theme = useTheme();
    const auth = useAuth();
    // const modal = useModal();
    const courses = useCourses();
    const lessons = useLessons();
    const reviews = useReviews();
    const admin = useAdmin(); return {
        cache,
        theme,
        auth,
        // modal,
        courses,
        lessons,
        reviews,
        admin
    };
}

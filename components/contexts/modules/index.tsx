import React, { ReactNode } from 'react';

/**
 * Modular Context System
 * 
 * PHASE 5 UPDATE: We are now in the final phase of the migration.
 * Legacy context will be completely removed on October 15, 2025.
 * 
 * This file exports all context providers and hooks from the modular context system.
 * All components must use these hooks directly instead of the legacy AppContext.
 * 
 * Example usage:
 * ```tsx
 * import { useAuth, useCourses, useToast } from '@/components/contexts/modules';
 * import { trackComponentMigration } from '@/utils/migration-tracker';
 * 
 * const MyComponent = () => {
 *   // Track migration status
 *   trackComponentMigration('MyComponent', ['useAuth', 'useCourses', 'useToast']);
 *   
 *   // Use modular contexts
 *   const { user } = useAuth();
 *   const { courses } = useCourses();
 *   const toast = useToast();
 *   
 *   // Component logic
 * };
 * ```
 * 
 * IMPORTANT TIMELINE:
 * - September 1, 2025: Hard deprecation begins (errors in development)
 * - September 30, 2025: Compatibility layer removed
 * - October 15, 2025: Legacy AppContext completely removed
 */

// Import all context providers
import { CacheProvider } from './cacheContext';
import { ThemeProvider } from './themeContext';
import { AuthProvider } from './authContext';
import { ModalProvider } from './modalContext';
import { CoursesProvider } from './coursesContext';
import { LessonsProvider } from './lessonsContext';
import { ReviewsProvider } from './reviewsContext';
import { AdminProvider } from './adminContext';
import { UserDataProvider } from './userDataContext';
import { ProductsProvider } from './productsContext';
import { ToastProvider } from './toastContext';
import { ModalRenderer } from './ModalRenderer';

// Re-export all hooks
export { useCache } from './cacheContext';
export { useTheme } from './themeContext';
export { useAuth } from './authContext';
export { useModal } from './modalContext';
export type { ModalProps } from './modalContext';
export { useCourses } from './coursesContext';
export type { Course } from './coursesContext';
export { useLessons } from './lessonsContext';
export type { Lesson } from './lessonsContext';
export { useReviews } from './reviewsContext';
export type { Review } from './reviewsContext';
export { useAdmin } from './adminContext';
export { useUserData } from './userDataContext';
export { useProducts } from './productsContext';
export { useToast } from './toastContext';
export type { ToastType, ToastPosition } from '../../../types';

// Export providers for testing purposes
export { CacheProvider } from './cacheContext';
export { ThemeProvider } from './themeContext';
export { AuthProvider } from './authContext';
export { ModalProvider } from './modalContext';
export { CoursesProvider } from './coursesContext';
export { LessonsProvider } from './lessonsContext';
export { ReviewsProvider } from './reviewsContext';
export { AdminProvider } from './adminContext';
export { UserDataProvider } from './userDataContext';
export { ProductsProvider } from './productsContext';
export { ToastProvider } from './toastContext';

// Consolidated provider that combines all providers
interface AppProvidersProps {
    children: ReactNode;
}

/**
 * AppProviders is the main provider component that aggregates all modular context providers.
 * This should be used at the root of your application.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <CacheProvider>
            {/* Auth must come before Theme since Theme depends on Auth */}
            <AuthProvider>
                <ThemeProvider>
                    <ModalProvider>
                        <CoursesProvider>
                            <LessonsProvider>
                                <ReviewsProvider>
                                    <AdminProvider>
                                        <UserDataProvider>
                                            <ProductsProvider>
                                                <ToastProvider>
                                                    {children}
                                                    <ModalRenderer />
                                                </ToastProvider>
                                            </ProductsProvider>
                                        </UserDataProvider>
                                    </AdminProvider>
                                </ReviewsProvider>
                            </LessonsProvider>
                        </CoursesProvider>
                    </ModalProvider>
                </ThemeProvider>
            </AuthProvider>
        </CacheProvider>
    );
};

'use client'

import React, { ReactNode } from 'react';
import { AuthProvider } from './modules/authContext';
import { ThemeProvider } from './modules/themeContext';
// import { ModalProvider, useModal } from './modules/modalContext';
import { CacheProvider } from './modules/cacheContext';
import { UserDataProvider } from './modules/userDataContext';
import { CoursesProvider } from './modules/coursesContext';
import { LessonsProvider } from './modules/lessonsContext';
import { ReviewsProvider } from './modules/reviewsContext';
// import ModalComponent from '@/components/Modal';

// Combined providers props
interface AppProvidersProps {
    children: ReactNode;
}

// Modal renderer component - temporarily disabled due to module recognition issue
// const ModalRenderer: React.FC = () => {
//     const { getActiveModals } = useModal();
//     const modals = getActiveModals();

//     return (
//         <>
//             {modals.map((modal: any) => (
//                 <ModalComponent key={modal.id} {...modal} />
//             ))}
//         </>
//     );
// };

// Main app providers component that combines all contexts
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <CacheProvider>
            <AuthProvider>
                <ThemeProvider>
                    {/* ModalProvider temporarily disabled due to module recognition issue */}
                    <UserDataProvider>
                        <CoursesProvider>
                            <LessonsProvider>
                                <ReviewsProvider>
                                    {children}
                                    {/* ModalRenderer temporarily disabled */}
                                </ReviewsProvider>
                            </LessonsProvider>
                        </CoursesProvider>
                    </UserDataProvider>
                    {/* End ModalProvider */}
                </ThemeProvider>
            </AuthProvider>
        </CacheProvider>
    );
};

export default AppProviders;

'use client'

import React, { createContext, useState, useEffect, useReducer, useCallback } from 'react';

import { getProducts } from 'firewand';
import { firebaseApp, firestoreDB, firebaseAuth, firebaseStorage } from '@/utils/firebase/firebase.config';
import { stripePayments } from '@/utils/firebase/stripe';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, collection, getDocs, query, where, onSnapshot, updateDoc, setDoc, getDoc, Timestamp, Unsubscribe, getFirestore } from 'firebase/firestore';
import ModalComponent from '@/components/Modal';

import { AppContextProps, UserLessonProgress } from '@/types';

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const initialState = {
        modals: [],
        products: [],
        isAdmin: false,
        courses: {},
        lessons: {},
        userPaidProducts: [],
        reviews: {},
        lessonProgress: {},
    };

    const reducer = (state: any, action: any) => {
        switch (action.type) {
            case 'ADD_MODAL': {
                const existingModalIndex = state.modals.findIndex((modal: any) => modal.id === action.payload.id);
                if (existingModalIndex !== -1) {
                    return {
                        ...state,
                        modals: state.modals.map((modal: any, index: any) =>
                            index === existingModalIndex
                                ? {
                                    ...modal,
                                    isOpen: true,
                                    size: action.payload.size,
                                    scrollBehavior: action.payload.scrollBehavior,
                                    isDismissable: action.payload.isDismissable,
                                    backdrop: action.payload.backdrop,
                                    hideCloseButton: action.payload.hideCloseButton,
                                    hideCloseIcon: action.payload.hideCloseIcon,
                                    modalBody: action.payload.modalBody,
                                    headerDisabled: action.payload.headerDisabled,
                                    modalHeader: action.payload.modalHeader,
                                    footerDisabled: action.payload.footerDisabled,
                                    footerButtonText: action.payload.footerButtonText,
                                    footerButtonClick: action.payload.footerButtonClick,
                                    noReplaceURL: action.payload.noReplaceURL,
                                    modalBottomComponent: action.payload.modalBottomComponent,
                                }
                                : modal
                        ),
                    };
                } else {
                    return { ...state, modals: [...state.modals, action.payload] };
                }
            }
            case 'CLOSE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload
                            ? { ...modal, isOpen: false }
                            : modal
                    )
                };
            case 'UPDATE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload.id
                            ? { ...modal, ...action.payload }
                            : modal
                    )
                };
            case 'SET_PRODUCTS':
                return {
                    ...state,
                    products: action.payload
                };
            case 'SET_IS_ADMIN':
                return {
                    ...state,
                    isAdmin: action.payload
                };
            case 'SET_COURSES':
                return {
                    ...state,
                    courses: {
                        ...state.courses,
                        [action.payload.courseId]: action.payload.course
                    }
                };
            case 'SET_LESSONS':
                return {
                    ...state,
                    lessons: {
                        ...state.lessons,
                        [action.payload.courseId]: {
                            ...state.lessons[action.payload.courseId],
                            [action.payload.lessonId]: action.payload.lesson
                        }
                    }
                };
            case 'SET_REVIEWS':
                return {
                    ...state,
                    reviews: {
                        ...state.reviews,
                        [action.payload.courseId]: {
                            ...state.reviews[action.payload.courseId],
                            [action.payload.reviewId]: action.payload.review
                        }
                    }
                };
            case 'SET_USER_PAID_PRODUCTS':
                return {
                    ...state,
                    userPaidProducts: action.payload
                };
            case 'SET_LESSON_PROGRESS':
                return {
                    ...state,
                    lessonProgress: {
                        ...state.lessonProgress,
                        [action.payload.courseId]: {
                            ...state.lessonProgress[action.payload.courseId],
                            [action.payload.lessonId]: action.payload.progress
                        }
                    }
                };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    const toggleTheme = () => {
        const newDarkMode = !isDark;
        setIsDark(newDarkMode);

        // Apply dark mode class to HTML element
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save preference to localStorage
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    // Initialize theme from localStorage on component mount
    useEffect(() => {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (shouldUseDark) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const openModal = useCallback((props: any) => {
        dispatch({ type: 'ADD_MODAL', payload: props });
    }, [dispatch]);

    const closeModal = useCallback((id: string) => {
        dispatch({ type: 'CLOSE_MODAL', payload: id });
    }, [dispatch]);

    const updateModal = useCallback((props: any) => {
        dispatch({ type: 'UPDATE_MODAL', payload: props });
    }, [dispatch]);

    const getCourseLessons = useCallback(async (courseId: string) => {
        const lessons = state.lessons;
        if (Object.keys(lessons).includes(courseId)) {
            return () => { }; // Return a no-op function if already fetched
        }
        const db = getFirestore(firebaseApp);

        const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
        const q = query(lessonsCollection, where("status", "==", "active"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_LESSONS', payload: { courseId: courseId, lessonId: doc.id, lesson: data } });
            });
        });

        // Return the unsubscribe function
        return unsubscribe;
    }, [state.lessons, dispatch]);

    const getCourseReviews = useCallback(async (courseId: string) => {
        const reviews = state.reviews;
        if (Object.keys(reviews).includes(courseId)) {
            return () => { }; // Return a no-op function if already fetched
        }

        const db = getFirestore(firebaseApp);

        const docRef = collection(db, `courses/${courseId}/reviews`);
        const q = query(docRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_REVIEWS', payload: { courseId: courseId, reviewId: doc.id, review: data } });
            });
        });

        // Return the unsubscribe function
        return unsubscribe;
    }, [state.reviews, dispatch]);

    const saveLessonProgress = useCallback(async (courseId: string, lessonId: string, position: number, isCompleted: boolean = false) => {
        if (!user) return;

        try {
            const progressRef = doc(firestoreDB, `users/${user.uid}/progress/${courseId}_${lessonId}`);
            const progressExists = await getDoc(progressRef);

            const progressData: UserLessonProgress = {
                userId: user.uid,
                courseId,
                lessonId,
                lastPosition: position,
                isCompleted,
                lastUpdated: Timestamp.now()
            };

            if (progressExists.exists()) {
                // Convert UserLessonProgress to a plain object for Firebase updateDoc
                await updateDoc(progressRef, {
                    userId: progressData.userId,
                    courseId: progressData.courseId,
                    lessonId: progressData.lessonId,
                    lastPosition: progressData.lastPosition,
                    isCompleted: progressData.isCompleted,
                    lastUpdated: progressData.lastUpdated
                });
            } else {
                await setDoc(progressRef, progressData);
            }

            dispatch({
                type: 'SET_LESSON_PROGRESS',
                payload: {
                    courseId,
                    lessonId,
                    progress: progressData
                }
            });

            return true;
        } catch (error) {
            console.error("Error saving lesson progress:", error);
            return false;
        }
    }, [user, dispatch]);

    const markLessonComplete = useCallback(async (courseId: string, lessonId: string) => {
        return saveLessonProgress(courseId, lessonId, 0, true);
    }, [saveLessonProgress]);

    const getUserLessonProgress = useCallback(async () => {
        if (!user) return () => { }; // Return a no-op function when user is null

        try {
            const progressRef = collection(firestoreDB, "users", user.uid, "progress");
            const q = query(progressRef);

            // Explicitly type this as a Firebase Unsubscribe function
            const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as UserLessonProgress;
                    const { courseId, lessonId } = data;

                    dispatch({
                        type: 'SET_LESSON_PROGRESS',
                        payload: {
                            courseId,
                            lessonId,
                            progress: data
                        }
                    });
                });
            });

            // Since this is an async function, we need to return a Promise that resolves to the unsubscribe function
            return Promise.resolve(unsubscribe);
        } catch (error) {
            console.error("Error fetching lesson progress:", error);
            return Promise.resolve(() => { }); // Return a Promise that resolves to a no-op function in case of error
        }
    }, [user, dispatch]);

    useEffect(() => {
        // Store the auth unsubscribe function in a variable so we can clean up
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUser(user);
                if (user.email === 'vladulescu.catalin@gmail.com') {
                    dispatch({ type: 'SET_IS_ADMIN', payload: true });
                } else {
                    dispatch({ type: 'SET_IS_ADMIN', payload: false });
                }
            } else {
                setUser(null);
            }
        });

        // Return the unsubscribe function for cleanup
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        if (user) {
            // Create local variable to hold unsubscribe function
            let cleanupFunction: (() => void) | null = null;

            // Get the unsubscribe function asynchronously
            getUserLessonProgress()
                .then(unsubFunction => {
                    // Store the function so we can call it during cleanup
                    if (typeof unsubFunction === 'function') {
                        cleanupFunction = unsubFunction;
                    }
                })
                .catch(err => {
                    console.error("Error getting unsubscribe function:", err);
                });

            // Return cleanup function that uses the stored function if available
            return () => {
                if (cleanupFunction) {
                    cleanupFunction();
                }
            };
        }
        return () => { }; // Return a no-op function when there's no user
    }, [user, getUserLessonProgress]);

    useEffect(() => {
        const payments = stripePayments(firebaseApp);
        getProducts(payments, {
            includePrices: true,
            activeOnly: true,
        }).then((products) => {
            // Filter products by app name in metadata
            const appName = process.env.NEXT_PUBLIC_APP_NAME;
            const filteredProducts = appName
                ? products.filter(product =>
                    product.metadata && product.metadata.app === appName
                )
                : products;

            dispatch({ type: 'SET_PRODUCTS', payload: filteredProducts });
        });
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            const q = query(collection(firestoreDB, "courses"), where("status", "==", "active"));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                dispatch({ type: 'SET_COURSES', payload: { courseId: doc.id, course: data } });
            });
        }
        fetchCourses();
    }, []);

    useEffect(() => {
        if (user) {
            const collectionRef = collection(firestoreDB, `customers/${user.uid}/payments`);
            const q = query(collectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const userPaidProducts: any = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    if (data.status === 'succeeded') userPaidProducts.push(data);
                });
                dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: userPaidProducts });
            });
            // Properly type the unsubscribe function to avoid type errors
            return () => {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
        } else {
            dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: [] });
            return () => { }; // Return a no-op function when user is null
        }
    }, [user]);

    return (
        <AppContext.Provider value={{
            isDark, toggleTheme,
            user,
            isAdmin: state.isAdmin,
            openModal, closeModal, updateModal,
            products: state.products,
            courses: state.courses,
            lessons: state.lessons,
            getCourseLessons,
            userPaidProducts: state.userPaidProducts,
            reviews: state.reviews,
            getCourseReviews,
            lessonProgress: state.lessonProgress,
            saveLessonProgress,
            markLessonComplete
        }}>
            {children}
            {state.modals.map((modal: any) => (
                <ModalComponent key={modal.id} {...modal} />
            ))}
        </AppContext.Provider>
    );
};
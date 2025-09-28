'use client'

import React, { createContext, useState, useEffect, useReducer, useCallback } from 'react';

import { getProducts } from 'firewand';
import { firebaseApp, firestoreDB, firebaseAuth } from '@/utils/firebase/firebase.config';
import { stripePayments } from '@/utils/firebase/stripe';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, collection, getDocs, query, where, onSnapshot, updateDoc, setDoc, getDoc, Timestamp, Unsubscribe, getFirestore, limit, collectionGroup, deleteDoc } from 'firebase/firestore';
import ModalComponent from '@/components/Modal';
import { useModal } from './contexts/useModal';
import OnboardingModal from './OnboardingModal';

import { AppContextProps, UserLessonProgress, ColorScheme, UserPreferences, UserProfile, AdminSettings, BookmarkedLessons, CacheOptions, CacheStatus } from '@/types';
import { UserRole } from '@/utils/firebase/adminAuth';
import { appReducer, initialState } from './contexts/appReducer';
import { generateCacheMetadata, isCacheExpired, saveToLocalStorage, loadFromLocalStorage, generateCacheKey, clearLocalStorageCache, clearAllLocalStorageCache } from '@/utils/caching';

export const AppContext = createContext<AppContextProps | undefined>(undefined);

// Default user preferences
const defaultUserPreferences: UserPreferences = {
    isDark: false,
    colorScheme: 'modern-purple',
    emailNotifications: true,
    courseUpdates: true,
    marketingEmails: false,
    language: 'en',
    lastUpdated: new Date()
};

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    persist: false,
    cacheKey: undefined
};

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    // Debug: Log that the provider is being initialized
    console.log('AppContextProvider: Initializing...');

    const [isDark, setIsDark] = useState(false);
    const [colorScheme, setColorScheme] = useState<ColorScheme>('modern-purple');
    const [user, setUser] = useState<User | null>(null);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [state, dispatch] = useReducer(appReducer, initialState);

    // Modal logic moved to useModal hook
    const { openModal, closeModal, updateModal } = useModal(dispatch);

    // Utility to check if a request is pending
    const isRequestPending = useCallback((key: string) => {
        return !!state.pendingRequests[key];
    }, [state.pendingRequests]);

    // Utility to set request pending status
    const setRequestPending = useCallback((key: string, isPending: boolean) => {
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key, isPending } });
    }, [dispatch]);

    // Cache management utilities
    const clearCache = useCallback((cacheKey?: string) => {
        dispatch({ type: 'CLEAR_CACHE', payload: cacheKey });
        if (cacheKey) {
            clearLocalStorageCache(cacheKey);
        }
    }, [dispatch]);

    const clearAllCache = useCallback(() => {
        dispatch({ type: 'CLEAR_CACHE' });
        clearAllLocalStorageCache();
    }, [dispatch]);

    const getCacheStatus = useCallback((cacheKey: string): CacheStatus => {
        if (cacheKey.startsWith('course_')) {
            const courseId = cacheKey.replace('course_', '');
            return state.courseLoadingStates[courseId] || 'idle';
        } else if (cacheKey.startsWith('lessons_')) {
            const courseId = cacheKey.replace('lessons_', '');
            return state.lessonLoadingStates[courseId]?.[cacheKey] || 'idle';
        } else if (cacheKey.startsWith('reviews_')) {
            const courseId = cacheKey.replace('reviews_', '');
            return state.reviewLoadingStates[courseId] || 'idle';
        } else if (cacheKey === 'users') {
            return state.userLoadingState;
        } else if (cacheKey === 'adminAnalytics') {
            return state.adminAnalyticsLoadingState;
        } else if (cacheKey === 'adminSettings') {
            return state.adminSettingsLoadingState;
        } else if (cacheKey === 'bookmarks') {
            return state.bookmarksLoadingState;
        } else if (cacheKey === 'wishlist') {
            return state.wishlistLoadingState;
        }
        return 'idle';
    }, [
        state.courseLoadingStates,
        state.lessonLoadingStates,
        state.reviewLoadingStates,
        state.userLoadingState,
        state.adminAnalyticsLoadingState,
        state.adminSettingsLoadingState,
        state.bookmarksLoadingState,
        state.wishlistLoadingState
    ]);

    const toggleTheme = useCallback(() => {
        const newDarkMode = !isDark;
        setIsDark(newDarkMode);

        // Apply dark mode class to HTML element
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Save preference to localStorage for immediate use
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

        // Update preferences in state and Firestore if user is logged in
        if (user) {
            saveUserPreferences({ isDark: newDarkMode });
        }
    }, [isDark, user]);

    // Handle color scheme changes
    const handleColorSchemeChange = useCallback((scheme: ColorScheme) => {
        setColorScheme(scheme);

        // Remove all existing color scheme classes
        document.documentElement.classList.remove(
            'theme-modern-purple',
            'theme-black-white',
            'theme-green-neon',
            'theme-blue-ocean',
            'theme-brown-sunset',
            'theme-yellow-morning',
            'theme-red-blood',
            'theme-pink-candy'
        );

        // Add the new color scheme class
        document.documentElement.classList.add(`theme-${scheme}`);

        // Save to localStorage for immediate use
        localStorage.setItem('colorScheme', scheme);

        // Update preferences in state and Firestore if user is logged in
        if (user) {
            saveUserPreferences({ colorScheme: scheme });
        }
    }, [user]);

    // Save user preferences to Firestore
    const saveUserPreferences = useCallback(async (preferences: Partial<UserPreferences>): Promise<boolean> => {
        if (!user) return false;

        try {
            const preferencesRef = doc(firestoreDB, `users/${user.uid}/profile/preferences`);
            const preferencesExists = await getDoc(preferencesRef);

            const updatedPreferences = {
                ...(preferencesExists.exists() ? preferencesExists.data() as UserPreferences : defaultUserPreferences),
                ...preferences,
                lastUpdated: Timestamp.now()
            };

            // Save to Firestore
            if (preferencesExists.exists()) {
                await updateDoc(preferencesRef, updatedPreferences);
            } else {
                await setDoc(preferencesRef, updatedPreferences);
            }

            // Update local state
            setUserPreferences(updatedPreferences as UserPreferences);

            return true;
        } catch (error) {
            console.error("Error saving user preferences:", error);
            return false;
        }
    }, [user]);

    // Get user preferences from Firestore
    const getUserPreferences = useCallback(async () => {
        if (!user) return null;

        try {
            const preferencesRef = doc(firestoreDB, `users/${user.uid}/profile/preferences`);
            const preferencesSnapshot = await getDoc(preferencesRef);

            if (preferencesSnapshot.exists()) {
                const preferences = preferencesSnapshot.data() as UserPreferences;

                // Update local state with fetched preferences
                setUserPreferences(preferences);
                setIsDark(preferences.isDark);
                setColorScheme(preferences.colorScheme);

                // Apply theme settings
                if (preferences.isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }

                // Remove all color scheme classes and add the correct one
                document.documentElement.classList.remove(
                    'theme-modern-purple',
                    'theme-black-white',
                    'theme-green-neon',
                    'theme-blue-ocean',
                    'theme-brown-sunset',
                    'theme-yellow-morning',
                    'theme-red-blood',
                    'theme-pink-candy'
                );
                document.documentElement.classList.add(`theme-${preferences.colorScheme}`);

                return preferences;
            } else {
                // If no preferences exist yet, create with defaults and local storage values
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;

                const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

                const initialPreferences: UserPreferences = {
                    ...defaultUserPreferences,
                    isDark: shouldUseDark,
                    colorScheme: savedColorScheme || defaultUserPreferences.colorScheme,
                    lastUpdated: Timestamp.now()
                };

                // Save initial preferences to Firestore
                await setDoc(preferencesRef, initialPreferences);
                setUserPreferences(initialPreferences);

                return initialPreferences;
            }
        } catch (error) {
            console.error("Error getting user preferences:", error);
            return null;
        }
    }, [user]);

    // Initialize theme and color scheme on component mount
    useEffect(() => {
        if (!user) {
            // If no user is logged in, use localStorage or system preferences
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;

            const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

            setIsDark(shouldUseDark);
            if (shouldUseDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Set color scheme
            if (savedColorScheme) {
                setColorScheme(savedColorScheme);
                document.documentElement.classList.add(`theme-${savedColorScheme}`);
            } else {
                // Default to modern-purple if no saved preference
                document.documentElement.classList.add('theme-modern-purple');
            }
        } else {
            // If user is logged in, get preferences from Firestore
            getUserPreferences();
        }
    }, [user, getUserPreferences]);

    const getCourseLessons = useCallback(async (courseId: string, options?: CacheOptions) => {
        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || generateCacheKey('lessons', courseId);

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return () => { /* No cleanup needed for pending request */ };
        }        // Check if data is already in state
        const lessons = state.lessons[courseId];
        if (lessons && Object.keys(lessons).length > 0) {
            // Check if we need to update loading state for lessons
            const courseLessonStates = state.lessonLoadingStates[courseId];
            if (!courseLessonStates || Object.values(courseLessonStates).some(status => status !== 'success')) {
                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });
            }
            return () => { /* No cleanup needed for cached data */ };
        }        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                Object.entries(cachedData.data as Record<string, unknown>).forEach(([lessonId, lesson]) => {
                    dispatch({
                        type: 'SET_LESSONS',
                        payload: { courseId, lessonId, lesson }
                    });
                });
                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                return () => { /* No cleanup needed for cached data */ };
            }
        }

        // Set loading state
        dispatch({
            type: 'SET_LESSON_LOADING_STATE',
            payload: { courseId, status: 'loading' }
        });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            const db = getFirestore(firebaseApp);
            const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
            const lessonsQuery = query(lessonsCollection); // Removed status filter to match server implementation
            console.log(`Setting up listener for lessons in course: ${courseId}`);
            const unsubscribe = onSnapshot(lessonsQuery, (querySnapshot) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lessonData: Record<string, any> = {};
                console.log(`Loaded ${querySnapshot.size} lessons for course ${courseId}`);

                if (querySnapshot.size === 0) {
                    console.warn(`No lessons found for course: ${courseId}. This might be expected for new courses.`);

                    // Even with no lessons, we should set the loading state to success
                    dispatch({
                        type: 'SET_LESSON_LOADING_STATE',
                        payload: { courseId, status: 'success' }
                    });

                    // Initialize an empty object for this course to track that we've loaded it
                    dispatch({
                        type: 'INITIALIZE_COURSE_LESSONS',
                        payload: { courseId }
                    });
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    lessonData[doc.id] = data;

                    dispatch({
                        type: 'SET_LESSONS',
                        payload: { courseId, lessonId: doc.id, lesson: data }
                    });
                });

                // Log all lesson IDs for debugging
                const lessonIds = Object.keys(lessonData);
                console.log(`Lesson IDs for course ${courseId}:`, lessonIds);

                // Set loading state to success
                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                // Cache data if persist is enabled
                if (cacheOptions.persist) {
                    const cacheEntry = {
                        data: lessonData,
                        metadata: generateCacheMetadata('success', cacheOptions.ttl)
                    };
                    saveToLocalStorage(cacheKey, cacheEntry);
                }                // Mark request as no longer pending
                setRequestPending(cacheKey, false);
            });

            // Return the unsubscribe function
            return unsubscribe;
        } catch (error) {
            console.error("Error setting up lessons listener:", error);
            // Set loading state to error
            dispatch({
                type: 'SET_LESSON_LOADING_STATE',
                payload: { courseId, status: 'error' }
            });

            // Mark request as no longer pending
            setRequestPending(cacheKey, false);

            // Return a no-op cleanup function
            return () => { /* No cleanup needed after error */ };
        }
    }, [state.lessons, state.lessonLoadingStates, dispatch, isRequestPending, setRequestPending]);

    const getCourseReviews = useCallback(async (courseId: string, options?: CacheOptions) => {
        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || generateCacheKey('reviews', courseId);

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return () => { /* No cleanup needed for pending request */ };
        }

        // Check if data is already in state
        const reviews = state.reviews[courseId];
        if (reviews && Object.keys(reviews).length > 0) {
            // Check if we need to update loading state
            const loadingState = state.reviewLoadingStates[courseId];
            if (loadingState !== 'success') {
                dispatch({
                    type: 'SET_REVIEW_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });
            }
            return () => { /* No cleanup needed for cached data */ };
        }

        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);

            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                const reviewData = cachedData.data as Record<string, any>;
                if (reviewData && typeof reviewData === 'object') {
                    Object.entries(reviewData).forEach(([reviewId, review]) => {
                        dispatch({
                            type: 'SET_REVIEWS',
                            payload: { courseId, reviewId, review }
                        });
                    });
                }

                dispatch({
                    type: 'SET_REVIEW_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                return () => { /* No cleanup needed for localStorage cache */ };
            }
        }

        // Set loading state
        dispatch({
            type: 'SET_REVIEW_LOADING_STATE',
            payload: { courseId, status: 'loading' }
        });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            const db = getFirestore(firebaseApp);
            const docRef = collection(db, `courses/${courseId}/reviews`);
            const q = query(docRef); const unsubscribe = onSnapshot(q, (querySnapshot) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reviewData: Record<string, any> = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    data.id = doc.id;
                    reviewData[doc.id] = data;

                    dispatch({
                        type: 'SET_REVIEWS',
                        payload: { courseId, reviewId: doc.id, review: data }
                    });
                });

                // Set loading state to success
                dispatch({
                    type: 'SET_REVIEW_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                // Cache data if persist is enabled
                if (cacheOptions.persist) {
                    const cacheEntry = {
                        data: reviewData,
                        metadata: generateCacheMetadata('success', cacheOptions.ttl)
                    };
                    saveToLocalStorage(cacheKey, cacheEntry);
                }

                // Mark request as no longer pending
                setRequestPending(cacheKey, false);
            }, (error) => {
                console.error("Error fetching reviews:", error);

                // Set loading state to error
                dispatch({
                    type: 'SET_REVIEW_LOADING_STATE',
                    payload: { courseId, status: 'error' }
                });

                // Mark request as no longer pending
                setRequestPending(cacheKey, false);
            });

            // Return the unsubscribe function
            return unsubscribe;
        } catch (error) {
            console.error("Error setting up reviews listener:", error);            // Set loading state to error
            dispatch({
                type: 'SET_REVIEW_LOADING_STATE',
                payload: { courseId, status: 'error' }
            });

            // Mark request as no longer pending
            setRequestPending(cacheKey, false);

            return () => { /* No cleanup needed for error case */ };
        }
    }, [state.reviews, state.reviewLoadingStates, dispatch, isRequestPending, setRequestPending]);

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
        if (!user) return () => { /* No cleanup needed when user is null */ };

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
            return Promise.resolve(() => { /* No cleanup needed in error case */ }); // Return a Promise that resolves to a no-op function in case of error
        }
    }, [user, dispatch]);    // Get all users (admin only)
    const getAllUsers = useCallback(async (options?: CacheOptions): Promise<Record<string, UserProfile> | null> => {
        if (!user || !state.isAdmin) {
            console.log("Not fetching users: User is null or not admin", { user: !!user, isAdmin: state.isAdmin });
            return null;
        }

        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || 'users';

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return state.users || null;
        }

        // Check if data is already in state
        if (state.users && Object.keys(state.users).length > 0) {
            // Check if we need to update loading state
            if (state.userLoadingState !== 'success') {
                dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });
            }
            return state.users;
        }        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                const userData = cachedData.data as Record<string, UserProfile>;
                dispatch({ type: 'SET_USERS', payload: userData });
                dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });
                return userData;
            }
        }

        // Set loading state
        dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'loading' });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            console.log("Attempting to fetch users as admin");
            const usersRef = collection(firestoreDB, "users");
            const q = query(usersRef, limit(100));
            const usersSnapshot = await getDocs(q);

            console.log(`Found ${usersSnapshot.size} users in database`);

            if (usersSnapshot.empty) {
                console.log("No user documents found in the collection");
                dispatch({ type: 'SET_USERS', payload: {} });
                dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });
                setRequestPending(cacheKey, false);
                return {};
            }

            const usersData: Record<string, UserProfile> = {}; usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                console.log(`Processing user: ${doc.id}`);

                usersData[doc.id] = {
                    id: doc.id,
                    email: userData.email || '',
                    displayName: userData.displayName || '',
                    photoURL: userData.photoURL || '',
                    bio: userData.bio,
                    role: userData.role || UserRole.USER,
                    isActive: userData.isActive !== false, // Default to true
                    permissions: userData.permissions || {
                        canManageCourses: false,
                        canManageUsers: false,
                        canManagePayments: false,
                        canViewAnalytics: false,
                        canManageSettings: false,
                    },
                    createdAt: userData.createdAt || new Date(),
                    updatedAt: userData.updatedAt || new Date(),
                    emailVerified: userData.emailVerified || false,
                    metadata: userData.metadata,
                    enrollments: userData.enrollments || {},
                };
            });

            console.log(`Processed ${Object.keys(usersData).length} user objects`);
            dispatch({ type: 'SET_USERS', payload: usersData });
            dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
                const cacheEntry = {
                    data: usersData,
                    metadata: generateCacheMetadata('success', cacheOptions.ttl)
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            }

            setRequestPending(cacheKey, false);
            return usersData;
        } catch (error) {
            console.error("Error fetching users:", error);
            dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'error' });
            setRequestPending(cacheKey, false);
            return null;
        }
    }, [user, state.isAdmin, state.users, state.userLoadingState, dispatch, isRequestPending, setRequestPending]);

    // Assign course to a user (admin only)
    const assignCourseToUser = useCallback(async (userId: string, courseId: string) => {
        if (!user || !state.isAdmin) return false;

        try {
            const db = getFirestore(firebaseApp);

            // First check if the course exists
            const courseRef = doc(db, `courses/${courseId}`);
            const courseDoc = await getDoc(courseRef);

            if (!courseDoc.exists()) {
                console.error("Course does not exist");
                return false;
            }

            // Get the course data
            const courseData = courseDoc.data();
            // Get the priceId from the course data
            const priceId = courseData.price;

            if (!priceId) {
                console.error("Price not found for course");
                return false;
            }

            // Find the product that contains this price
            const product = state.products.find((product: any) =>
                product.prices && product.prices.some((price: any) => price.id === priceId)
            );

            if (!product) {
                console.error("Product not found for course price");
                return false;
            }

            // Create a payment document in the user's payments collection
            const paymentId = `admin-assigned-${Date.now()}`;
            const paymentRef = doc(db, `customers/${userId}/payments/${paymentId}`);

            await setDoc(paymentRef, {
                id: paymentId,
                productId: product.id,
                status: 'succeeded',
                created: Date.now(),
                metadata: {
                    courseId: courseId,
                    assignedBy: user.uid,
                    assignmentMethod: 'admin'
                }
            });

            // Update user enrollments in the users collection
            const userRef = doc(db, `users/${userId}`);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const enrollments = userData.enrollments || {};

                await updateDoc(userRef, {
                    enrollments: {
                        ...enrollments,
                        [courseId]: {
                            enrolledAt: Timestamp.now(),
                            status: 'active',
                            source: 'admin'
                        }
                    }
                });
            }

            // Clear user cache after assignment
            clearCache('users');

            return true;
        } catch (error) {
            console.error("Error assigning course to user:", error);
            return false;
        }
    }, [user, state.isAdmin, state.products, clearCache]);

    // Get admin analytics data
    const getAdminAnalytics = useCallback(async (options?: CacheOptions) => {
        if (!user || !state.isAdmin) return null;

        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || 'adminAnalytics';

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return state.adminAnalytics;
        }

        // Check if data is already in state
        if (state.adminAnalytics) {
            // Check if we need to update loading state
            if (state.adminAnalyticsLoadingState !== 'success') {
                dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'success' });
            }
            return state.adminAnalytics;
        }

        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                dispatch({ type: 'SET_ADMIN_ANALYTICS', payload: cachedData.data });
                dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'success' });
                return cachedData.data;
            }
        }

        // Set loading state
        dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'loading' });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            // Calculate analytics data from various collections

            // Get total users
            const usersRef = collection(firestoreDB, "users");
            const usersSnapshot = await getDocs(usersRef);
            const totalUsers = usersSnapshot.size;

            // Get total courses
            const coursesRef = collection(firestoreDB, "courses");
            const coursesSnapshot = await getDocs(coursesRef);
            const totalCourses = coursesSnapshot.size;

            // Calculate total lessons
            let totalLessons = 0;
            for (const courseDoc of coursesSnapshot.docs) {
                const lessonsRef = collection(firestoreDB, `courses/${courseDoc.id}/lessons`);
                const lessonsSnapshot = await getDocs(lessonsRef);
                totalLessons += lessonsSnapshot.size;
            }

            // Get new users in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsersQuery = query(
                usersRef,
                where("createdAt", ">=", thirtyDaysAgo)
            );
            const newUsersSnapshot = await getDocs(newUsersQuery);
            const newUsers = newUsersSnapshot.size;

            // Get sales data
            const salesRef = collectionGroup(firestoreDB, "payments");
            const salesQuery = query(
                salesRef,
                where("status", "==", "succeeded")
            );
            const salesSnapshot = await getDocs(salesQuery);

            let totalRevenue = 0;
            let newSales = 0;
            const monthlyRevenue: Record<string, number> = {};

            salesSnapshot.forEach((doc) => {
                const sale = doc.data();
                if (sale.amount !== undefined) {
                    totalRevenue += sale.amount / 100; // Convert from cents to dollars

                    // Calculate monthly revenue
                    const date = new Date(sale.created);
                    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

                    monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + (sale.amount / 100);

                    // Check if sale is from last 30 days
                    if (date >= thirtyDaysAgo) {
                        newSales++;
                    }
                }
            });

            // Get popular courses
            const popularCourses: Array<{
                courseId: string;
                courseName: string;
                enrollments: number;
            }> = [];

            coursesSnapshot.forEach((doc) => {
                const courseData = doc.data();
                const course = {
                    courseId: doc.id,
                    courseName: courseData.name,
                    enrollments: 0
                };

                popularCourses.push(course);
            });

            // For each payment, find the course and increment its enrollments
            salesSnapshot.forEach((doc) => {
                const sale = doc.data();
                if (sale.metadata && sale.metadata.courseId) {
                    const courseId = sale.metadata.courseId;
                    const course = popularCourses.find((c) => c.courseId === courseId);
                    if (course) {
                        course.enrollments++;
                    }
                }
            });

            // Sort by enrollments
            popularCourses.sort((a, b) => b.enrollments - a.enrollments);

            const analyticsData = {
                totalUsers,
                totalCourses,
                totalLessons,
                totalRevenue,
                newUsers,
                newSales,
                monthlyRevenue,
                popularCourses: popularCourses.slice(0, 5) // Top 5 courses
            };

            dispatch({ type: 'SET_ADMIN_ANALYTICS', payload: analyticsData });
            dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'success' });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
                const cacheEntry = {
                    data: analyticsData,
                    metadata: generateCacheMetadata('success', cacheOptions.ttl)
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            }

            setRequestPending(cacheKey, false);
            return analyticsData;
        } catch (error) {
            console.error("Error fetching admin analytics:", error);
            dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'error' });
            setRequestPending(cacheKey, false);
            return null;
        }
    }, [user, state.isAdmin, state.adminAnalytics, state.adminAnalyticsLoadingState, dispatch, isRequestPending, setRequestPending]);

    // Get admin settings
    const getAdminSettings = useCallback(async (options?: CacheOptions) => {
        if (!user || !state.isAdmin) return null;

        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || 'adminSettings';

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return state.adminSettings;
        }

        // Check if data is already in state
        if (state.adminSettings) {
            // Check if we need to update loading state
            if (state.adminSettingsLoadingState !== 'success') {
                dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });
            }
            return state.adminSettings;
        }

        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                dispatch({ type: 'SET_ADMIN_SETTINGS', payload: cachedData.data });
                dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });
                return cachedData.data;
            }
        }

        // Set loading state
        dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'loading' });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            // First check if the admin collection exists and create it if not
            const adminCollectionRef = collection(firestoreDB, "admin");
            const adminDocs = await getDocs(adminCollectionRef);
            if (adminDocs.empty) {
                // Admin collection doesn't exist, create it with a blank document
                await setDoc(doc(firestoreDB, "admin", "info"), {
                    createdAt: Timestamp.now()
                });
            }

            const settingsRef = doc(firestoreDB, "admin/settings");
            const settingsDoc = await getDoc(settingsRef);

            if (settingsDoc.exists()) {
                const settingsData = settingsDoc.data() as AdminSettings;
                dispatch({ type: 'SET_ADMIN_SETTINGS', payload: settingsData });
                dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });

                // Cache data if persist is enabled
                if (cacheOptions.persist) {
                    const cacheEntry = {
                        data: settingsData,
                        metadata: generateCacheMetadata('success', cacheOptions.ttl)
                    };
                    saveToLocalStorage(cacheKey, cacheEntry);
                }

                setRequestPending(cacheKey, false);
                return settingsData;
            } else {
                // Create default settings if they don't exist
                const defaultSettings: AdminSettings = {
                    siteName: "Cursuri",
                    siteDescription: "Online Learning Platform",
                    contactEmail: "contact@example.com",
                    allowRegistration: true,
                    allowSocialLogin: true,
                    paymentProcessorEnabled: true,
                    taxRate: 0,
                    currencyCode: "RON"
                };

                await setDoc(settingsRef, defaultSettings);
                dispatch({ type: 'SET_ADMIN_SETTINGS', payload: defaultSettings });
                dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });

                // Cache data if persist is enabled
                if (cacheOptions.persist) {
                    const cacheEntry = {
                        data: defaultSettings,
                        metadata: generateCacheMetadata('success', cacheOptions.ttl)
                    };
                    saveToLocalStorage(cacheKey, cacheEntry);
                }

                setRequestPending(cacheKey, false);
                return defaultSettings;
            }
        } catch (error) {
            console.error("Error fetching admin settings:", error);
            dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'error' });
            setRequestPending(cacheKey, false);
            return null;
        }
    }, [user, state.isAdmin, state.adminSettings, state.adminSettingsLoadingState, dispatch, isRequestPending, setRequestPending]);

    // Update admin settings
    const updateAdminSettings = useCallback(async (settings: Partial<AdminSettings>) => {
        if (!user || !state.isAdmin) return false;

        try {
            const settingsRef = doc(firestoreDB, "admin/settings");

            await updateDoc(settingsRef, settings);

            // Update local state
            if (state.adminSettings) {
                const updatedSettings = {
                    ...state.adminSettings,
                    ...settings
                };
                dispatch({ type: 'SET_ADMIN_SETTINGS', payload: updatedSettings });

                // Update cache if it exists
                const cacheKey = 'adminSettings';
                const cachedData = loadFromLocalStorage(cacheKey);
                if (cachedData) {
                    const cacheEntry = {
                        data: updatedSettings,
                        metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now())
                    };
                    saveToLocalStorage(cacheKey, cacheEntry);
                }
            }

            return true;
        } catch (error) {
            console.error("Error updating admin settings:", error);
            return false;
        }
    }, [user, state.isAdmin, state.adminSettings, dispatch]);

    // --- BOOKMARKING LOGIC ---
    // Get all bookmarked lessons for the user from Firestore
    const getBookmarkedLessons = useCallback(async (options?: CacheOptions) => {
        if (!user) return;

        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || 'bookmarks';

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return;
        }

        // Check if data is already in state
        if (state.bookmarkedLessons && Object.keys(state.bookmarkedLessons).length > 0) {
            // Check if we need to update loading state
            if (state.bookmarksLoadingState !== 'success') {
                dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'success' });
            }
            return;
        }

        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                dispatch({ type: 'SET_BOOKMARKED_LESSONS', payload: cachedData.data });
                dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'success' });
                return;
            }
        }

        // Set loading state
        dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'loading' });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            const bookmarksRef = collection(firestoreDB, `users/${user.uid}/bookmarks`);
            const snapshot = await getDocs(bookmarksRef);
            const bookmarks: BookmarkedLessons = {};

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.courseId && data.lessonId) {
                    if (!bookmarks[data.courseId]) bookmarks[data.courseId] = [];
                    bookmarks[data.courseId].push(data.lessonId);
                }
            });

            dispatch({ type: 'SET_BOOKMARKED_LESSONS', payload: bookmarks });
            dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'success' });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
                const cacheEntry = {
                    data: bookmarks,
                    metadata: generateCacheMetadata('success', cacheOptions.ttl)
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            } setRequestPending(cacheKey, false);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'error' });
            setRequestPending(cacheKey, false);
        }
    }, [user, dispatch, isRequestPending, setRequestPending]);

    // Toggle bookmark for a lesson (add/remove in Firestore and update state)
    const toggleBookmarkLesson = useCallback(async (courseId: string, lessonId: string) => {
        if (!user) return;
        const isBookmarked = state.bookmarkedLessons?.[courseId]?.includes(lessonId);
        const bookmarkDocRef = doc(firestoreDB, `users/${user.uid}/bookmarks/${courseId}_${lessonId}`);
        try {
            if (isBookmarked) {
                await deleteDoc(bookmarkDocRef);
            } else {
                await setDoc(bookmarkDocRef, { courseId, lessonId, createdAt: Date.now() });
            }
            dispatch({ type: 'TOGGLE_BOOKMARK_LESSON', payload: { courseId, lessonId } });

            // Update cache if it exists
            const cacheKey = 'bookmarks';
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData) {
                const updatedBookmarks = { ...state.bookmarkedLessons };
                const cacheEntry = {
                    data: updatedBookmarks,
                    metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now())
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    }, [user, state.bookmarkedLessons, dispatch]);

    // --- WISHLIST LOGIC ---    // Get all wishlist courses for the user from Firestore
    const getWishlistCourses = useCallback(async (options?: CacheOptions) => {
        if (!user) return;

        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || 'wishlist';

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return;
        }

        // Only check state if we don't force refresh
        if (!cacheOptions.forceRefresh) {
            // Check if data is already in state
            if (state.wishlistCourses && state.wishlistCourses.length > 0 && state.wishlistLoadingState === 'success') {
                return;
            }
        }

        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                // Use cached data
                dispatch({ type: 'SET_WISHLIST_COURSES', payload: cachedData.data });
                dispatch({ type: 'SET_WISHLIST_LOADING_STATE', payload: 'success' });
                return;
            }
        }

        // Set loading state
        dispatch({ type: 'SET_WISHLIST_LOADING_STATE', payload: 'loading' });

        // Mark request as pending
        setRequestPending(cacheKey, true);

        try {
            const wishlistRef = collection(firestoreDB, `users/${user.uid}/wishlist`);
            const snapshot = await getDocs(wishlistRef);
            const wishlist: string[] = [];

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.courseId) {
                    wishlist.push(data.courseId);
                }
            });

            dispatch({ type: 'SET_WISHLIST_COURSES', payload: wishlist });
            dispatch({ type: 'SET_WISHLIST_LOADING_STATE', payload: 'success' });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
                const cacheEntry = {
                    data: wishlist,
                    metadata: generateCacheMetadata('success', cacheOptions.ttl)
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            } setRequestPending(cacheKey, false);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            dispatch({ type: 'SET_WISHLIST_LOADING_STATE', payload: 'error' });
            setRequestPending(cacheKey, false);
        }
    }, [user, dispatch, isRequestPending, setRequestPending]);

    // Add a course to wishlist
    const addToWishlist = useCallback(async (courseId: string) => {
        if (!user) return;
        try {
            const wishlistDocRef = doc(firestoreDB, `users/${user.uid}/wishlist/${courseId}`);
            await setDoc(wishlistDocRef, { courseId, createdAt: Date.now() });
            dispatch({ type: 'ADD_TO_WISHLIST', payload: courseId });

            // Update cache if it exists
            const cacheKey = 'wishlist';
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData) {
                const updatedWishlist = [...state.wishlistCourses];
                if (!updatedWishlist.includes(courseId)) {
                    updatedWishlist.push(courseId);
                }
                const cacheEntry = {
                    data: updatedWishlist,
                    metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now())
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    }, [user, state.wishlistCourses, dispatch]);

    // Remove a course from wishlist
    const removeFromWishlist = useCallback(async (courseId: string) => {
        if (!user) return;
        try {
            const wishlistDocRef = doc(firestoreDB, `users/${user.uid}/wishlist/${courseId}`);
            await deleteDoc(wishlistDocRef);
            dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: courseId });

            // Update cache if it exists
            const cacheKey = 'wishlist';
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData) {
                const updatedWishlist = state.wishlistCourses.filter((id: string) => id !== courseId);
                const cacheEntry = {
                    data: updatedWishlist,
                    metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now())
                };
                saveToLocalStorage(cacheKey, cacheEntry);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    }, [user, state.wishlistCourses, dispatch]);

    // Onboarding modal logic
    const [showOnboarding, setShowOnboarding] = useState(false);
    useEffect(() => {
        if (user && !authLoading) {
            // Check localStorage for onboarding completion
            const onboardingKey = `onboarding-complete-${user.uid}`;
            const completed = localStorage.getItem(onboardingKey);
            if (!completed) {
                setShowOnboarding(true);
            }
        }
    }, [user, authLoading]); useEffect(() => {
        // Store the auth unsubscribe function in a variable so we can clean up
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUser(user);

                // Use new RBAC system
                try {
                    // Import admin utilities
                    const {
                        getUserProfile,
                        createOrUpdateUserProfile,
                        migrateHardcodedAdmin,
                        isAdmin,
                        UserRole
                    } = await import('../utils/firebase/adminAuth');

                    // Check if this is the hardcoded admin that needs migration
                    let userProfile = await migrateHardcodedAdmin(user);

                    // If not migrated admin, get or create regular profile
                    if (!userProfile) {
                        userProfile = await getUserProfile(user.uid);

                        // Create profile if it doesn't exist
                        if (!userProfile) {
                            userProfile = await createOrUpdateUserProfile(user, UserRole.USER);
                        }
                    }

                    // Update admin status based on role
                    const adminStatus = isAdmin(userProfile);
                    dispatch({ type: 'SET_IS_ADMIN', payload: adminStatus });

                    // Store user profile in context for permission checks                    dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });

                } catch (error) {
                    console.error('Error setting up user profile:', error);
                    // No fallback to hardcoded admin - use role-based system only
                    dispatch({ type: 'SET_IS_ADMIN', payload: false });
                }
            } else {
                setUser(null);
                dispatch({ type: 'SET_IS_ADMIN', payload: false });
                dispatch({ type: 'SET_USER_PROFILE', payload: null });
            }
            // Auth check complete, regardless of result
            setAuthLoading(false);
        });

        // Return the unsubscribe function for cleanup
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [dispatch]);

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
        return () => { /* No cleanup needed when there's no user */ };
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
    }, []); useEffect(() => {
        let mounted = true;
        const unsubscribes: Unsubscribe[] = [];

        const fetchCourses = async () => {
            // Check if courses are already fetched to avoid duplicate requests
            if (Object.keys(state.courses).length > 0) {
                return () => {
                    unsubscribes.forEach(unsubscribe => unsubscribe());
                };
            }

            // Set loading state for courses
            dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId: 'all', status: 'loading' } });

            try {
                const q = query(collection(firestoreDB, "courses"), where("status", "==", "active"));
                const querySnapshot = await getDocs(q);

                // First set all courses in the state
                if (mounted) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        data.id = doc.id;
                        dispatch({ type: 'SET_COURSES', payload: { courseId: doc.id, course: data } });
                        dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId: doc.id, status: 'success' } });
                    });

                    // Then fetch lessons for each course, but only if still mounted
                    if (mounted) {
                        querySnapshot.forEach((doc) => {
                            const courseId = doc.id;
                            getCourseLessons(courseId, { persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
                        });

                        // Set loading state to success
                        dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId: 'all', status: 'success' } });
                    }
                }

                // Return cleanup function to unsubscribe from all listeners
                return () => {
                    unsubscribes.forEach(unsubscribe => unsubscribe());
                };
            } catch (error) {
                console.error("Error fetching courses:", error);
                if (mounted) {
                    dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId: 'all', status: 'error' } });
                }
                return () => { /* No cleanup needed in error case */ };
            }
        }

        const unsubscribePromise = fetchCourses();

        // Clean up function
        return () => {
            mounted = false;
            unsubscribePromise.then(cleanup => {
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            });
        };
    }, [getCourseLessons, state.courses, dispatch]);

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
            return () => { /* No cleanup needed when user is null */ };
        }
    }, [user]);    // Fetch bookmarks and wishlist on login
    useEffect(() => {
        if (user) {
            getBookmarkedLessons({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
            getWishlistCourses({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
        }
    }, [user]);    // Fetch a single course by ID
    const fetchCourseById = useCallback(async (courseId: string, options: CacheOptions = DEFAULT_CACHE_OPTIONS) => {
        const cacheKey = options.cacheKey || generateCacheKey('course', courseId);

        // Optimization: If the course is already in state, don't fetch it again
        if (state.courses && state.courses[courseId]) {
            return;
        }

        // Check if we're already fetching this course
        if (isRequestPending(cacheKey)) {
            return;
        }

        // Check cache first if not already pending
        if (options.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                dispatch({ type: 'SET_COURSES', payload: { courseId, course: cachedData.data } });
                dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'success' } });
                return;
            }
        }

        // Mark request as pending
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey, isPending: true } });

        // Set loading state
        dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'loading' } });

        try {
            const courseRef = doc(firestoreDB, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseData = courseSnap.data();
                courseData.id = courseSnap.id;

                // Update state
                dispatch({ type: 'SET_COURSES', payload: { courseId, course: courseData } });
                dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'success' } });                // Cache the result if needed
                if (options.persist) {
                    saveToLocalStorage(cacheKey, courseData, generateCacheMetadata(
                        'success', typeof options.ttl === 'number' ? options.ttl : undefined));
                }
            } else {
                console.log("No such course exists!");
                dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'error' } });
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'error' } });
        } finally {
            // Clear pending request
            dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey, isPending: false } });
        }
    }, [dispatch, isRequestPending, state.courses]);

    // Fetch lessons for a specific course
    const fetchLessonsForCourse = useCallback(async (courseId: string, options: CacheOptions = DEFAULT_CACHE_OPTIONS) => {
        const cacheKey = options.cacheKey || generateCacheKey('lessons', courseId);

        // Check if we're already fetching these lessons
        if (isRequestPending(cacheKey)) {
            return;
        }

        // Check cache first if not already pending
        if (options.persist) {
            const cachedData = loadFromLocalStorage(cacheKey);
            if (cachedData && !isCacheExpired(cachedData.metadata)) {
                dispatch({ type: 'SET_LESSONS', payload: { courseId, lessons: cachedData.data } });
                dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'success' } });
                return;
            }
        }

        // Mark request as pending
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey } });

        // Set loading state
        dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'loading' } });

        try {
            const q = query(collection(firestoreDB, "courses", courseId, "lessons"));
            const querySnapshot = await getDocs(q);

            const lessonsData: Record<string, any> = {};
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                lessonsData[doc.id] = data;
            });            // Initialize the course lessons structure first
            dispatch({ type: 'INITIALIZE_COURSE_LESSONS', payload: { courseId } });

            // Update state with all lessons at once using the new bulk update support
            dispatch({ type: 'SET_LESSONS', payload: { courseId, lessons: lessonsData } });
            dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'success' } });

            // Cache the result if needed
            if (options.persist) {
                saveToLocalStorage(cacheKey, lessonsData, generateCacheMetadata(
                    'success', typeof options.ttl === 'number' ? options.ttl : undefined));
            }
        } catch (error) {
            console.error("Error fetching lessons:", error);
            dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'error' } });
        } finally {
            // Clear pending request
            dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey, isPending: false } });
        }
    }, [dispatch, isRequestPending]);

    // Get an individual course by ID - server compatible helper
    const getCourseById = useCallback(async (courseId: string): Promise<any> => {
        if (!courseId) {
            console.error('getCourseById: courseId is required');
            return null;
        }

        try {
            // Try from state cache first
            const courseFromCache = state.courses[courseId];
            if (courseFromCache) {
                return courseFromCache;
            }

            // If not in state, fetch directly
            const courseRef = doc(firestoreDB, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseData = {
                    id: courseSnap.id,
                    ...courseSnap.data()
                };

                // Update state
                dispatch({
                    type: 'SET_COURSES',
                    payload: { courseId, course: courseData }
                });

                return courseData;
            } else {
                console.log(`No course found with ID: ${courseId}`);
                return null;
            }
        } catch (error) {
            console.error(`Error getting course ${courseId}:`, error);
            return null;
        }
    }, [dispatch, state.courses]);

    // Get an individual lesson by ID - server compatible helper
    const getLessonById = useCallback(async (courseId: string, lessonId: string): Promise<any> => {
        if (!courseId || !lessonId) {
            console.error(`getLessonById: Invalid parameters: courseId=${courseId}, lessonId=${lessonId}`);
            return null;
        }

        try {
            // Try from state cache first
            const lessonFromCache = state.lessons[courseId]?.[lessonId];
            if (lessonFromCache) {
                return lessonFromCache;
            }

            // If not in state, fetch directly
            const lessonRef = doc(firestoreDB, 'courses', courseId, 'lessons', lessonId);
            const lessonSnap = await getDoc(lessonRef);

            if (lessonSnap.exists()) {
                const lessonData = {
                    id: lessonSnap.id,
                    ...lessonSnap.data()
                };

                // Update state
                dispatch({
                    type: 'SET_LESSONS',
                    payload: { courseId, lessonId, lesson: lessonData }
                });

                return lessonData;
            } else {
                console.log(`No lesson found with ID: ${lessonId} in course: ${courseId}`);

                // For debugging purposes - list available lessons
                try {
                    const lessonsCollection = collection(firestoreDB, 'courses', courseId, 'lessons');
                    const lessonsSnapshot = await getDocs(lessonsCollection);

                    if (!lessonsSnapshot.empty) {
                        console.log(`Available lessons in course ${courseId}:`);
                        lessonsSnapshot.forEach(doc => console.log(`- ${doc.id}: ${doc.data().name || 'Unnamed'}`));
                    } else {
                        console.log(`No lessons found in course ${courseId}`);
                    }
                } catch (listError) {
                    console.error('Error listing available lessons:', listError);
                }

                return null;
            }
        } catch (error) {
            console.error(`Error getting lesson ${lessonId} in course ${courseId}:`, error);
            return null;
        }
    }, [dispatch, state.lessons]);

    // Debug: Log context value being provided
    console.log('AppContext: Providing context with user:', !!user, 'authLoading:', authLoading, 'isAdmin:', state.isAdmin);

    return (
        <AppContext.Provider value={{
            isDark,
            toggleTheme,
            colorScheme,
            setColorScheme: handleColorSchemeChange,
            userPreferences,
            saveUserPreferences,
            user,
            userProfile: state.userProfile,
            authLoading,
            isAdmin: state.isAdmin,
            openModal,
            closeModal,
            updateModal,
            products: state.products,
            courses: state.courses,
            courseLoadingStates: state.courseLoadingStates,
            lessons: state.lessons,
            lessonLoadingStates: state.lessonLoadingStates,
            getCourseLessons,
            userPaidProducts: state.userPaidProducts,
            reviews: state.reviews,
            reviewLoadingStates: state.reviewLoadingStates,
            getCourseReviews,
            lessonProgress: state.lessonProgress,
            saveLessonProgress,
            markLessonComplete,
            users: state.users,
            userLoadingState: state.userLoadingState,
            getAllUsers,
            assignCourseToUser,
            adminAnalytics: state.adminAnalytics,
            adminAnalyticsLoadingState: state.adminAnalyticsLoadingState,
            getAdminAnalytics,
            adminSettings: state.adminSettings,
            adminSettingsLoadingState: state.adminSettingsLoadingState,
            getAdminSettings,
            updateAdminSettings,
            bookmarkedLessons: state.bookmarkedLessons,
            bookmarksLoadingState: state.bookmarksLoadingState,
            toggleBookmarkLesson,
            getBookmarkedLessons,
            wishlistCourses: state.wishlistCourses,
            wishlistLoadingState: state.wishlistLoadingState,
            addToWishlist,
            removeFromWishlist,
            getWishlistCourses,
            clearCache,
            clearAllCache,
            getCacheStatus,
            fetchCourseById,
            fetchLessonsForCourse,
            getCourseById,
            getLessonById,
        }}>
            {children}
            {state.modals.map((modal: any) => (
                <ModalComponent key={modal.id} {...modal} />
            ))}
            {showOnboarding && (
                <ModalComponent
                    id="onboarding"
                    isOpen={true}
                    modalHeader="Welcome!"
                    modalBody={<OnboardingModal onClose={() => {
                        setShowOnboarding(false);
                        if (user) {
                            localStorage.setItem(`onboarding-complete-${user.uid}`, 'true');
                        }
                    }} />}
                    hideCloseButton={true}
                    hideCloseIcon={false}
                    backdrop="blur"
                    size="md"
                    scrollBehavior="inside"
                    isDismissable={false}
                    footerDisabled={true}
                />
            )}    </AppContext.Provider>
    );
}

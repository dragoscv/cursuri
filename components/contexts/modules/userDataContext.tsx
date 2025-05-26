'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '../../../utils/firebase/firebase.config';
import { useAuth } from './authContext';
import { useCache } from './cacheContext';
import { BookmarkedLessons, WishlistCourses, CacheStatus, CacheOptions } from '@/types';

// User data state interface
interface UserDataState {
    bookmarkedLessons: BookmarkedLessons;
    bookmarksLoadingState: CacheStatus;
    wishlistCourses: WishlistCourses;
    wishlistLoadingState: CacheStatus;
}

// User data actions
type UserDataAction =
    | { type: 'SET_BOOKMARKS_LOADING'; payload: CacheStatus }
    | { type: 'SET_BOOKMARKS'; payload: BookmarkedLessons }
    | { type: 'TOGGLE_BOOKMARK'; courseId: string; lessonId: string }
    | { type: 'SET_WISHLIST_LOADING'; payload: CacheStatus }
    | { type: 'SET_WISHLIST'; payload: WishlistCourses }
    | { type: 'ADD_TO_WISHLIST'; courseId: string }
    | { type: 'REMOVE_FROM_WISHLIST'; courseId: string };

// User data reducer
const userDataReducer = (state: UserDataState, action: UserDataAction): UserDataState => {
    switch (action.type) {
        case 'SET_BOOKMARKS_LOADING':
            return { ...state, bookmarksLoadingState: action.payload };

        case 'SET_BOOKMARKS':
            return {
                ...state,
                bookmarkedLessons: action.payload,
                bookmarksLoadingState: 'success'
            };

        case 'TOGGLE_BOOKMARK': {
            const { courseId, lessonId } = action;
            const current = state.bookmarkedLessons[courseId] || [];
            const isBookmarked = current.includes(lessonId);

            return {
                ...state,
                bookmarkedLessons: {
                    ...state.bookmarkedLessons,
                    [courseId]: isBookmarked
                        ? current.filter(id => id !== lessonId)
                        : [...current, lessonId]
                }
            };
        }

        case 'SET_WISHLIST_LOADING':
            return { ...state, wishlistLoadingState: action.payload };

        case 'SET_WISHLIST':
            return {
                ...state,
                wishlistCourses: action.payload,
                wishlistLoadingState: 'success'
            };

        case 'ADD_TO_WISHLIST':
            return {
                ...state,
                wishlistCourses: state.wishlistCourses.includes(action.courseId)
                    ? state.wishlistCourses
                    : [...state.wishlistCourses, action.courseId]
            };

        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                wishlistCourses: state.wishlistCourses.filter(id => id !== action.courseId)
            };

        default:
            return state;
    }
};

// Initial user data state
const initialState: UserDataState = {
    bookmarkedLessons: {},
    bookmarksLoadingState: 'idle',
    wishlistCourses: [],
    wishlistLoadingState: 'idle'
};

// User data context interface
interface UserDataContextType extends UserDataState {
    toggleBookmarkLesson: (courseId: string, lessonId: string) => Promise<void>;
    getBookmarkedLessons: (options?: CacheOptions) => Promise<void>;
    addToWishlist: (courseId: string) => Promise<void>;
    removeFromWishlist: (courseId: string) => Promise<void>;
    getWishlistCourses: (options?: CacheOptions) => Promise<void>;
}

// Create context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Provider props
interface UserDataProviderProps {
    children: ReactNode;
}

// Provider component
export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(userDataReducer, initialState);
    const { user } = useAuth();
    const { getCachedData, setCachedData, clearCache } = useCache();

    // Cache keys
    const BOOKMARKS_CACHE_KEY = `bookmarks_${user?.uid || 'anonymous'}`;
    const WISHLIST_CACHE_KEY = `wishlist_${user?.uid || 'anonymous'}`;

    // Get bookmarked lessons
    const getBookmarkedLessons = useCallback(async (options?: CacheOptions) => {
        if (!user) {
            dispatch({ type: 'SET_BOOKMARKS', payload: {} });
            return;
        }

        try {
            dispatch({ type: 'SET_BOOKMARKS_LOADING', payload: 'loading' });            // Check cache first
            if (!options?.persist) {
                const cached = getCachedData<BookmarkedLessons>(BOOKMARKS_CACHE_KEY);
                if (cached && Object.keys(cached).length > 0) {
                    dispatch({ type: 'SET_BOOKMARKS', payload: cached });
                    return;
                }
            }

            // Fetch from Firestore
            const userDocRef = doc(firestoreDB, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const bookmarks: BookmarkedLessons = userData.bookmarkedLessons || {};
                // Cache the result
                if (options?.persist) {
                    setCachedData(BOOKMARKS_CACHE_KEY, bookmarks);
                }

                dispatch({ type: 'SET_BOOKMARKS', payload: bookmarks });
            } else {
                dispatch({ type: 'SET_BOOKMARKS', payload: {} });
            }
        } catch (error) {
            console.error('Error fetching bookmarked lessons:', error); dispatch({ type: 'SET_BOOKMARKS_LOADING', payload: 'error' });
            dispatch({ type: 'SET_BOOKMARKS', payload: {} });
        }
    }, [user, getCachedData, setCachedData]);

    // Toggle bookmark for a lesson
    const toggleBookmarkLesson = useCallback(async (courseId: string, lessonId: string) => {
        if (!user) {
            console.warn('User must be logged in to bookmark lessons');
            return;
        }

        try {
            // Update local state first for immediate UI feedback
            dispatch({ type: 'TOGGLE_BOOKMARK', courseId, lessonId });

            // Update Firestore
            const userDocRef = doc(firestoreDB, 'users', user.uid);
            const current = state.bookmarkedLessons[courseId] || [];
            const isBookmarked = current.includes(lessonId);

            if (isBookmarked) {
                // Remove bookmark
                await setDoc(userDocRef, {
                    bookmarkedLessons: {
                        [courseId]: arrayRemove(lessonId)
                    },
                    lastUpdated: Timestamp.now()
                }, { merge: true });
            } else {
                // Add bookmark
                await setDoc(userDocRef, {
                    bookmarkedLessons: {
                        [courseId]: arrayUnion(lessonId)
                    },
                    lastUpdated: Timestamp.now()
                }, { merge: true });
            }

            // Clear cache to ensure fresh data on next fetch
            clearCache(BOOKMARKS_CACHE_KEY);
        } catch (error) {
            console.error('Error toggling lesson bookmark:', error);
            // Revert local state on error
            dispatch({ type: 'TOGGLE_BOOKMARK', courseId, lessonId });
        }
    }, [user, state.bookmarkedLessons, clearCache]);

    // Get wishlist courses
    const getWishlistCourses = useCallback(async (options?: CacheOptions) => {
        if (!user) {
            dispatch({ type: 'SET_WISHLIST', payload: [] });
            return;
        }

        try {
            dispatch({ type: 'SET_WISHLIST_LOADING', payload: 'loading' });            // Check cache first
            if (!options?.persist) {
                const cached = getCachedData<WishlistCourses>(WISHLIST_CACHE_KEY);
                if (cached && cached.length > 0) {
                    dispatch({ type: 'SET_WISHLIST', payload: cached });
                    return;
                }
            }

            // Fetch from Firestore
            const userDocRef = doc(firestoreDB, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const wishlist: WishlistCourses = userData.wishlistCourses || [];
                // Cache the result
                if (options?.persist) {
                    setCachedData(WISHLIST_CACHE_KEY, wishlist);
                }

                dispatch({ type: 'SET_WISHLIST', payload: wishlist });
            } else {
                dispatch({ type: 'SET_WISHLIST', payload: [] });
            }
        } catch (error) {
            console.error('Error fetching wishlist courses:', error); dispatch({ type: 'SET_WISHLIST_LOADING', payload: 'error' });
            dispatch({ type: 'SET_WISHLIST', payload: [] });
        }
    }, [user, getCachedData, setCachedData]);

    // Add course to wishlist
    const addToWishlist = useCallback(async (courseId: string) => {
        if (!user) {
            console.warn('User must be logged in to add courses to wishlist');
            return;
        }

        try {
            // Update local state first for immediate UI feedback
            dispatch({ type: 'ADD_TO_WISHLIST', courseId });

            // Update Firestore
            const userDocRef = doc(firestoreDB, 'users', user.uid);
            await setDoc(userDocRef, {
                wishlistCourses: arrayUnion(courseId),
                lastUpdated: Timestamp.now()
            }, { merge: true });

            // Clear cache to ensure fresh data on next fetch
            clearCache(WISHLIST_CACHE_KEY);
        } catch (error) {
            console.error('Error adding course to wishlist:', error);
            // Revert local state on error
            dispatch({ type: 'REMOVE_FROM_WISHLIST', courseId });
        }
    }, [user, clearCache]);

    // Remove course from wishlist
    const removeFromWishlist = useCallback(async (courseId: string) => {
        if (!user) {
            console.warn('User must be logged in to remove courses from wishlist');
            return;
        }

        try {
            // Update local state first for immediate UI feedback
            dispatch({ type: 'REMOVE_FROM_WISHLIST', courseId });

            // Update Firestore
            const userDocRef = doc(firestoreDB, 'users', user.uid);
            await setDoc(userDocRef, {
                wishlistCourses: arrayRemove(courseId),
                lastUpdated: Timestamp.now()
            }, { merge: true });

            // Clear cache to ensure fresh data on next fetch
            clearCache(WISHLIST_CACHE_KEY);
        } catch (error) {
            console.error('Error removing course from wishlist:', error);
            // Revert local state on error
            dispatch({ type: 'ADD_TO_WISHLIST', courseId });
        }
    }, [user, clearCache]);

    // Load user data when user changes
    useEffect(() => {
        if (user) {
            // Load user data with caching
            getBookmarkedLessons({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
            getWishlistCourses({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
        } else {
            // Clear data when user logs out
            dispatch({ type: 'SET_BOOKMARKS', payload: {} });
            dispatch({ type: 'SET_WISHLIST', payload: [] });
            clearCache(BOOKMARKS_CACHE_KEY);
            clearCache(WISHLIST_CACHE_KEY);
        }
    }, [user, getBookmarkedLessons, getWishlistCourses, clearCache]);

    const contextValue: UserDataContextType = {
        ...state,
        toggleBookmarkLesson,
        getBookmarkedLessons,
        addToWishlist,
        removeFromWishlist,
        getWishlistCourses
    };

    return (
        <UserDataContext.Provider value={contextValue}>
            {children}
        </UserDataContext.Provider>
    );
};

// Custom hook to use user data context
export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
};

export default UserDataContext;

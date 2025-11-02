'use client';

import React, { createContext, useState, useEffect, useReducer, useCallback } from 'react';

import { getProducts, getCurrentUserSubscriptions, getProduct, getPrice } from 'firewand';
import { firebaseApp, firestoreDB, firebaseAuth } from '@/utils/firebase/firebase.config';
import { stripePayments } from '@/utils/firebase/stripe';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  Timestamp,
  Unsubscribe,
  getFirestore,
  limit,
  collectionGroup,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { setAnalyticsUserId, setAnalyticsUserProperties } from '@/utils/analytics';
import { trackDailyActiveUser } from '@/utils/statistics';
import ModalComponent from '@/components/Modal';
import { useModal } from './contexts/useModal';
import OnboardingModal from './OnboardingModal';

import {
  AppContextProps,
  UserLessonProgress,
  ColorScheme,
  UserPreferences,
  UserProfile,
  AdminSettings,
  AdminAnalytics,
  BookmarkedLessons,
  CacheOptions,
  CacheStatus,
  Lesson,
  Review,
  UserPaidProduct,
  Course,
} from '@/types';
import { UserRole } from '@/utils/firebase/adminAuth';
import { appReducer, initialState } from './contexts/appReducer';
import {
  generateCacheMetadata,
  isCacheExpired,
  saveToLocalStorage,
  loadFromLocalStorage,
  generateCacheKey,
  clearLocalStorageCache,
  clearAllLocalStorageCache,
} from '@/utils/caching';

export const AppContext = createContext<AppContextProps | undefined>(undefined);
AppContext.displayName = 'AppContext';

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  isDark: false,
  colorScheme: 'modern-purple',
  emailNotifications: true,
  courseUpdates: true,
  marketingEmails: false,
  language: 'en',
  lastUpdated: new Date(),
};

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  persist: false,
  cacheKey: undefined,
};

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('modern-purple');
  const [user, setUser] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Modal logic moved to useModal hook
  const { openModal, closeModal, updateModal } = useModal(dispatch);

  // Utility to check if a request is pending
  const isRequestPending = useCallback(
    (key: string) => {
      return !!state.pendingRequests[key];
    },
    [state.pendingRequests]
  );

  // Utility to set request pending status
  const setRequestPending = useCallback(
    (key: string, isPending: boolean) => {
      dispatch({ type: 'SET_PENDING_REQUEST', payload: { key, isPending } });
    },
    [dispatch]
  );

  // Cache management utilities
  const clearCache = useCallback(
    (cacheKey?: string) => {
      dispatch({ type: 'CLEAR_CACHE', payload: cacheKey });
      if (cacheKey) {
        clearLocalStorageCache(cacheKey);
      }
    },
    [dispatch]
  );

  const clearAllCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });
    clearAllLocalStorageCache();
  }, [dispatch]);

  const getCacheStatus = useCallback(
    (cacheKey: string): CacheStatus => {
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
    },
    [
      state.courseLoadingStates,
      state.lessonLoadingStates,
      state.reviewLoadingStates,
      state.userLoadingState,
      state.adminAnalyticsLoadingState,
      state.adminSettingsLoadingState,
      state.bookmarksLoadingState,
      state.wishlistLoadingState,
    ]
  );

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
  const handleColorSchemeChange = useCallback(
    (scheme: ColorScheme) => {
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
    },
    [user]
  );

  // Save user preferences to Firestore
  const saveUserPreferences = useCallback(
    async (preferences: Partial<UserPreferences>): Promise<boolean> => {
      if (!user) return false;

      try {
        const preferencesRef = doc(firestoreDB, `users/${user.uid}/profile/preferences`);
        const preferencesExists = await getDoc(preferencesRef);

        const updatedPreferences = {
          ...(preferencesExists.exists()
            ? (preferencesExists.data() as UserPreferences)
            : defaultUserPreferences),
          ...preferences,
          lastUpdated: Timestamp.now(),
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
        console.error('Error saving user preferences:', error);
        return false;
      }
    },
    [user]
  );

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
        const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;

        // Default to dark mode if no saved preference
        const shouldUseDark = savedTheme ? savedTheme === 'dark' : true;

        const initialPreferences: UserPreferences = {
          ...defaultUserPreferences,
          isDark: shouldUseDark,
          colorScheme: savedColorScheme || defaultUserPreferences.colorScheme,
          lastUpdated: Timestamp.now(),
        };

        // Save initial preferences to Firestore
        await setDoc(preferencesRef, initialPreferences);
        setUserPreferences(initialPreferences);

        return initialPreferences;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }, [user]);

  // Initialize theme and color scheme on component mount
  useEffect(() => {
    if (!user) {
      // If no user is logged in, use localStorage or default to dark mode
      const savedTheme = localStorage.getItem('theme');
      const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;

      // Default to dark mode if no saved preference
      const shouldUseDark = savedTheme ? savedTheme === 'dark' : true;

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

  const getCourseLessons = useCallback(
    async (courseId: string, options?: CacheOptions) => {
      const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
      const cacheKey = cacheOptions.cacheKey || generateCacheKey('lessons', courseId);

      // Check if we're already loading this data
      if (isRequestPending(cacheKey)) {
        return () => {
          /* No cleanup needed for pending request */
        };
      } // Check if data is already in state
      const lessons = state.lessons[courseId];
      if (lessons && Object.keys(lessons).length > 0) {
        // Check if we need to update loading state for lessons
        const courseLessonStates = state.lessonLoadingStates[courseId];
        if (
          !courseLessonStates ||
          Object.values(courseLessonStates).some((status) => status !== 'success')
        ) {
          dispatch({
            type: 'SET_LESSON_LOADING_STATE',
            payload: { courseId, status: 'success' },
          });
        }
        return () => {
          /* No cleanup needed for cached data */
        };
      } // Check if data is in localStorage cache
      if (cacheOptions.persist) {
        const cachedData = loadFromLocalStorage(cacheKey);
        if (cachedData && !isCacheExpired(cachedData.metadata)) {
          // Use cached data
          Object.entries(cachedData.data as Record<string, unknown>).forEach(
            ([lessonId, lesson]) => {
              dispatch({
                type: 'SET_LESSONS',
                payload: { courseId, lessonId, lesson },
              });
            }
          );
          dispatch({
            type: 'SET_LESSON_LOADING_STATE',
            payload: { courseId, status: 'success' },
          });

          return () => {
            /* No cleanup needed for cached data */
          };
        }
      }

      // Set loading state
      dispatch({
        type: 'SET_LESSON_LOADING_STATE',
        payload: { courseId, status: 'loading' },
      });

      // Mark request as pending
      setRequestPending(cacheKey, true);

      try {
        const db = getFirestore(firebaseApp);
        const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
        const lessonsQuery = query(lessonsCollection); // Removed status filter to match server implementation
        const unsubscribe = onSnapshot(
          lessonsQuery,
          (querySnapshot) => {
            const lessonData: Record<string, Lesson> = {};

            if (querySnapshot.size === 0) {
              console.warn(
                `No lessons found for course: ${courseId}. This might be expected for new courses.`
              );

              // Even with no lessons, we should set the loading state to success
              dispatch({
                type: 'SET_LESSON_LOADING_STATE',
                payload: { courseId, status: 'success' },
              });

              // Initialize an empty object for this course to track that we've loaded it
              dispatch({
                type: 'INITIALIZE_COURSE_LESSONS',
                payload: { courseId },
              });
            }

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              data.id = doc.id;
              lessonData[doc.id] = data as Lesson;

              dispatch({
                type: 'SET_LESSONS',
                payload: { courseId, lessonId: doc.id, lesson: data },
              });
            });

            // Log all lesson IDs for debugging
            const lessonIds = Object.keys(lessonData);
            console.log(`Lesson IDs for course ${courseId}:`, lessonIds);

            // Set loading state to success
            dispatch({
              type: 'SET_LESSON_LOADING_STATE',
              payload: { courseId, status: 'success' },
            });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
              const cacheEntry = {
                data: lessonData,
                metadata: generateCacheMetadata('success', cacheOptions.ttl),
              };
              saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
            } // Mark request as no longer pending
            setRequestPending(cacheKey, false);
          },
          (error) => {
            // Handle permission errors gracefully (e.g., when user signs out)
            if (error.code === 'permission-denied') {
              console.log(`Lessons listener for ${courseId}: Permission denied (user signed out)`);
              dispatch({
                type: 'SET_LESSON_LOADING_STATE',
                payload: { courseId, status: 'idle' },
              });
            } else {
              console.error('Error in lessons listener:', error);
              dispatch({
                type: 'SET_LESSON_LOADING_STATE',
                payload: { courseId, status: 'error' },
              });
            }
            setRequestPending(cacheKey, false);
          }
        );

        // Return the unsubscribe function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up lessons listener:', error);
        // Set loading state to error
        dispatch({
          type: 'SET_LESSON_LOADING_STATE',
          payload: { courseId, status: 'error' },
        });

        // Mark request as no longer pending
        setRequestPending(cacheKey, false);

        // Return a no-op cleanup function
        return () => {
          /* No cleanup needed after error */
        };
      }
    },
    [state.lessonLoadingStates, dispatch, isRequestPending, setRequestPending]
  ); // Removed state.lessons to prevent re-subscription

  const getCourseReviews = useCallback(
    async (courseId: string, options?: CacheOptions) => {
      const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
      const cacheKey = cacheOptions.cacheKey || generateCacheKey('reviews', courseId);

      // Check if we're already loading this data
      if (isRequestPending(cacheKey)) {
        return () => {
          /* No cleanup needed for pending request */
        };
      }

      // Check if data is in localStorage cache first
      if (cacheOptions.persist) {
        const cachedData = loadFromLocalStorage(cacheKey);

        if (cachedData && !isCacheExpired(cachedData.metadata)) {
          // Use cached data
          const reviewData = cachedData.data as Record<string, Review>;
          if (reviewData && typeof reviewData === 'object') {
            Object.entries(reviewData).forEach(([reviewId, review]) => {
              dispatch({
                type: 'SET_REVIEWS',
                payload: { courseId, reviewId, review },
              });
            });
          }

          dispatch({
            type: 'SET_REVIEW_LOADING_STATE',
            payload: { courseId, status: 'success' },
          });

          return () => {
            /* No cleanup needed for localStorage cache */
          };
        }
      }

      // Set loading state
      dispatch({
        type: 'SET_REVIEW_LOADING_STATE',
        payload: { courseId, status: 'loading' },
      });

      // Mark request as pending
      setRequestPending(cacheKey, true);

      try {
        const db = getFirestore(firebaseApp);
        const docRef = collection(db, `courses/${courseId}/reviews`);
        const q = query(docRef);
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const reviewData: Record<string, any> = {};

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              data.id = doc.id;
              reviewData[doc.id] = data;

              dispatch({
                type: 'SET_REVIEWS',
                payload: { courseId, reviewId: doc.id, review: data },
              });
            });

            // Set loading state to success
            dispatch({
              type: 'SET_REVIEW_LOADING_STATE',
              payload: { courseId, status: 'success' },
            });

            // Cache data if persist is enabled
            if (cacheOptions.persist) {
              const cacheEntry = {
                data: reviewData,
                metadata: generateCacheMetadata('success', cacheOptions.ttl),
              };
              saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
            }

            // Mark request as no longer pending
            setRequestPending(cacheKey, false);
          },
          (error) => {
            // Handle permission errors gracefully (e.g., when user signs out)
            if (error.code === 'permission-denied') {
              console.log(`Reviews listener for ${courseId}: Permission denied (user signed out)`);
              dispatch({
                type: 'SET_REVIEW_LOADING_STATE',
                payload: { courseId, status: 'idle' },
              });
            } else {
              console.error('Error fetching reviews:', error);
              dispatch({
                type: 'SET_REVIEW_LOADING_STATE',
                payload: { courseId, status: 'error' },
              });
            }

            // Mark request as no longer pending
            setRequestPending(cacheKey, false);
          }
        );

        // Return the unsubscribe function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up reviews listener:', error); // Set loading state to error
        dispatch({
          type: 'SET_REVIEW_LOADING_STATE',
          payload: { courseId, status: 'error' },
        });

        // Mark request as no longer pending
        setRequestPending(cacheKey, false);

        return () => {
          /* No cleanup needed for error case */
        };
      }
    },
    [dispatch, isRequestPending, setRequestPending]
  );

  const saveLessonProgress = useCallback(
    async (courseId: string, lessonId: string, position: number, isCompleted: boolean = false) => {
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
          lastUpdated: Timestamp.now(),
        };

        if (progressExists.exists()) {
          await updateDoc(progressRef, {
            userId: progressData.userId,
            courseId: progressData.courseId,
            lessonId: progressData.lessonId,
            lastPosition: progressData.lastPosition,
            isCompleted: progressData.isCompleted,
            lastUpdated: progressData.lastUpdated,
          });
        } else {
          await setDoc(progressRef, progressData);
        }

        dispatch({
          type: 'SET_LESSON_PROGRESS',
          payload: {
            courseId,
            lessonId,
            progress: progressData,
          },
        });

        return true;
      } catch (error) {
        console.error('Error saving lesson progress:', error);
        return false;
      }
    },
    [user, dispatch]
  );

  const markLessonComplete = useCallback(
    async (courseId: string, lessonId: string) => {
      // Get current completion status
      const currentProgress = state.lessonProgress?.[courseId]?.[lessonId];
      const isCurrentlyCompleted = currentProgress?.isCompleted || false;

      // Toggle the completion status
      const result = await saveLessonProgress(
        courseId,
        lessonId,
        currentProgress?.lastPosition || 0,
        !isCurrentlyCompleted
      );

      // Trigger achievement sync if lesson was marked as complete (not uncomplete)
      if (result && !isCurrentlyCompleted) {
        // Import and call syncAchievements to check if user unlocked any achievements
        // This is done asynchronously to not block the UI
        try {
          // Note: syncAchievements will be called by useAchievements hook which monitors lessonProgress changes
          // We don't need to manually call it here as the context update will trigger the hook
        } catch (error) {
          console.error('Achievement sync failed (non-critical):', error);
        }
      }

      return result;
    },
    [saveLessonProgress, state.lessonProgress]
  );

  const getUserLessonProgress = useCallback(async () => {
    if (!user)
      return () => {
        /* No cleanup needed when user is null */
      };

    try {
      const progressRef = collection(firestoreDB, 'users', user.uid, 'progress');
      const q = query(progressRef);

      // Explicitly type this as a Firebase Unsubscribe function
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as UserLessonProgress;
            const { courseId, lessonId } = data;

            dispatch({
              type: 'SET_LESSON_PROGRESS',
              payload: {
                courseId,
                lessonId,
                progress: data,
              },
            });
          });
        },
        (error) => {
          // Handle permission errors gracefully (e.g., when user signs out)
          if (error.code === 'permission-denied') {
            console.log('Lesson progress listener: Permission denied (user signed out)');
            // Lesson progress will be cleared when user state becomes null
          } else {
            console.error('Error fetching lesson progress:', error);
          }
        }
      );

      // Since this is an async function, we need to return a Promise that resolves to the unsubscribe function
      return Promise.resolve(() => {
        unsubscribe();
      });
    } catch (error) {
      console.error('Error setting up lesson progress listener:', error);
      return Promise.resolve(() => {
        /* No cleanup needed in error case */
      }); // Return a Promise that resolves to a no-op function in case of error
    }
  }, [user, dispatch]); // Get all users (admin only)
  const getAllUsers = useCallback(
    async (options?: CacheOptions): Promise<Record<string, UserProfile> | null> => {
      if (!user || !state.isAdmin) {
        return null;
      }

      const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
      const cacheKey = cacheOptions.cacheKey || 'users';

      // Check if we're already loading this data
      if (isRequestPending(cacheKey)) {
        return state.users || null;
      }

      // Check if data is already in state
      if (state.users && Object.keys(state.users).length > 0) {
        // Check if we need to update loading state
        if (state.userLoadingState !== 'success') {
          dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });
        }
        return state.users;
      } // Check if data is in localStorage cache
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
        const usersRef = collection(firestoreDB, 'users');
        const q = query(usersRef, limit(100));
        const usersSnapshot = await getDocs(q);

        if (usersSnapshot.empty) {
          dispatch({ type: 'SET_USERS', payload: {} });
          dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });
          setRequestPending(cacheKey, false);
          return {};
        }

        const usersData: Record<string, UserProfile> = {};
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();

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

        dispatch({ type: 'SET_USERS', payload: usersData });
        dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'success' });

        // Cache data if persist is enabled
        if (cacheOptions.persist) {
          const cacheEntry = {
            data: usersData,
            metadata: generateCacheMetadata('success', cacheOptions.ttl),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }

        setRequestPending(cacheKey, false);
        return usersData;
      } catch (error) {
        console.error('Error fetching users:', error);
        dispatch({ type: 'SET_USER_LOADING_STATE', payload: 'error' });
        setRequestPending(cacheKey, false);
        return null;
      }
    },
    [
      user,
      state.isAdmin,
      state.users,
      state.userLoadingState,
      dispatch,
      isRequestPending,
      setRequestPending,
    ]
  );

  // Assign course to a user (admin only)
  const assignCourseToUser = useCallback(
    async (userId: string, courseId: string) => {
      if (!user || !state.isAdmin) return false;

      try {
        const db = getFirestore(firebaseApp);

        // First check if the course exists
        const courseRef = doc(db, `courses/${courseId}`);
        const courseDoc = await getDoc(courseRef);

        if (!courseDoc.exists()) {
          console.error('Course does not exist');
          return false;
        }

        // Get the course data
        const courseData = courseDoc.data();
        // Get the priceId from the course data
        const priceId = courseData.price;

        if (!priceId) {
          console.error('Price not found for course');
          return false;
        }

        // Find the product that contains this price
        const product = state.products.find(
          (product: { prices?: { id: string }[] }) =>
            product.prices && product.prices.some((price: { id: string }) => price.id === priceId)
        );

        if (!product) {
          console.error('Product not found for course price');
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
            assignmentMethod: 'admin',
          },
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
                source: 'admin',
              },
            },
          });
        }

        // Clear user cache after assignment
        clearCache('users');

        return true;
      } catch (error) {
        console.error('Error assigning course to user:', error);
        return false;
      }
    },
    [user, state.isAdmin, state.products, clearCache]
  );

  // Get admin analytics data
  const getAdminAnalytics = useCallback(
    async (options?: CacheOptions): Promise<AdminAnalytics | null> => {
      if (!user || !state.isAdmin) return null;

      const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
      const cacheKey = cacheOptions.cacheKey || 'adminAnalytics';

      // Check if we're already loading this data
      if (isRequestPending(cacheKey)) {
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
          return cachedData.data as AdminAnalytics;
        }
      }

      // Set loading state
      dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'loading' });

      // Mark request as pending
      setRequestPending(cacheKey, true);

      try {
        // Calculate analytics data from various collections

        // Get total users
        const usersRef = collection(firestoreDB, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;

        // Get total courses
        const coursesRef = collection(firestoreDB, 'courses');
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
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

        const newUsersQuery = query(usersRef, where('createdAt', '>=', thirtyDaysAgoTimestamp));
        const newUsersSnapshot = await getDocs(newUsersQuery);
        const newUsers = newUsersSnapshot.size;

        // Get sales data
        const salesRef = collectionGroup(firestoreDB, 'payments');
        const salesQuery = query(salesRef, where('status', '==', 'succeeded'));
        const salesSnapshot = await getDocs(salesQuery);

        let totalRevenue = 0;
        let newSales = 0;
        const monthlyRevenue: Record<string, number> = {};

        salesSnapshot.forEach((doc) => {
          const sale = doc.data();

          // Log payment structure for debugging (first payment only)
          if (totalRevenue === 0 && newSales === 0) {
            console.log('Sample payment data:', sale);
          }

          if (sale.amount !== undefined && sale.amount !== null) {
            const amount = typeof sale.amount === 'number' ? sale.amount : parseFloat(sale.amount);
            totalRevenue += amount / 100; // Convert from bani to RON

            // Calculate monthly revenue - try multiple date field options
            let date: Date | null = null;

            // Try different date field possibilities
            if (sale.createdAt) {
              if (typeof sale.createdAt.toDate === 'function') {
                date = sale.createdAt.toDate();
              } else if (typeof sale.createdAt === 'number') {
                date = new Date(sale.createdAt * 1000);
              } else if (sale.createdAt instanceof Date) {
                date = sale.createdAt;
              }
            } else if (sale.created) {
              if (typeof sale.created === 'number') {
                date = new Date(sale.created * 1000);
              } else if (typeof sale.created.toDate === 'function') {
                date = sale.created.toDate();
              }
            } else if (sale.timestamp) {
              if (typeof sale.timestamp.toDate === 'function') {
                date = sale.timestamp.toDate();
              } else if (typeof sale.timestamp === 'number') {
                date = new Date(sale.timestamp * 1000);
              }
            }

            // If still no date, use current date as fallback
            if (!date || isNaN(date.getTime())) {
              date = new Date();
            }

            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

            monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + amount / 100;

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
          // Get course name from multilingual field or fallback to name
          let courseName = courseData.name || 'Unnamed Course';
          if (courseData.title) {
            // Try to get current locale name
            const currentLocale = typeof window !== 'undefined' ?
              (localStorage.getItem('locale') || 'en') : 'en';
            courseName = courseData.title[currentLocale] || courseData.title.en || courseData.title.ro || courseName;
          }

          const course = {
            courseId: doc.id,
            courseName,
            enrollments: 0,
          };

          popularCourses.push(course);
        });

        // For each payment, find the course and increment its enrollments
        salesSnapshot.forEach((doc) => {
          const sale = doc.data();
          // Try to get courseId from metadata or root level
          const courseId = sale.metadata?.courseId || sale.courseId;
          if (courseId) {
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
          popularCourses: popularCourses.slice(0, 5), // Top 5 courses
        };

        dispatch({ type: 'SET_ADMIN_ANALYTICS', payload: analyticsData });
        dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'success' });

        // Cache data if persist is enabled
        if (cacheOptions.persist) {
          const cacheEntry = {
            data: analyticsData,
            metadata: generateCacheMetadata('success', cacheOptions.ttl),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }

        setRequestPending(cacheKey, false);
        return analyticsData;
      } catch (error) {
        console.error('Error fetching admin analytics:', error);
        dispatch({ type: 'SET_ADMIN_ANALYTICS_LOADING_STATE', payload: 'error' });
        setRequestPending(cacheKey, false);
        return null;
      }
    },
    [
      user,
      state.isAdmin,
      state.adminAnalytics,
      state.adminAnalyticsLoadingState,
      dispatch,
      isRequestPending,
      setRequestPending,
    ]
  );

  // Get admin settings
  const getAdminSettings = useCallback(
    async (options?: CacheOptions): Promise<AdminSettings | null> => {
      if (!user || !state.isAdmin) return null;

      const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
      const cacheKey = cacheOptions.cacheKey || 'adminSettings';

      // Check if we're already loading this data
      if (isRequestPending(cacheKey)) {
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
          return cachedData.data as AdminSettings;
        }
      }

      // Set loading state
      dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'loading' });

      // Mark request as pending
      setRequestPending(cacheKey, true);

      try {
        // First check if the admin collection exists and create it if not
        const adminCollectionRef = collection(firestoreDB, 'admin');
        const adminDocs = await getDocs(adminCollectionRef);
        if (adminDocs.empty) {
          // Admin collection doesn't exist, create it with a blank document
          await setDoc(doc(firestoreDB, 'admin', 'info'), {
            createdAt: Timestamp.now(),
          });
        }

        const settingsRef = doc(firestoreDB, 'admin/settings');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data() as AdminSettings;
          dispatch({ type: 'SET_ADMIN_SETTINGS', payload: settingsData });
          dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });

          // Cache data if persist is enabled
          if (cacheOptions.persist) {
            const cacheEntry = {
              data: settingsData,
              metadata: generateCacheMetadata('success', cacheOptions.ttl),
            };
            saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
          }

          setRequestPending(cacheKey, false);
          return settingsData;
        } else {
          // Create default settings if they don't exist
          const defaultSettings: AdminSettings = {
            siteName: 'Cursuri',
            siteDescription: 'Online Learning Platform',
            contactEmail: 'contact@example.com',
            allowRegistration: true,
            allowSocialLogin: true,
            paymentProcessorEnabled: true,
            taxRate: 0,
            currencyCode: 'RON',
          };

          await setDoc(settingsRef, defaultSettings);
          dispatch({ type: 'SET_ADMIN_SETTINGS', payload: defaultSettings });
          dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'success' });

          // Cache data if persist is enabled
          if (cacheOptions.persist) {
            const cacheEntry = {
              data: defaultSettings,
              metadata: generateCacheMetadata('success', cacheOptions.ttl),
            };
            saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
          }

          setRequestPending(cacheKey, false);
          return defaultSettings;
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        dispatch({ type: 'SET_ADMIN_SETTINGS_LOADING_STATE', payload: 'error' });
        setRequestPending(cacheKey, false);
        return null;
      }
    },
    [
      user,
      state.isAdmin,
      state.adminSettings,
      state.adminSettingsLoadingState,
      dispatch,
      isRequestPending,
      setRequestPending,
    ]
  );

  // Update admin settings
  const updateAdminSettings = useCallback(
    async (settings: Partial<AdminSettings>) => {
      if (!user || !state.isAdmin) return false;

      try {
        const settingsRef = doc(firestoreDB, 'admin/settings');

        await updateDoc(settingsRef, settings);

        // Update local state
        if (state.adminSettings) {
          const updatedSettings = {
            ...state.adminSettings,
            ...settings,
          };
          dispatch({ type: 'SET_ADMIN_SETTINGS', payload: updatedSettings });

          // Update cache if it exists
          const cacheKey = 'adminSettings';
          const cachedData = loadFromLocalStorage(cacheKey);
          if (cachedData) {
            const cacheEntry = {
              data: updatedSettings,
              metadata: generateCacheMetadata(
                'success',
                cachedData.metadata.expiresAt - Date.now()
              ),
            };
            saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
          }
        }

        return true;
      } catch (error) {
        console.error('Error updating admin settings:', error);
        return false;
      }
    },
    [user, state.isAdmin, state.adminSettings, dispatch]
  );

  // --- BOOKMARKING LOGIC ---
  // Get all bookmarked lessons for the user from Firestore
  const getBookmarkedLessons = useCallback(
    async (options?: CacheOptions) => {
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

        snapshot.forEach((docSnap) => {
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
            metadata: generateCacheMetadata('success', cacheOptions.ttl),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }
        setRequestPending(cacheKey, false);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        dispatch({ type: 'SET_BOOKMARKS_LOADING_STATE', payload: 'error' });
        setRequestPending(cacheKey, false);
      }
    },
    [user, dispatch, isRequestPending, setRequestPending]
  );

  // Toggle bookmark for a lesson (add/remove in Firestore and update state)
  const toggleBookmarkLesson = useCallback(
    async (courseId: string, lessonId: string) => {
      if (!user) return;
      const isBookmarked = state.bookmarkedLessons?.[courseId]?.includes(lessonId);
      const bookmarkDocRef = doc(
        firestoreDB,
        `users/${user.uid}/bookmarks/${courseId}_${lessonId}`
      );
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
            metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now()),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    },
    [user, state.bookmarkedLessons, dispatch]
  );

  // --- WISHLIST LOGIC ---    // Get all wishlist courses for the user from Firestore
  const getWishlistCourses = useCallback(
    async (options?: CacheOptions) => {
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
        if (
          state.wishlistCourses &&
          state.wishlistCourses.length > 0 &&
          state.wishlistLoadingState === 'success'
        ) {
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

        snapshot.forEach((docSnap) => {
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
            metadata: generateCacheMetadata('success', cacheOptions.ttl),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }
        setRequestPending(cacheKey, false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        dispatch({ type: 'SET_WISHLIST_LOADING_STATE', payload: 'error' });
        setRequestPending(cacheKey, false);
      }
    },
    [user, dispatch, isRequestPending, setRequestPending]
  );

  // Add a course to wishlist
  const addToWishlist = useCallback(
    async (courseId: string) => {
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
            metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now()),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    },
    [user, state.wishlistCourses, dispatch]
  );

  // Remove a course from wishlist
  const removeFromWishlist = useCallback(
    async (courseId: string) => {
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
            metadata: generateCacheMetadata('success', cachedData.metadata.expiresAt - Date.now()),
          };
          saveToLocalStorage(cacheKey, cacheEntry.data, cacheEntry.metadata);
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    },
    [user, state.wishlistCourses, dispatch]
  );

  // Onboarding modal logic
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user && !authLoading) {
        try {
          // Check Firestore for onboarding completion
          const userDocRef = doc(firestoreDB, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const completed = userDoc.exists() && userDoc.data()?.onboardingCompleted;

          if (!completed) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
    };
    checkOnboarding();
  }, [user, authLoading]);

  // Track previous user for logout logging
  const prevUserRef = React.useRef<User | null>(null);

  // Helper function to update login streak
  const updateLoginStreak = async (userId: string) => {
    try {
      const statsRef = doc(firestoreDB, `users/${userId}/profile/stats`);
      const statsSnap = await getDoc(statsRef);

      // Get today's date in YYYY-MM-DD format (UTC for consistency)
      const today = new Date().toISOString().split('T')[0];

      let loginStreak = 1;
      let lastLoginDate = today;

      if (statsSnap.exists()) {
        const statsData = statsSnap.data();
        const previousLoginDate = statsData.lastLoginDate;
        const previousStreak = statsData.loginStreak || 0;

        if (previousLoginDate === today) {
          // Already logged in today, don't increment
          loginStreak = previousStreak;
        } else if (previousLoginDate) {
          // Calculate days difference
          const lastDate = new Date(previousLoginDate);
          const currentDate = new Date(today);
          const diffTime = currentDate.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day, increment streak
            loginStreak = previousStreak + 1;
          } else {
            // Streak broken, reset to 1
            loginStreak = 1;
          }
        }

        // Update existing stats document
        await updateDoc(statsRef, {
          loginStreak,
          lastLoginDate: today,
          updatedAt: Timestamp.now()
        });
      } else {
        // Create new stats document
        await setDoc(statsRef, {
          loginStreak: 1,
          lastLoginDate: today,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      // Fail-open: Don't break auth flow if streak tracking fails
      console.error('Login streak tracking failed (non-critical):', error);
    }
  };

  useEffect(() => {
    // Store the auth unsubscribe function in a variable so we can clean up
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Set analytics user ID
        setAnalyticsUserId(currentUser.uid);

        // Track daily active user
        trackDailyActiveUser(currentUser.uid).catch(error => {
          console.error('Failed to track daily active user:', error);
        });

        // Log successful login/authentication event
        try {
          await fetch('/api/audit/auth-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'login',
              userId: currentUser.uid,
              email: currentUser.email,
              success: true,
            }),
          });
        } catch (logError) {
          // Fail-open: Don't break auth flow if logging fails
          console.error('Auth event logging failed (non-critical):', logError);
        }

        // Update login streak
        await updateLoginStreak(currentUser.uid);

        // Use new RBAC system
        try {
          // Import admin utilities
          const {
            getUserProfile,
            createOrUpdateUserProfile,
            isAdmin,
            UserRole,
          } = await import('../utils/firebase/adminAuth');

          // Get or create user profile
          let userProfile = await getUserProfile(currentUser.uid);

          // If not migrated admin, get or create regular profile
          if (!userProfile) {
            userProfile = await getUserProfile(currentUser.uid);

            // Create profile if it doesn't exist
            if (!userProfile) {
              userProfile = await createOrUpdateUserProfile(currentUser, UserRole.USER);

              // Log registration event for new users
              try {
                await fetch('/api/audit/auth-event', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'registration',
                    userId: currentUser.uid,
                    email: currentUser.email,
                    success: true,
                  }),
                });
              } catch (logError) {
                console.error('Registration event logging failed (non-critical):', logError);
              }
            }
          }

          // Update admin status based on role
          const adminStatus = isAdmin(userProfile);
          dispatch({ type: 'SET_IS_ADMIN', payload: adminStatus });

          // Set analytics user properties
          setAnalyticsUserProperties({
            user_role: userProfile.role || 'user',
            is_admin: adminStatus,
            email_verified: currentUser.emailVerified,
          });

          // Store user profile in context for permission checks                    dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
        } catch (error) {
          console.error('Error setting up user profile:', error);
          // No fallback to hardcoded admin - use role-based system only
          dispatch({ type: 'SET_IS_ADMIN', payload: false });
        }

        // Update previous user ref
        prevUserRef.current = currentUser;
      } else {
        // Log logout event if user was previously logged in
        if (prevUserRef.current) {
          try {
            await fetch('/api/audit/auth-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'logout',
                userId: prevUserRef.current.uid,
                email: prevUserRef.current.email,
                success: true,
              }),
            });
          } catch (logError) {
            console.error('Logout event logging failed (non-critical):', logError);
          }
          prevUserRef.current = null;
        }

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
        .then((unsubFunction) => {
          // Store the function so we can call it during cleanup
          if (typeof unsubFunction === 'function') {
            cleanupFunction = unsubFunction;
          }
        })
        .catch((err) => {
          console.error('Error getting unsubscribe function:', err);
        });

      // Return cleanup function that uses the stored function if available
      return () => {
        if (cleanupFunction) {
          cleanupFunction();
        }
      };
    }
    return () => {
      /* No cleanup needed when there's no user */
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // getUserLessonProgress removed to prevent re-subscription loop

  // Function to refresh products from Stripe
  const refreshProducts = useCallback(
    async (newProductData?: {
      productId: string;
      productName: string;
      priceId: string;
      amount: number;
      currency: string;
    }) => {
      try {
        // If new product data is provided, add it immediately to the state
        if (newProductData) {
          const newPrice = {
            id: newProductData.priceId,
            product: newProductData.productId,
            active: true,
            currency: newProductData.currency,
            unit_amount: newProductData.amount,
            type: 'one_time' as const,
            billing_scheme: 'per_unit' as const,
            metadata: {
              app: 'cursuri',
            },
          };

          // Find existing product or create new one
          const existingProducts = [...state.products];
          const existingProductIndex = existingProducts.findIndex(
            (p: { id?: string; name?: string }) =>
              p.id === newProductData.productId || p.name === newProductData.productName
          );

          if (existingProductIndex >= 0) {
            // Add price to existing product
            if (!existingProducts[existingProductIndex].prices) {
              existingProducts[existingProductIndex].prices = [];
            }
            existingProducts[existingProductIndex].prices.push(newPrice);
          } else {
            // Create new product with the price
            const newProduct = {
              id: newProductData.productId,
              name: newProductData.productName,
              active: true,
              metadata: {
                app: 'cursuri',
              },
              prices: [newPrice],
            };
            existingProducts.push(newProduct);
          }

          dispatch({ type: 'SET_PRODUCTS', payload: existingProducts });
          return; // Don't fetch from Firestore if we just added it manually
        }

        // Otherwise, fetch from Firestore
        const payments = stripePayments(firebaseApp);
        const products = await getProducts(payments, {
          includePrices: true,
          activeOnly: true,
        });

        // Filter products by app name in metadata
        const appName = process.env.NEXT_PUBLIC_APP_NAME;
        const filteredProducts = appName
          ? products.filter((product) => product.metadata && product.metadata.app === appName)
          : products;

        dispatch({ type: 'SET_PRODUCTS', payload: filteredProducts });
      } catch (error) {
        console.error('Error refreshing products:', error);
      }
    },
    [state.products]
  );

  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount to avoid infinite loop

  // Function to refresh subscriptions from Stripe
  const refreshSubscriptions = useCallback(
    async () => {
      if (!user) {
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
        return;
      }

      // Double-check that Firebase Auth currentUser is available
      if (!firebaseAuth.currentUser) {
        console.warn('[AppContext] Firebase Auth currentUser not available yet, skipping subscription refresh');
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
        return;
      }

      try {
        dispatch({ type: 'SET_SUBSCRIPTIONS_LOADING', payload: true });

        // Fetch subscriptions directly from Firestore to avoid firewand timing issues
        const subscriptionsRef = collection(firestoreDB, 'customers', user.uid, 'subscriptions');
        const q = query(
          subscriptionsRef,
          where('status', 'in', ['active', 'trialing', 'past_due'])
        );
        const querySnapshot = await getDocs(q);

        const allSubs: any[] = [];
        querySnapshot.forEach((doc) => {
          allSubs.push({
            id: doc.id,
            ...doc.data()
          });
        });

        const payments = stripePayments(firebaseApp);

        // Enrich subscriptions with full price and product data
        const enrichedSubs = await Promise.all(
          allSubs.map(async (sub: any) => {
            try {
              // Fetch full product and price data if they are references or string IDs
              let productData = sub.product;
              let priceData = sub.price;

              // Handle DocumentReference for product
              if (sub.product && typeof sub.product === 'object' && 'path' in sub.product) {
                // It's a DocumentReference, fetch the data
                try {
                  console.log('[AppContext] Fetching product DocumentReference:', sub.product.path);
                  const productSnapshot = await getDoc(sub.product);
                  if (productSnapshot.exists()) {
                    productData = { id: productSnapshot.id, ...(productSnapshot.data() as object) };
                    console.log('[AppContext] Successfully fetched product:', productData);
                  } else {
                    console.log('[AppContext] Product document does not exist:', sub.product.path);
                    productData = { id: sub.product.id, name: 'Unknown Product' };
                  }
                } catch (productError) {
                  console.error(`[AppContext] Error fetching product from reference:`, productError);
                  productData = { id: sub.product.id || 'unknown', name: 'Unknown Product' };
                }
              } else if (typeof sub.product === 'string') {
                // It's a string ID, use Firewand
                try {
                  productData = await getProduct(payments, sub.product);
                } catch (productError) {
                  console.error(`[AppContext] Could not fetch product ${sub.product}:`, productError);
                  productData = { id: sub.product, name: 'Unknown Product' };
                }
              }

              // Handle DocumentReference for price
              if (sub.price && typeof sub.price === 'object' && 'path' in sub.price) {
                // It's a DocumentReference, fetch the data
                try {
                  console.log('[AppContext] Fetching price DocumentReference:', sub.price.path);
                  const priceSnapshot = await getDoc(sub.price);
                  if (priceSnapshot.exists()) {
                    priceData = { id: priceSnapshot.id, ...(priceSnapshot.data() as object) };
                    console.log('[AppContext] Successfully fetched price:', priceData);
                  } else {
                    console.log('[AppContext] Price document does not exist:', sub.price.path);
                    priceData = { id: sub.price.id };
                  }
                } catch (priceError) {
                  console.error(`[AppContext] Error fetching price from reference:`, priceError);
                  priceData = { id: sub.price.id || 'unknown' };
                }
              } else if (typeof sub.price === 'string' && typeof sub.product === 'string') {
                // It's a string ID, use Firewand
                try {
                  priceData = await getPrice(payments, sub.product, sub.price);
                } catch (priceError) {
                  console.error(`[AppContext] Could not fetch price ${sub.price}:`, priceError);
                  priceData = { id: sub.price };
                }
              }

              return {
                ...sub,
                product: productData,
                price: priceData
              };
            } catch (error) {
              console.error('[AppContext] Error enriching subscription:', error);
              // Return subscription with minimal data if enrichment fails completely
              return {
                ...sub,
                product: typeof sub.product === 'string' ? { id: sub.product, name: 'Unknown Product' } : sub.product,
                price: typeof sub.price === 'string' ? { id: sub.price } : sub.price
              };
            }
          })
        );

        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: enrichedSubs });
      } catch (error) {
        console.error('[AppContext] Error refreshing subscriptions:', error);
        dispatch({ type: 'SET_SUBSCRIPTIONS_ERROR', payload: (error as Error).message });
      }
    },
    [user]
  );

  // Fetch subscriptions when user logs in
  useEffect(() => {
    if (user) {
      refreshSubscriptions();
    } else {
      // Clear subscriptions when user logs out
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); // Only re-run when user UID changes

  // Refresh courses function
  const refreshCourses = useCallback(async () => {
    // Clear courses cache
    const courseIds = Object.keys(state.courses);
    courseIds.forEach((courseId) => {
      clearCache(`course_${courseId}`);
    });

    // Clear all courses from state
    dispatch({ type: 'CLEAR_CACHE' });

    // Fetch courses again
    try {
      dispatch({
        type: 'SET_COURSE_LOADING_STATE',
        payload: { courseId: 'all', status: 'loading' },
      });

      const q = query(collection(firestoreDB, 'courses'), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        dispatch({ type: 'SET_COURSES', payload: { courseId: doc.id, course: data } });
        dispatch({
          type: 'SET_COURSE_LOADING_STATE',
          payload: { courseId: doc.id, status: 'success' },
        });
      });

      dispatch({
        type: 'SET_COURSE_LOADING_STATE',
        payload: { courseId: 'all', status: 'success' },
      });
    } catch (error) {
      console.error('Error refreshing courses:', error);
      dispatch({
        type: 'SET_COURSE_LOADING_STATE',
        payload: { courseId: 'all', status: 'error' },
      });
    }
  }, [state.courses, clearCache]);

  useEffect(() => {
    let mounted = true;
    const unsubscribes: Unsubscribe[] = [];

    const fetchCourses = async (force: boolean = false) => {
      // Check if courses are already fetched to avoid duplicate requests
      if (!force && Object.keys(state.courses).length > 0) {
        return () => {
          unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
      }

      // Set loading state for courses
      dispatch({
        type: 'SET_COURSE_LOADING_STATE',
        payload: { courseId: 'all', status: 'loading' },
      });

      try {
        const q = query(collection(firestoreDB, 'courses'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);

        // First set all courses in the state
        if (mounted) {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            dispatch({ type: 'SET_COURSES', payload: { courseId: doc.id, course: data } });
            dispatch({
              type: 'SET_COURSE_LOADING_STATE',
              payload: { courseId: doc.id, status: 'success' },
            });
          });

          // Then fetch lessons for each course, but only if still mounted
          if (mounted) {
            querySnapshot.forEach((doc) => {
              const courseId = doc.id;
              getCourseLessons(courseId, { persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
            });

            // Set loading state to success
            dispatch({
              type: 'SET_COURSE_LOADING_STATE',
              payload: { courseId: 'all', status: 'success' },
            });
          }
        }

        // Return cleanup function to unsubscribe from all listeners
        return () => {
          unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error('Error fetching courses:', error);
        if (mounted) {
          dispatch({
            type: 'SET_COURSE_LOADING_STATE',
            payload: { courseId: 'all', status: 'error' },
          });
        }
        return () => {
          /* No cleanup needed in error case */
        };
      }
    };

    const unsubscribePromise = fetchCourses();

    // Clean up function
    return () => {
      mounted = false;
      unsubscribePromise.then((cleanup) => {
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
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const userPaidProducts: UserPaidProduct[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            if (data.status === 'succeeded') userPaidProducts.push(data as UserPaidProduct);
          });
          dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: userPaidProducts });
        },
        (error) => {
          // Handle permission errors gracefully (e.g., when user signs out)
          if (error.code === 'permission-denied') {
            console.log('Payments listener: Permission denied (user signed out)');
            dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: [] });
          } else {
            console.error('Error in payments listener:', error);
          }
        }
      );
      // Properly type the unsubscribe function to avoid type errors
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
      dispatch({ type: 'SET_USER_PAID_PRODUCTS', payload: [] });
      return () => {
        /* No cleanup needed when user is null */
      };
    }
  }, [user, dispatch]); // Fetch bookmarks and wishlist on login
  useEffect(() => {
    if (user) {
      getBookmarkedLessons({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
      getWishlistCourses({ persist: true, ttl: 30 * 60 * 1000 }); // Cache for 30 minutes
    }
  }, [user]); // Fetch a single course by ID
  const fetchCourseById = useCallback(
    async (courseId: string, options: CacheOptions = DEFAULT_CACHE_OPTIONS) => {
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
        const courseRef = doc(firestoreDB, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          courseData.id = courseSnap.id;

          // Update state
          dispatch({ type: 'SET_COURSES', payload: { courseId, course: courseData } });
          dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'success' } }); // Cache the result if needed
          if (options.persist) {
            saveToLocalStorage(
              cacheKey,
              courseData,
              generateCacheMetadata(
                'success',
                typeof options.ttl === 'number' ? options.ttl : undefined
              )
            );
          }
        } else {
          console.log('No such course exists!');
          dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'error' } });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        dispatch({ type: 'SET_COURSE_LOADING_STATE', payload: { courseId, status: 'error' } });
      } finally {
        // Clear pending request
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey, isPending: false } });
      }
    },
    [dispatch, isRequestPending, state.courses]
  );

  // Fetch lessons for a specific course
  const fetchLessonsForCourse = useCallback(
    async (courseId: string, options: CacheOptions = DEFAULT_CACHE_OPTIONS) => {
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
        const q = query(collection(firestoreDB, 'courses', courseId, 'lessons'));
        const querySnapshot = await getDocs(q);

        const lessonsData: Record<string, Lesson> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          lessonsData[doc.id] = data as Lesson;
        }); // Initialize the course lessons structure first
        dispatch({ type: 'INITIALIZE_COURSE_LESSONS', payload: { courseId } });

        // Update state with all lessons at once using the new bulk update support
        dispatch({ type: 'SET_LESSONS', payload: { courseId, lessons: lessonsData } });
        dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'success' } });

        // Cache the result if needed
        if (options.persist) {
          saveToLocalStorage(
            cacheKey,
            lessonsData,
            generateCacheMetadata(
              'success',
              typeof options.ttl === 'number' ? options.ttl : undefined
            )
          );
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        dispatch({ type: 'SET_LESSON_LOADING_STATE', payload: { courseId, status: 'error' } });
      } finally {
        // Clear pending request
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key: cacheKey, isPending: false } });
      }
    },
    [dispatch, isRequestPending]
  );

  // Get an individual course by ID - server compatible helper
  const getCourseById = useCallback(
    async (courseId: string): Promise<Course | null> => {
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
            ...courseSnap.data(),
          } as Course;

          // Update state
          dispatch({
            type: 'SET_COURSES',
            payload: { courseId, course: courseData },
          });

          return courseData;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Error getting course ${courseId}:`, error);
        return null;
      }
    },
    [dispatch, state.courses]
  );

  // Get an individual lesson by ID - server compatible helper
  const getLessonById = useCallback(
    async (courseId: string, lessonId: string): Promise<Lesson | null> => {
      if (!courseId || !lessonId) {
        console.error(
          `getLessonById: Invalid parameters: courseId=${courseId}, lessonId=${lessonId}`
        );
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
            ...lessonSnap.data(),
          } as Lesson;

          // Update state
          dispatch({
            type: 'SET_LESSONS',
            payload: { courseId, lessonId, lesson: lessonData },
          });

          return lessonData;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Error getting lesson ${lessonId} in course ${courseId}:`, error);
        return null;
      }
    },
    [dispatch, state.lessons]
  );

  return (
    <AppContext.Provider
      value={{
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
        refreshProducts,
        subscriptions: state.subscriptions,
        subscriptionsLoading: state.subscriptionsLoading,
        subscriptionsError: state.subscriptionsError,
        refreshSubscriptions,
        courses: state.courses,
        courseLoadingStates: state.courseLoadingStates,
        refreshCourses,
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
      }}
    >
      {children}
      {state.modals.map(
        (modal: {
          id: string;
          isOpen: boolean;
          modalBody: React.ReactNode | string;
          hideCloseIcon?: boolean;
          hideCloseButton?: boolean;
          backdrop?: 'blur' | 'opaque' | 'transparent';
          size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
          scrollBehavior?: 'inside' | 'outside';
          isDismissable?: boolean;
          modalHeader?: React.ReactNode | string;
          headerDisabled?: boolean;
          footerDisabled?: boolean;
          footerButtonText?: string | null;
          footerButtonClick?: (() => void) | null;
          modalBottomComponent?: React.ReactNode | null;
          noReplaceURL?: boolean;
          onClose?: () => void;
        }) => (
          <ModalComponent key={modal.id} {...modal} />
        )
      )}
      {showOnboarding && (
        <ModalComponent
          id="onboarding"
          isOpen={true}
          modalHeader="Welcome!"
          modalBody={
            <OnboardingModal
              onClose={async () => {
                setShowOnboarding(false);
                if (user) {
                  try {
                    // Save to Firestore
                    const userDocRef = doc(firestoreDB, 'users', user.uid);
                    await updateDoc(userDocRef, {
                      onboardingCompleted: true,
                      onboardingCompletedAt: serverTimestamp(),
                    });
                    // Also save to localStorage as backup
                    localStorage.setItem(`onboarding-complete-${user.uid}`, 'true');
                  } catch (error) {
                    console.error('Error saving onboarding status:', error);
                  }
                }
              }}
            />
          }
          hideCloseButton={true}
          hideCloseIcon={false}
          backdrop="blur"
          size="md"
          scrollBehavior="inside"
          isDismissable={false}
          footerDisabled={true}
        />
      )}{' '}
    </AppContext.Provider>
  );
};

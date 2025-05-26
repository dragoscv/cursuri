import React, { useReducer, useCallback, ReactNode } from 'react';
import { createSafeContext, LoadingState, CacheOptions } from './baseContext';
import { useCache } from '@/components/contexts/modules/cacheContext';
import { useAuth } from './authContext';
import {
    collection,
    doc,
    getDoc,
    query,
    onSnapshot,
    getFirestore,
    updateDoc,
    setDoc,
    orderBy,
    arrayUnion
} from 'firebase/firestore';
import { firebaseApp } from '../../../utils/firebase/firebase.config';

// Default cache options
const DEFAULT_CACHE_OPTIONS = {
    ttl: 5 * 60 * 1000, // 5 minutes
    persist: false,
    cacheKey: undefined
};

// Types
export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description: string;
    content: string;
    videoUrl?: string;
    duration: number; // in minutes
    order: number;
    status: 'active' | 'draft' | 'archived';
    createdAt: number;
    updatedAt: number;
    resources?: Resource[];
    quizId?: string;
    type?: 'video' | 'text' | 'quiz' | 'exercise';
    module?: string;
    isPremium?: boolean;
    [key: string]: unknown;
}

export interface Resource {
    id: string;
    title: string;
    description?: string;
    url: string;
    type: 'pdf' | 'link' | 'code' | 'image' | 'other';
    createdAt: number;
}

export interface LessonProgress {
    lessonId: string;
    courseId: string;
    userId: string;
    progress: number; // 0-100
    completed: boolean;
    lastAccessedAt: number;
    totalTimeSpent: number; // in seconds
    createdAt: number; // Added missing createdAt property
    updatedAt?: number;
    notes?: string[];
    quiz?: {
        attempts: number;
        bestScore: number;
        completed: boolean;
    };
}

// Define action types
type LessonsAction =
    | { type: 'SET_LESSONS'; payload: { courseId: string; lessonId: string; lesson: Lesson } }
    | { type: 'SET_LESSONS_BATCH'; payload: { courseId: string; lessons: Record<string, Lesson> } }
    | { type: 'SET_ACTIVE_LESSON'; payload: string | null }
    | { type: 'SET_LESSON_LOADING_STATE'; payload: { courseId: string; status: LoadingState } }
    | { type: 'INITIALIZE_COURSE_LESSONS'; payload: { courseId: string } }
    | { type: 'SET_LESSON_PROGRESS'; payload: { lessonId: string; progress: LessonProgress } }
    | { type: 'SET_LESSON_COMPLETED'; payload: { lessonId: string; completed: boolean } }
    | { type: 'SET_LESSON_PROGRESS_BATCH'; payload: Record<string, LessonProgress> };

// Lessons state interface
interface LessonsState {
    lessons: Record<string, Record<string, Lesson>>;
    activeLessonId: string | null;
    lessonLoadingStates: Record<string, LoadingState>;
    lessonProgress: Record<string, LessonProgress>;
}

// Initial state
const initialLessonsState: LessonsState = {
    lessons: {},
    activeLessonId: null,
    lessonLoadingStates: {},
    lessonProgress: {},
};

// Lessons reducer
function lessonsReducer(state: LessonsState, action: LessonsAction): LessonsState {
    switch (action.type) {
        case 'SET_LESSONS':
            return {
                ...state,
                lessons: {
                    ...state.lessons,
                    [action.payload.courseId]: {
                        ...(state.lessons[action.payload.courseId] || {}),
                        [action.payload.lessonId]: action.payload.lesson
                    }
                }
            };
        case 'SET_LESSONS_BATCH':
            return {
                ...state,
                lessons: {
                    ...state.lessons,
                    [action.payload.courseId]: {
                        ...(state.lessons[action.payload.courseId] || {}),
                        ...action.payload.lessons
                    }
                }
            };
        case 'SET_ACTIVE_LESSON':
            return { ...state, activeLessonId: action.payload };
        case 'SET_LESSON_LOADING_STATE':
            return {
                ...state,
                lessonLoadingStates: {
                    ...state.lessonLoadingStates,
                    [action.payload.courseId]: action.payload.status
                }
            };
        case 'INITIALIZE_COURSE_LESSONS':
            if (!state.lessons[action.payload.courseId]) {
                return {
                    ...state,
                    lessons: {
                        ...state.lessons,
                        [action.payload.courseId]: {}
                    }
                };
            }
            return state;
        case 'SET_LESSON_PROGRESS':
            return {
                ...state,
                lessonProgress: {
                    ...state.lessonProgress,
                    [action.payload.lessonId]: action.payload.progress
                }
            };
        case 'SET_LESSON_COMPLETED':
            return {
                ...state,
                lessonProgress: {
                    ...state.lessonProgress,
                    [action.payload.lessonId]: {
                        ...state.lessonProgress[action.payload.lessonId],
                        completed: action.payload.completed,
                        progress: action.payload.completed ? 100 : state.lessonProgress[action.payload.lessonId]?.progress || 0
                    }
                }
            };
        case 'SET_LESSON_PROGRESS_BATCH':
            return {
                ...state,
                lessonProgress: {
                    ...state.lessonProgress,
                    ...action.payload
                }
            };
        default:
            return state;
    }
}

// Lessons context type
interface LessonsContextType {
    state: LessonsState;
    getLessonsForCourse: (courseId: string, options?: CacheOptions) => void;
    getLesson: (courseId: string, lessonId: string) => Promise<Lesson | null>;
    setActiveLesson: (lessonId: string | null) => void;
    updateLessonProgress: (courseId: string, lessonId: string, progress: number) => Promise<void>;
    completeLessonToggle: (courseId: string, lessonId: string, completed: boolean) => Promise<void>;
    getLessonProgress: (courseId: string, lessonId: string) => Promise<LessonProgress | null>;
}

// Create the context
const [LessonsContext, useLessonsContext] = createSafeContext<LessonsContextType>('LessonsContext');

// Provider component
interface LessonsProviderProps {
    children: ReactNode;
}

export const LessonsProvider: React.FC<LessonsProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(lessonsReducer, initialLessonsState);
    const { user } = useAuth();
    const {
        generateCacheKey,
        isRequestPending,
        setRequestPending,
        getCachedData,
        setCachedData
    } = useCache();

    const db = getFirestore(firebaseApp);

    // Set active lesson
    const setActiveLesson = useCallback((lessonId: string | null) => {
        dispatch({ type: 'SET_ACTIVE_LESSON', payload: lessonId });
    }, []);    // Get lessons for a course
    const getLessonsForCourse = useCallback((courseId: string, options?: CacheOptions) => {
        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || generateCacheKey('lessons', { courseId });

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            console.log(`Request already pending for ${cacheKey}`);
            return;
        }

        // Check if data is already in state
        const lessons = state.lessons[courseId];
        if (lessons && Object.keys(lessons).length > 0) {
            // Check if we need to update loading state
            const loadingState = state.lessonLoadingStates[courseId];
            if (loadingState !== 'success') {
                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });
            }
            return;
        }        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = getCachedData<Record<string, Lesson>>(cacheKey);
            if (cachedData) {
                // Use cached data
                dispatch({
                    type: 'SET_LESSONS_BATCH',
                    payload: { courseId, lessons: cachedData }
                });

                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                return;
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
            const lessonsCollection = collection(db, `courses/${courseId}/lessons`);
            const lessonsQuery = query(lessonsCollection, orderBy('order', 'asc'));

            console.log(`Setting up listener for lessons in course: ${courseId}`);

            const unsubscribe = onSnapshot(lessonsQuery, (querySnapshot) => {
                const lessonData: Record<string, Lesson> = {};
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
                    const data = doc.data() as Lesson;
                    data.id = doc.id;
                    lessonData[doc.id] = data;
                });

                // Update state with all lessons at once
                dispatch({
                    type: 'SET_LESSONS_BATCH',
                    payload: { courseId, lessons: lessonData }
                });

                // Set loading state to success
                dispatch({
                    type: 'SET_LESSON_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });                // Cache data if persist is enabled
                if (cacheOptions.persist) {
                    setCachedData(cacheKey, lessonData);
                }

                // Mark request as no longer pending
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
    }, [
        db,
        state.lessons,
        state.lessonLoadingStates,
        generateCacheKey,
        isRequestPending,
        setRequestPending,
        getCachedData,
        setCachedData
    ]);

    // Get a single lesson
    const getLesson = useCallback(async (courseId: string, lessonId: string): Promise<Lesson | null> => {
        // Check if lesson is in state
        if (state.lessons[courseId]?.[lessonId]) {
            return state.lessons[courseId][lessonId];
        }

        try {
            const lessonRef = doc(db, `courses/${courseId}/lessons`, lessonId);
            const lessonSnap = await getDoc(lessonRef);

            if (lessonSnap.exists()) {
                const lessonData = lessonSnap.data() as Lesson;
                lessonData.id = lessonSnap.id;

                // Update state
                dispatch({
                    type: 'SET_LESSONS',
                    payload: { courseId, lessonId, lesson: lessonData }
                });

                return lessonData;
            } else {
                console.warn(`Lesson ${lessonId} not found in course ${courseId}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching lesson ${lessonId} for course ${courseId}:`, error);
            return null;
        }
    }, [db, state.lessons]);    // Update lesson progress
    const updateLessonProgress = useCallback(async (courseId: string, lessonId: string, progress: number) => {
        if (!user) {
            console.warn("Cannot update lesson progress: User not authenticated");
            return;
        }

        try {
            const userId = user.uid;
            const progressRef = doc(db, 'users', userId, 'lessonProgress', lessonId);

            // Check if progress document exists
            const progressSnap = await getDoc(progressRef);
            const now = Date.now();

            if (progressSnap.exists()) {
                const existingProgress = progressSnap.data() as LessonProgress;
                const completed = progress >= 100 || existingProgress.completed;

                // Update existing progress
                await updateDoc(progressRef, {
                    progress: Math.max(progress, existingProgress.progress || 0),
                    lastAccessedAt: now,
                    completed,
                    updatedAt: now
                });

                // Update local state
                dispatch({
                    type: 'SET_LESSON_PROGRESS',
                    payload: {
                        lessonId,
                        progress: {
                            ...existingProgress,
                            progress: Math.max(progress, existingProgress.progress || 0),
                            lastAccessedAt: now,
                            completed
                        }
                    }
                });
            } else {
                // Create new progress entry
                const completed = progress >= 100;
                const newProgress: LessonProgress = {
                    lessonId,
                    courseId,
                    userId,
                    progress,
                    completed,
                    lastAccessedAt: now,
                    totalTimeSpent: 0,
                    createdAt: now
                };

                await setDoc(progressRef, newProgress);

                // Update local state
                dispatch({
                    type: 'SET_LESSON_PROGRESS',
                    payload: { lessonId, progress: newProgress }
                });
            }
        } catch (error) {
            console.error(`Error updating progress for lesson ${lessonId}:`, error);
        }
    }, [user, db]);

    // Toggle lesson completion status
    const completeLessonToggle = useCallback(async (courseId: string, lessonId: string, completed: boolean) => {
        if (!user) {
            console.warn("Cannot update lesson completion: User not authenticated");
            return;
        }

        try {
            const userId = user.uid;
            const progressRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
            const now = Date.now();

            // Check if progress document exists
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
                const existingProgress = progressSnap.data() as LessonProgress;

                // Update completion status
                await updateDoc(progressRef, {
                    completed,
                    progress: completed ? 100 : existingProgress.progress,
                    lastAccessedAt: now,
                    updatedAt: now
                });

                // Update local state
                dispatch({
                    type: 'SET_LESSON_COMPLETED',
                    payload: { lessonId, completed }
                });
            } else {
                // Create new progress entry with completion status
                const newProgress: LessonProgress = {
                    lessonId,
                    courseId,
                    userId,
                    progress: completed ? 100 : 0,
                    completed,
                    lastAccessedAt: now,
                    totalTimeSpent: 0,
                    createdAt: now
                };

                await setDoc(progressRef, newProgress);

                // Update local state
                dispatch({
                    type: 'SET_LESSON_PROGRESS',
                    payload: { lessonId, progress: newProgress }
                });
            }

            // If lesson is completed, update course progress as well
            if (completed) {
                await updateUserCourseProgress(userId, courseId);
            }
        } catch (error) {
            console.error(`Error updating completion status for lesson ${lessonId}:`, error);
        }
    }, [user, db]);    // Update user course progress (internal helper)
    const updateUserCourseProgress = useCallback(async (userId: string, courseId: string) => {
        try {
            const courseProgressRef = doc(db, 'users', userId, 'courseProgress', courseId);
            await updateDoc(courseProgressRef, {
                lastAccessedAt: Date.now(),
                updatedAt: Date.now()
            });
        } catch (updateError) {
            // Course progress might not exist yet, create it
            console.log(`Course progress document not found, creating it for course ${courseId}:`, updateError instanceof Error ? updateError.message : updateError);
            try {
                const courseProgressRef = doc(db, 'users', userId, 'courseProgress', courseId);
                await setDoc(courseProgressRef, {
                    courseId,
                    userId,
                    lastAccessedAt: Date.now(),
                    createdAt: Date.now(),
                    completedLessons: arrayUnion() // Initialize empty array if it's a new document
                });
            } catch (innerError) {
                console.error(`Error creating course progress for course ${courseId}:`, innerError);
            }
        }
    }, [db]);// Get lesson progress
    const getLessonProgress = useCallback(async (courseId: string, lessonId: string): Promise<LessonProgress | null> => {
        // Check if progress is in state
        if (state.lessonProgress[lessonId]) {
            return state.lessonProgress[lessonId];
        }

        if (!user) {
            console.warn("Cannot get lesson progress: User not authenticated");
            return null;
        }

        try {
            const userId = user.uid;
            const progressRef = doc(db, 'users', userId, 'lessonProgress', lessonId);
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
                const progressData = progressSnap.data() as LessonProgress;

                // Update local state
                dispatch({
                    type: 'SET_LESSON_PROGRESS',
                    payload: { lessonId, progress: progressData }
                });

                return progressData;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching progress for lesson ${lessonId}:`, error);
            return null;
        }
    }, [user, db, state.lessonProgress]);

    // Context value
    const value: LessonsContextType = {
        state,
        getLessonsForCourse,
        getLesson,
        setActiveLesson,
        updateLessonProgress,
        completeLessonToggle,
        getLessonProgress
    };

    return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
};

// Export the hook
export { useLessonsContext };

// Export a combined hook for convenience
export function useLessons() {
    return useLessonsContext();
}

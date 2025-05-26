import React, { useReducer, useCallback, useEffect, ReactNode } from 'react';
import { createSafeContext, LoadingState } from './baseContext';
import { useAuth } from './authContext';
import { useCache } from '@/components/contexts/modules/cacheContext';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    getFirestore
} from 'firebase/firestore';
import { firebaseApp } from '../../../utils/firebase/firebase.config';

// Types
export interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    priceId: string;
    status: 'active' | 'draft' | 'archived';
    createdAt: number;
    updatedAt: number;
    instructorId: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // in minutes
    tags: string[];
    rating?: number;
    reviewCount?: number;
    enrollmentCount?: number; objectives?: string[];
    prerequisites?: string[];
    featured?: boolean;
    [key: string]: unknown;
}

// Define action types
type CoursesAction =
    | { type: 'SET_COURSES'; payload: Record<string, Course> }
    | { type: 'SET_COURSE'; payload: { id: string; course: Course } }
    | { type: 'SET_ACTIVE_COURSE'; payload: string | null }
    | { type: 'SET_LOADING_STATE'; payload: LoadingState }
    | { type: 'SET_COURSE_LOADING_STATE'; payload: { courseId: string; status: LoadingState } }
    | { type: 'SET_FEATURED_COURSES'; payload: string[] }
    | { type: 'SET_USER_COURSES'; payload: string[] };

// Courses state interface
interface CoursesState {
    courses: Record<string, Course>;
    activeCourseId: string | null;
    loadingState: LoadingState;
    courseLoadingStates: Record<string, LoadingState>;
    featuredCourses: string[];
    userCourses: string[];
}

// Initial state
const initialCoursesState: CoursesState = {
    courses: {},
    activeCourseId: null,
    loadingState: 'idle',
    courseLoadingStates: {},
    featuredCourses: [],
    userCourses: [],
};

// Courses reducer
function coursesReducer(state: CoursesState, action: CoursesAction): CoursesState {
    switch (action.type) {
        case 'SET_COURSES':
            return { ...state, courses: action.payload };
        case 'SET_COURSE':
            return {
                ...state,
                courses: {
                    ...state.courses,
                    [action.payload.id]: action.payload.course
                }
            };
        case 'SET_ACTIVE_COURSE':
            return { ...state, activeCourseId: action.payload };
        case 'SET_LOADING_STATE':
            return { ...state, loadingState: action.payload };
        case 'SET_COURSE_LOADING_STATE':
            return {
                ...state,
                courseLoadingStates: {
                    ...state.courseLoadingStates,
                    [action.payload.courseId]: action.payload.status
                }
            };
        case 'SET_FEATURED_COURSES':
            return { ...state, featuredCourses: action.payload };
        case 'SET_USER_COURSES':
            return { ...state, userCourses: action.payload };
        default:
            return state;
    }
}

// Courses context type
interface CoursesContextType {
    state: CoursesState;
    getAllCourses: () => void;
    getCourse: (courseId: string) => Promise<Course | null>;
    getFeaturedCourses: () => void;
    getUserCourses: () => void;
    setActiveCourse: (courseId: string | null) => void;
}

// Create the context
const [CoursesContext, useCoursesContext] = createSafeContext<CoursesContextType>('CoursesContext');

// Provider component
interface CoursesProviderProps {
    children: ReactNode;
}

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(coursesReducer, initialCoursesState);
    const { user } = useAuth(); const {
        generateCacheKey,
        isRequestPending,
        setRequestPending,
        getCachedData,
        setCachedData
    } = useCache();

    const db = getFirestore(firebaseApp);

    // Set active course
    const setActiveCourse = useCallback((courseId: string | null) => {
        dispatch({ type: 'SET_ACTIVE_COURSE', payload: courseId });
    }, []);    // Get all courses
    const getAllCourses = useCallback(async () => {
        // Check if we're already loading courses
        const cacheKey = generateCacheKey('allCourses', {});
        if (isRequestPending(cacheKey)) {
            return;
        }

        // Check if we have courses in state
        if (Object.keys(state.courses).length > 0 && state.loadingState === 'success') {
            return;
        }

        // Check cache
        const cachedData = getCachedData<Record<string, Course>>(cacheKey);
        if (cachedData) {
            dispatch({ type: 'SET_COURSES', payload: cachedData });
            dispatch({ type: 'SET_LOADING_STATE', payload: 'success' });
            return;
        }

        // Set loading state and mark request as pending
        dispatch({ type: 'SET_LOADING_STATE', payload: 'loading' });
        setRequestPending(cacheKey, true);

        try {
            const coursesQuery = query(
                collection(db, 'courses'),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(coursesQuery);
            const coursesData: Record<string, Course> = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data() as Course;
                data.id = doc.id;
                coursesData[doc.id] = data;
            }); dispatch({ type: 'SET_COURSES', payload: coursesData });
            dispatch({ type: 'SET_LOADING_STATE', payload: 'success' });

            // Cache the results
            setCachedData(cacheKey, coursesData);
        } catch (error) {
            console.error('Error fetching courses:', error);
            dispatch({ type: 'SET_LOADING_STATE', payload: 'error' });
        } finally {
            setRequestPending(cacheKey, false);
        }
    }, [db, state.courses, state.loadingState, generateCacheKey, isRequestPending, getCachedData, setCachedData, setRequestPending]);

    // Get a single course
    const getCourse = useCallback(async (courseId: string): Promise<Course | null> => {
        // Check if course is in state
        if (state.courses[courseId]) {
            return state.courses[courseId];
        }

        // Set loading state for this course
        dispatch({
            type: 'SET_COURSE_LOADING_STATE',
            payload: { courseId, status: 'loading' }
        });

        try {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseData = courseSnap.data() as Course;
                courseData.id = courseSnap.id;

                // Update state
                dispatch({
                    type: 'SET_COURSE',
                    payload: { id: courseId, course: courseData }
                });

                dispatch({
                    type: 'SET_COURSE_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                return courseData;
            } else {
                dispatch({
                    type: 'SET_COURSE_LOADING_STATE',
                    payload: { courseId, status: 'error' }
                });
                return null;
            }
        } catch (error) {
            console.error(`Error fetching course ${courseId}:`, error);
            dispatch({
                type: 'SET_COURSE_LOADING_STATE',
                payload: { courseId, status: 'error' }
            });
            return null;
        }
    }, [db, state.courses]);    // Get featured courses
    const getFeaturedCourses = useCallback(async () => {
        if (state.featuredCourses.length > 0) {
            return;
        }

        const cacheKey = generateCacheKey('featuredCourses', {});

        // Check cache
        const cachedData = getCachedData<string[]>(cacheKey);
        if (cachedData) {
            dispatch({ type: 'SET_FEATURED_COURSES', payload: cachedData });
            return;
        }

        try {
            const coursesQuery = query(
                collection(db, 'courses'),
                where('featured', '==', true),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(coursesQuery);
            const featuredCourseIds: string[] = [];
            const coursesData: Record<string, Course> = { ...state.courses };

            querySnapshot.forEach((doc) => {
                const data = doc.data() as Course;
                data.id = doc.id;
                coursesData[doc.id] = data;
                featuredCourseIds.push(doc.id);
            }); dispatch({ type: 'SET_COURSES', payload: coursesData });
            dispatch({ type: 'SET_FEATURED_COURSES', payload: featuredCourseIds });

            // Cache the results
            setCachedData(cacheKey, featuredCourseIds);
        } catch (error) {
            console.error('Error fetching featured courses:', error);
        }
    }, [db, state.courses, state.featuredCourses, generateCacheKey, getCachedData, setCachedData]);

    // Get user courses (courses the user has purchased)
    const getUserCourses = useCallback(async () => {
        if (!user || state.userCourses.length > 0) {
            return;
        } const cacheKey = generateCacheKey('userCourses', { uid: user.uid });

        // Check cache
        const cachedData = getCachedData<string[]>(cacheKey);
        if (cachedData) {
            dispatch({ type: 'SET_USER_COURSES', payload: cachedData });
            return;
        }

        try {
            // Query purchases collection for this user
            const userPurchasesQuery = query(
                collection(db, `customers/${user.uid}/payments`),
                where('status', '==', 'succeeded')
            );

            const paymentsSnapshot = await getDocs(userPurchasesQuery);
            const purchasedCourseIds = new Set<string>();

            paymentsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.metadata?.courseId) {
                    purchasedCourseIds.add(data.metadata.courseId);
                }
            });

            const userCourseIds = Array.from(purchasedCourseIds);
            dispatch({ type: 'SET_USER_COURSES', payload: userCourseIds });

            // Fetch details for each course if not already in state
            for (const courseId of userCourseIds) {
                if (!state.courses[courseId]) {
                    await getCourse(courseId);
                }
            }

            // Cache the results
            setCachedData(cacheKey, userCourseIds);
        } catch (error) {
            console.error('Error fetching user courses:', error);
        }
    }, [user, db, state.courses, state.userCourses, getCourse, generateCacheKey, getCachedData, setCachedData]);

    // Set up listeners when user changes
    useEffect(() => {
        if (user) {
            getUserCourses();
        } else {
            dispatch({ type: 'SET_USER_COURSES', payload: [] });
        }
    }, [user, getUserCourses]);

    // Context value
    const value: CoursesContextType = {
        state,
        getAllCourses,
        getCourse,
        getFeaturedCourses,
        getUserCourses,
        setActiveCourse
    };

    return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};

// Export the hook
export { useCoursesContext };

// Export a combined hook for convenience
export function useCourses() {
    return useCoursesContext();
}

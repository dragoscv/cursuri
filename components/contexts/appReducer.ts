// AppContext reducer and initial state
import { AppContextProps, UserLessonProgress, AdminSettings, CacheStatus } from '@/types';

export const initialState = {
    modals: [],
    products: [],
    isAdmin: false,
    courses: {},
    courseLoadingStates: {},
    lessons: {},
    lessonLoadingStates: {},
    userPaidProducts: [],
    reviews: {},
    reviewLoadingStates: {},
    lessonProgress: {},
    users: {},
    userLoadingState: 'idle' as CacheStatus,
    adminAnalytics: null,
    adminAnalyticsLoadingState: 'idle' as CacheStatus,
    adminSettings: null,
    adminSettingsLoadingState: 'idle' as CacheStatus,
    bookmarkedLessons: {},
    bookmarksLoadingState: 'idle' as CacheStatus,
    wishlistCourses: [],
    wishlistLoadingState: 'idle' as CacheStatus,
    pendingRequests: {} as Record<string, boolean>,
};

export function appReducer(state: any, action: any) {
    switch (action.type) {
        case 'ADD_MODAL': {
            const existingModalIndex = state.modals.findIndex((modal: any) => modal.id === action.payload.id);
            if (existingModalIndex !== -1) {
                return {
                    ...state,
                    modals: state.modals.map((modal: any, index: any) =>
                        index === existingModalIndex
                            ? { ...modal, ...action.payload, isOpen: true }
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
            return { ...state, products: action.payload };
        case 'SET_IS_ADMIN':
            return { ...state, isAdmin: action.payload };
        case 'INITIALIZE_COURSE_LESSONS':
            return {
                ...state,
                lessons: {
                    ...state.lessons,
                    [action.payload.courseId]: state.lessons[action.payload.courseId] || {}
                }
            };
        case 'SET_COURSES':
            return {
                ...state,
                courses: {
                    ...state.courses,
                    [action.payload.courseId]: action.payload.course
                }
            };
        case 'SET_COURSE_LOADING_STATE':
            return {
                ...state,
                courseLoadingStates: {
                    ...state.courseLoadingStates,
                    [action.payload.courseId]: action.payload.status
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
        case 'SET_LESSON_LOADING_STATE':
            return {
                ...state,
                lessonLoadingStates: {
                    ...state.lessonLoadingStates,
                    [action.payload.courseId]: {
                        ...state.lessonLoadingStates[action.payload.courseId],
                        [action.payload.lessonId]: action.payload.status
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
        case 'SET_REVIEW_LOADING_STATE':
            return {
                ...state,
                reviewLoadingStates: {
                    ...state.reviewLoadingStates,
                    [action.payload.courseId]: action.payload.status
                }
            };
        case 'SET_USER_PAID_PRODUCTS':
            return { ...state, userPaidProducts: action.payload };
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
        case 'SET_USERS':
            return { ...state, users: action.payload };
        case 'SET_USER_LOADING_STATE':
            return { ...state, userLoadingState: action.payload };
        case 'SET_ADMIN_ANALYTICS':
            return { ...state, adminAnalytics: action.payload };
        case 'SET_ADMIN_ANALYTICS_LOADING_STATE':
            return { ...state, adminAnalyticsLoadingState: action.payload };
        case 'SET_ADMIN_SETTINGS':
            return { ...state, adminSettings: action.payload };
        case 'SET_ADMIN_SETTINGS_LOADING_STATE':
            return { ...state, adminSettingsLoadingState: action.payload };
        case 'SET_BOOKMARKED_LESSONS':
            return {
                ...state,
                bookmarkedLessons: action.payload,
            };
        case 'SET_BOOKMARKS_LOADING_STATE':
            return { ...state, bookmarksLoadingState: action.payload };
        case 'TOGGLE_BOOKMARK_LESSON': {
            const { courseId, lessonId } = action.payload;
            const current = state.bookmarkedLessons?.[courseId] || [];
            const isBookmarked = current.includes(lessonId);
            return {
                ...state,
                bookmarkedLessons: {
                    ...state.bookmarkedLessons,
                    [courseId]: isBookmarked
                        ? current.filter((id: string) => id !== lessonId)
                        : [...current, lessonId],
                },
            };
        }
        case 'SET_WISHLIST_COURSES':
            return {
                ...state,
                wishlistCourses: action.payload,
            };
        case 'SET_WISHLIST_LOADING_STATE':
            return { ...state, wishlistLoadingState: action.payload };
        case 'ADD_TO_WISHLIST':
            return {
                ...state,
                wishlistCourses: state.wishlistCourses.includes(action.payload)
                    ? state.wishlistCourses
                    : [...state.wishlistCourses, action.payload],
            };
        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                wishlistCourses: state.wishlistCourses.filter((id: string) => id !== action.payload),
            };
        case 'SET_PENDING_REQUEST':
            return {
                ...state,
                pendingRequests: {
                    ...state.pendingRequests,
                    [action.payload.key]: action.payload.isPending
                }
            };
        case 'CLEAR_CACHE':
            if (action.payload) {
                // Clear specific cache
                const newState = { ...state };
                if (action.payload.startsWith('course_')) {
                    const courseId = action.payload.replace('course_', '');
                    if (newState.courses[courseId]) {
                        delete newState.courses[courseId];
                    }
                    if (newState.courseLoadingStates[courseId]) {
                        delete newState.courseLoadingStates[courseId];
                    }
                } else if (action.payload.startsWith('lessons_')) {
                    const courseId = action.payload.replace('lessons_', '');
                    if (newState.lessons[courseId]) {
                        delete newState.lessons[courseId];
                    }
                    if (newState.lessonLoadingStates[courseId]) {
                        delete newState.lessonLoadingStates[courseId];
                    }
                } else if (action.payload.startsWith('reviews_')) {
                    const courseId = action.payload.replace('reviews_', '');
                    if (newState.reviews[courseId]) {
                        delete newState.reviews[courseId];
                    }
                    if (newState.reviewLoadingStates[courseId]) {
                        delete newState.reviewLoadingStates[courseId];
                    }
                } else if (action.payload === 'users') {
                    newState.users = {};
                    newState.userLoadingState = 'idle';
                } else if (action.payload === 'adminAnalytics') {
                    newState.adminAnalytics = null;
                    newState.adminAnalyticsLoadingState = 'idle';
                } else if (action.payload === 'adminSettings') {
                    newState.adminSettings = null;
                    newState.adminSettingsLoadingState = 'idle';
                } else if (action.payload === 'bookmarks') {
                    newState.bookmarkedLessons = {};
                    newState.bookmarksLoadingState = 'idle';
                } else if (action.payload === 'wishlist') {
                    newState.wishlistCourses = [];
                    newState.wishlistLoadingState = 'idle';
                }
                return newState;
            } else {
                // Clear all cache
                return {
                    ...state,
                    courses: {},
                    courseLoadingStates: {},
                    lessons: {},
                    lessonLoadingStates: {},
                    reviews: {},
                    reviewLoadingStates: {},
                    users: {},
                    userLoadingState: 'idle',
                    adminAnalytics: null,
                    adminAnalyticsLoadingState: 'idle',
                    adminSettings: null,
                    adminSettingsLoadingState: 'idle',
                    pendingRequests: {}
                };
            }
        default:
            return state;
    }
}

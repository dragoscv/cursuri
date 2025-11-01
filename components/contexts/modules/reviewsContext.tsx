import React, { useReducer, useCallback, ReactNode } from 'react';
import { createSafeContext, LoadingState, CacheOptions } from './baseContext';
import { useCache } from '@/components/contexts/modules/cacheContext';
import { useAuth } from './authContext';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    getFirestore,
    setDoc,
    limit
} from 'firebase/firestore';
import { firebaseApp } from '../../../utils/firebase/firebase.config';

// Default cache options
const DEFAULT_CACHE_OPTIONS = {
    ttl: 5 * 60 * 1000, // 5 minutes
    persist: false,
    cacheKey: undefined
};

// Types
export interface Review {
    id: string;
    courseId: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    rating: number;
    comment: string;
    createdAt: number;
    updatedAt: number;
    status: 'pending' | 'approved' | 'rejected';
    likes?: number;
    helpful?: number;
    [key: string]: unknown;
}

// Define action types
type ReviewsAction =
    | { type: 'SET_REVIEWS'; payload: { courseId: string; reviewId: string; review: Review } }
    | { type: 'SET_REVIEWS_BATCH'; payload: { courseId: string; reviews: Record<string, Review> } }
    | { type: 'SET_REVIEW_LOADING_STATE'; payload: { courseId: string; status: LoadingState } }
    | { type: 'SET_USER_REVIEWS'; payload: Record<string, Review> }
    | { type: 'REMOVE_REVIEW'; payload: { courseId: string; reviewId: string } }
    | { type: 'INITIALIZE_COURSE_REVIEWS'; payload: { courseId: string } };

// Reviews state interface
interface ReviewsState {
    reviews: Record<string, Record<string, Review>>;
    reviewLoadingStates: Record<string, LoadingState>;
    userReviews: Record<string, Review>;
}

// Initial state
const initialReviewsState: ReviewsState = {
    reviews: {},
    reviewLoadingStates: {},
    userReviews: {},
};

// Reviews reducer
function reviewsReducer(state: ReviewsState, action: ReviewsAction): ReviewsState {
    switch (action.type) {
        case 'SET_REVIEWS':
            return {
                ...state,
                reviews: {
                    ...state.reviews,
                    [action.payload.courseId]: {
                        ...(state.reviews[action.payload.courseId] || {}),
                        [action.payload.reviewId]: action.payload.review
                    }
                }
            };
        case 'SET_REVIEWS_BATCH':
            return {
                ...state,
                reviews: {
                    ...state.reviews,
                    [action.payload.courseId]: {
                        ...(state.reviews[action.payload.courseId] || {}),
                        ...action.payload.reviews
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
        case 'SET_USER_REVIEWS':
            return {
                ...state,
                userReviews: {
                    ...state.userReviews,
                    ...action.payload
                }
            }; case 'REMOVE_REVIEW': {
                // Create a copy of the reviews for this course
                const courseReviews = { ...state.reviews[action.payload.courseId] };
                // Delete the specific review
                delete courseReviews[action.payload.reviewId];

                return {
                    ...state,
                    reviews: {
                        ...state.reviews,
                        [action.payload.courseId]: courseReviews
                    },
                    userReviews: Object.fromEntries(
                        Object.entries(state.userReviews).filter(
                            ([id]) => id !== action.payload.reviewId
                        )
                    )
                };
            }
        case 'INITIALIZE_COURSE_REVIEWS':
            if (!state.reviews[action.payload.courseId]) {
                return {
                    ...state,
                    reviews: {
                        ...state.reviews,
                        [action.payload.courseId]: {}
                    }
                };
            }
            return state;
        default:
            return state;
    }
}

// Reviews context type
interface ReviewsContextType {
    state: ReviewsState;
    getCourseReviews: (courseId: string, options?: CacheOptions) => void;
    getUserReviews: () => Promise<void>;
    getReview: (courseId: string, reviewId: string) => Promise<Review | null>;
    addReview: (courseId: string, rating: number, comment: string) => Promise<Review | null>;
    updateReview: (courseId: string, reviewId: string, updates: Partial<Review>) => Promise<boolean>;
    deleteReview: (courseId: string, reviewId: string) => Promise<boolean>;
    getFeaturedReviews: (limit?: number) => Promise<Review[]>;
}

// Create the context
const [ReviewsContext, useReviewsContext] = createSafeContext<ReviewsContextType>('ReviewsContext');

// Provider component
interface ReviewsProviderProps {
    children: ReactNode;
}

export const ReviewsProvider: React.FC<ReviewsProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reviewsReducer, initialReviewsState);
    const { user, isAdmin } = useAuth();
    const {
        generateCacheKey,
        isRequestPending,
        setRequestPending,
        getCachedData,
        setCachedData
    } = useCache();

    const db = getFirestore(firebaseApp);

    // Get reviews for a course
    const getCourseReviews = useCallback((courseId: string, options?: CacheOptions) => {
        const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
        const cacheKey = cacheOptions.cacheKey || generateCacheKey('reviews', { courseId });

        // Check if we're already loading this data
        if (isRequestPending(cacheKey)) {
            return;
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
            return;
        }        // Check if data is in localStorage cache
        if (cacheOptions.persist) {
            const cachedData = getCachedData<Record<string, Review>>(cacheKey);
            if (cachedData) {
                // Use cached data
                dispatch({
                    type: 'SET_REVIEWS_BATCH',
                    payload: { courseId, reviews: cachedData }
                });

                dispatch({
                    type: 'SET_REVIEW_LOADING_STATE',
                    payload: { courseId, status: 'success' }
                });

                return;
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
            const reviewsCollection = collection(db, `courses/${courseId}/reviews`);
            const reviewsQuery = query(
                reviewsCollection,
                where('status', '==', 'approved'),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(
                reviewsQuery,
                (querySnapshot) => {
                    const reviewsData: Record<string, Review> = {};

                    if (querySnapshot.size === 0) {
                        console.warn(`No reviews found for course: ${courseId}. This might be expected for new courses.`);

                        // Even with no reviews, we should set the loading state to success
                        dispatch({
                            type: 'SET_REVIEW_LOADING_STATE',
                            payload: { courseId, status: 'success' }
                        });

                        // Initialize an empty object for this course to track that we've loaded it
                        dispatch({
                            type: 'INITIALIZE_COURSE_REVIEWS',
                            payload: { courseId }
                        });
                    }

                    querySnapshot.forEach((doc) => {
                        const data = doc.data() as Review;
                        data.id = doc.id;
                        reviewsData[doc.id] = data;
                    });

                    // Update state with all reviews at once
                    dispatch({
                        type: 'SET_REVIEWS_BATCH',
                        payload: { courseId, reviews: reviewsData }
                    });

                    // Set loading state to success
                    dispatch({
                        type: 'SET_REVIEW_LOADING_STATE',
                        payload: { courseId, status: 'success' }
                    });                // Cache data if persist is enabled
                    if (cacheOptions.persist) {
                        setCachedData(cacheKey, reviewsData);
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
                            payload: { courseId, status: 'idle' }
                        });
                    } else {
                        console.error("Error in reviews listener:", error);
                        dispatch({
                            type: 'SET_REVIEW_LOADING_STATE',
                            payload: { courseId, status: 'error' }
                        });
                    }
                    setRequestPending(cacheKey, false);
                });

            // Return the unsubscribe function
            return unsubscribe;
        } catch (error) {
            console.error("Error setting up reviews listener:", error);
            // Set loading state to error
            dispatch({
                type: 'SET_REVIEW_LOADING_STATE',
                payload: { courseId, status: 'error' }
            });

            // Mark request as no longer pending
            setRequestPending(cacheKey, false);

            // Return a no-op cleanup function
            return () => { /* No cleanup needed after error */ };
        }
    }, [
        db,
        state.reviews,
        state.reviewLoadingStates,
        generateCacheKey,
        isRequestPending,
        setRequestPending,
        getCachedData,
        setCachedData
    ]);

    // Get a single review
    const getReview = useCallback(async (courseId: string, reviewId: string): Promise<Review | null> => {
        // Check if review is in state
        if (state.reviews[courseId]?.[reviewId]) {
            return state.reviews[courseId][reviewId];
        }

        try {
            const reviewRef = doc(db, `courses/${courseId}/reviews`, reviewId);
            const reviewSnap = await getDoc(reviewRef);

            if (reviewSnap.exists()) {
                const reviewData = reviewSnap.data() as Review;
                reviewData.id = reviewSnap.id;

                // Update state
                dispatch({
                    type: 'SET_REVIEWS',
                    payload: { courseId, reviewId, review: reviewData }
                });

                return reviewData;
            } else {
                console.warn(`Review ${reviewId} not found in course ${courseId}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching review ${reviewId} for course ${courseId}:`, error);
            return null;
        }
    }, [db, state.reviews]);    // Get all reviews by the current user
    const getUserReviews = useCallback(async () => {
        if (!user) {
            console.warn("Cannot get user reviews: User not authenticated");
            return;
        }

        const cacheKey = generateCacheKey('userReviews', { userId: user.uid });        // Check if data is in localStorage cache
        const cachedData = getCachedData<Record<string, Review>>(cacheKey);
        if (cachedData) {
            // Use cached data
            dispatch({
                type: 'SET_USER_REVIEWS',
                payload: cachedData
            });
            return;
        }

        try {
            // Query all reviews by user ID across all courses
            const reviewsRef = collection(db, 'userReviews');
            const q = query(reviewsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return;
            }

            const userReviews: Record<string, Review> = {};

            snapshot.forEach((doc) => {
                const data = doc.data() as Review;
                data.id = doc.id;
                userReviews[doc.id] = data;
            });

            dispatch({
                type: 'SET_USER_REVIEWS',
                payload: userReviews
            });            // Cache the results
            setCachedData(cacheKey, userReviews);
        } catch (error) {
            console.error("Error fetching user reviews:", error);
        }
    }, [
        user,
        db,
        generateCacheKey,
        getCachedData,
        setCachedData
    ]);    // Add a new review
    const addReview = useCallback(async (courseId: string, rating: number, comment: string): Promise<Review | null> => {
        if (!user) {
            console.warn("Cannot add review: User not authenticated");
            return null;
        }

        try {
            const newReview: Omit<Review, 'id'> = {
                courseId,
                userId: user.uid,
                userDisplayName: user.displayName || 'Anonymous',
                userPhotoURL: user.photoURL || undefined,
                rating,
                comment,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                status: 'pending', // Reviews start as pending and need approval
            };

            // Add to course reviews collection
            const reviewsRef = collection(db, `courses/${courseId}/reviews`);
            const docRef = await addDoc(reviewsRef, newReview);
            const newReviewWithId = { ...newReview, id: docRef.id } as Review;

            // Also add to user reviews collection for easier querying
            const userReviewRef = doc(db, 'userReviews', docRef.id);
            await setDoc(userReviewRef, newReviewWithId);

            // Update state
            dispatch({
                type: 'SET_REVIEWS',
                payload: { courseId, reviewId: docRef.id, review: newReviewWithId }
            });

            dispatch({
                type: 'SET_USER_REVIEWS',
                payload: { [docRef.id]: newReviewWithId }
            });

            return newReviewWithId;
        } catch (error) {
            console.error(`Error adding review for course ${courseId}:`, error);
            return null;
        }
    }, [user, db]);    // Update an existing review
    const updateReview = useCallback(async (courseId: string, reviewId: string, updates: Partial<Review>): Promise<boolean> => {
        if (!user) {
            console.warn("Cannot update review: User not authenticated");
            return false;
        }

        try {
            // Check if user is authorized to update this review
            const existingReview = await getReview(courseId, reviewId);

            if (!existingReview) {
                console.warn(`Review ${reviewId} not found`);
                return false;
            }

            if (existingReview.userId !== user.uid && !isAdmin) {
                console.warn("User not authorized to update this review");
                return false;
            }

            // Prepare update data
            const updateData = {
                ...updates,
                updatedAt: Date.now(),
                // Reset to pending if content changed and user is not an admin
                ...((!isAdmin && (updates.rating || updates.comment)) ? { status: 'pending' as const } : {})
            };

            // Update in course reviews collection
            const reviewRef = doc(db, `courses/${courseId}/reviews`, reviewId);
            await updateDoc(reviewRef, updateData);

            // Update in user reviews collection
            const userReviewRef = doc(db, 'userReviews', reviewId);
            await updateDoc(userReviewRef, updateData);

            // Update state
            const updatedReview = { ...existingReview, ...updateData };

            dispatch({
                type: 'SET_REVIEWS',
                payload: { courseId, reviewId, review: updatedReview }
            });

            dispatch({
                type: 'SET_USER_REVIEWS',
                payload: { [reviewId]: updatedReview }
            });

            return true;
        } catch (error) {
            console.error(`Error updating review ${reviewId}:`, error);
            return false;
        }
    }, [user, isAdmin, db, getReview]);    // Delete a review
    const deleteReview = useCallback(async (courseId: string, reviewId: string): Promise<boolean> => {
        if (!user) {
            console.warn("Cannot delete review: User not authenticated");
            return false;
        }

        try {
            // Check if user is authorized to delete this review
            const existingReview = await getReview(courseId, reviewId);

            if (!existingReview) {
                console.warn(`Review ${reviewId} not found`);
                return false;
            }

            if (existingReview.userId !== user.uid && !isAdmin) {
                console.warn("User not authorized to delete this review");
                return false;
            }

            // Delete from course reviews collection
            const reviewRef = doc(db, `courses/${courseId}/reviews`, reviewId);
            await deleteDoc(reviewRef);

            // Delete from user reviews collection
            const userReviewRef = doc(db, 'userReviews', reviewId);
            await deleteDoc(userReviewRef);

            // Update state
            dispatch({
                type: 'REMOVE_REVIEW',
                payload: { courseId, reviewId }
            });

            return true;
        } catch (error) {
            console.error(`Error deleting review ${reviewId}:`, error);
            return false;
        }
    }, [user, isAdmin, db, getReview]);

    // Get featured reviews (highest rated, approved)
    const getFeaturedReviews = useCallback(async (reviewLimit = 6): Promise<Review[]> => {
        const cacheKey = generateCacheKey('featuredReviews', {});

        // Check localStorage cache
        const cachedData = getCachedData<Review[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        try {
            // This is a global query across all courses to find featured reviews
            const reviewsRef = collection(db, 'userReviews');
            const q = query(
                reviewsRef,
                where('status', '==', 'approved'),
                where('rating', '>=', 4),
                orderBy('rating', 'desc'),
                orderBy('createdAt', 'desc'),
                limit(reviewLimit)
            );

            const snapshot = await getDocs(q);
            const featuredReviews: Review[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data() as Review;
                data.id = doc.id;
                featuredReviews.push(data);
            });

            // Cache the results
            setCachedData(cacheKey, featuredReviews);

            return featuredReviews;
        } catch (error) {
            console.error("Error fetching featured reviews:", error);
            return [];
        }
    }, [
        db,
        generateCacheKey,
        getCachedData,
        setCachedData
    ]);

    // Context value
    const value: ReviewsContextType = {
        state,
        getCourseReviews,
        getUserReviews,
        getReview,
        addReview,
        updateReview,
        deleteReview,
        getFeaturedReviews
    };

    return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
};

// Export the hook
export { useReviewsContext };

// Export a combined hook for convenience
export function useReviews() {
    return useReviewsContext();
}

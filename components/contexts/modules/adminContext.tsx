import React, { createContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { createSafeContext, LoadingState } from './baseContext';
import { useAuth } from './authContext';
import { useCache } from '@/components/contexts/modules/cacheContext';
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
    serverTimestamp,
    limit,
    startAfter,
    Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '../../../utils/firebase/firebase.config';

// Types
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: number;
    lastLoginAt: number;
    isAdmin: boolean;
    role: string;
    [key: string]: any;
}

export interface AdminStats {
    totalUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalRevenue: number;
    activeUsers: number;
    pendingReviews: number;
}

export interface PaginatedResult<T> {
    items: T[];
    lastDoc: any;
    hasMore: boolean;
}

// Define action types
type AdminAction =
    | { type: 'SET_USERS'; payload: Record<string, UserProfile> }
    | { type: 'SET_USER'; payload: { uid: string; user: UserProfile } }
    | { type: 'REMOVE_USER'; payload: string }
    | { type: 'SET_STATS'; payload: AdminStats }
    | { type: 'SET_LOADING_STATE'; payload: { resource: string; status: LoadingState } }
    | { type: 'SET_LAST_DOC'; payload: { resource: string; lastDoc: any } }
    | { type: 'SET_PENDING_REVIEWS_COUNT'; payload: number };

// Admin state interface
interface AdminState {
    users: Record<string, UserProfile>;
    stats: AdminStats | null;
    loadingStates: Record<string, LoadingState>;
    lastDocs: Record<string, any>;
    pendingReviewsCount: number;
}

// Initial state
const initialAdminState: AdminState = {
    users: {},
    stats: null,
    loadingStates: {},
    lastDocs: {},
    pendingReviewsCount: 0,
};

// Admin reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
    switch (action.type) {
        case 'SET_USERS':
            return {
                ...state,
                users: {
                    ...state.users,
                    ...action.payload
                }
            };
        case 'SET_USER':
            return {
                ...state,
                users: {
                    ...state.users,
                    [action.payload.uid]: action.payload.user
                }
            };
        case 'REMOVE_USER':
            const newUsers = { ...state.users };
            delete newUsers[action.payload];
            return {
                ...state,
                users: newUsers
            };
        case 'SET_STATS':
            return {
                ...state,
                stats: action.payload
            };
        case 'SET_LOADING_STATE':
            return {
                ...state,
                loadingStates: {
                    ...state.loadingStates,
                    [action.payload.resource]: action.payload.status
                }
            };
        case 'SET_LAST_DOC':
            return {
                ...state,
                lastDocs: {
                    ...state.lastDocs,
                    [action.payload.resource]: action.payload.lastDoc
                }
            };
        case 'SET_PENDING_REVIEWS_COUNT':
            return {
                ...state,
                pendingReviewsCount: action.payload
            };
        default:
            return state;
    }
}

// Admin context type
interface AdminContextType {
    state: AdminState;
    getUsers: (pageSize?: number, refresh?: boolean) => Promise<PaginatedResult<UserProfile>>;
    getUser: (uid: string) => Promise<UserProfile | null>;
    updateUser: (uid: string, data: Partial<UserProfile>) => Promise<boolean>;
    deleteUser: (uid: string) => Promise<boolean>;
    getAdminStats: () => Promise<AdminStats | null>;
    getPendingReviews: (pageSize?: number, refresh?: boolean) => Promise<any>;
    updateReviewStatus: (courseId: string, reviewId: string, status: 'approved' | 'rejected') => Promise<boolean>;
    uploadCourseImage: (courseId: string, file: File) => Promise<string>;
}

// Create the context
const [AdminContext, useAdminContext] = createSafeContext<AdminContextType>('AdminContext');

// Provider component
interface AdminProviderProps {
    children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(adminReducer, initialAdminState);
    const { user, isAdmin } = useAuth();
    const { generateCacheKey, getCachedData, setCachedData } = useCache();

    const db = getFirestore(firebaseApp);
    const storage = getStorage(firebaseApp);    // Check admin status on mount and when auth state changes
    useEffect(() => {
        if (!user || !isAdmin) {
            // Clear admin state if user is not an admin
            dispatch({ type: 'SET_USERS', payload: {} });
            dispatch({ type: 'SET_STATS', payload: null as any });
            dispatch({ type: 'SET_PENDING_REVIEWS_COUNT', payload: 0 });
            return;
        }

        if (isAdmin) {
            // Auto-refresh pending reviews count for admins
            const reviewsRef = collection(db, 'userReviews');
            const q = query(reviewsRef, where('status', '==', 'pending'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                dispatch({ type: 'SET_PENDING_REVIEWS_COUNT', payload: snapshot.size });
            });

            return unsubscribe;
        }

        // Explicit return for other cases
        return undefined;
    }, [user, isAdmin, db]);

    // Get users with pagination
    const getUsers = useCallback(async (pageSize = 20, refresh = false): Promise<PaginatedResult<UserProfile>> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return { items: [], lastDoc: null, hasMore: false };
        }

        dispatch({
            type: 'SET_LOADING_STATE',
            payload: { resource: 'users', status: 'loading' }
        });

        try {
            let q;
            let lastDoc = refresh ? null : state.lastDocs['users'];

            if (lastDoc) {
                q = query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(pageSize)
                );
            } else {
                q = query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    limit(pageSize)
                );
            }

            const querySnapshot = await getDocs(q);
            const usersData: Record<string, UserProfile> = {};
            const users: UserProfile[] = [];

            if (querySnapshot.empty) {
                dispatch({
                    type: 'SET_LOADING_STATE',
                    payload: { resource: 'users', status: 'success' }
                });

                return { items: [], lastDoc: lastDoc, hasMore: false };
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data() as UserProfile;
                data.uid = doc.id;
                usersData[doc.id] = data;
                users.push(data);
            });

            // Update state
            dispatch({ type: 'SET_USERS', payload: usersData });
            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'users', status: 'success' }
            });
            dispatch({
                type: 'SET_LAST_DOC',
                payload: { resource: 'users', lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] }
            });

            return {
                items: users,
                lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.size === pageSize
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'users', status: 'error' }
            });
            return { items: [], lastDoc: null, hasMore: false };
        }
    }, [user, isAdmin, db, state.lastDocs]);

    // Get a single user
    const getUser = useCallback(async (uid: string): Promise<UserProfile | null> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return null;
        }

        // Check if user is in state
        if (state.users[uid]) {
            return state.users[uid];
        }

        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data() as UserProfile;
                userData.uid = userSnap.id;

                // Update state
                dispatch({
                    type: 'SET_USER',
                    payload: { uid, user: userData }
                });

                return userData;
            } else {
                console.warn(`User ${uid} not found`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
            return null;
        }
    }, [user, isAdmin, db, state.users]);

    // Update a user
    const updateUser = useCallback(async (uid: string, data: Partial<UserProfile>): Promise<boolean> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return false;
        }

        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...data,
                updatedAt: Date.now()
            });

            // Update state if the user is already in state
            if (state.users[uid]) {
                const updatedUser = { ...state.users[uid], ...data, updatedAt: Date.now() };
                dispatch({
                    type: 'SET_USER',
                    payload: { uid, user: updatedUser }
                });
            }

            return true;
        } catch (error) {
            console.error(`Error updating user ${uid}:`, error);
            return false;
        }
    }, [user, isAdmin, db, state.users]);

    // Delete a user (admin function)
    const deleteUser = useCallback(async (uid: string): Promise<boolean> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return false;
        }

        // Note: This doesn't delete the Firebase Auth user, only the user record in Firestore
        // For a complete deletion, a Cloud Function would be needed to delete the Auth user as well
        try {
            const userRef = doc(db, 'users', uid);
            await deleteDoc(userRef);

            // Update state
            dispatch({
                type: 'REMOVE_USER',
                payload: uid
            });

            return true;
        } catch (error) {
            console.error(`Error deleting user ${uid}:`, error);
            return false;
        }
    }, [user, isAdmin, db]);

    // Get admin statistics
    const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return null;
        }

        // Check cache for stats
        const cacheKey = generateCacheKey('adminStats', {});
        const cachedData = getCachedData<AdminStats>(cacheKey);

        // Return cached data if available
        if (cachedData) {
            dispatch({ type: 'SET_STATS', payload: cachedData });
            return cachedData;
        }

        dispatch({
            type: 'SET_LOADING_STATE',
            payload: { resource: 'stats', status: 'loading' }
        });

        try {
            // We'll use a more efficient approach with a backend function or aggregated data
            // For now, we'll count collections or use aggregate queries where available

            // Count users
            const usersQuery = query(collection(db, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const totalUsers = usersSnapshot.size;

            // Count active users in the last 30 days
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const activeUsersQuery = query(
                collection(db, 'users'),
                where('lastLoginAt', '>=', thirtyDaysAgo)
            );
            const activeUsersSnapshot = await getDocs(activeUsersQuery);
            const activeUsers = activeUsersSnapshot.size;

            // Count courses
            const coursesQuery = query(collection(db, 'courses'));
            const coursesSnapshot = await getDocs(coursesQuery);
            const totalCourses = coursesSnapshot.size;

            // Count lessons (this could be expensive with many courses)
            let totalLessons = 0;
            for (const courseDoc of coursesSnapshot.docs) {
                const lessonsQuery = collection(db, `courses/${courseDoc.id}/lessons`);
                const lessonsSnapshot = await getDocs(lessonsQuery);
                totalLessons += lessonsSnapshot.size;
            }

            // Get pending reviews count
            const pendingReviewsQuery = query(
                collection(db, 'userReviews'),
                where('status', '==', 'pending')
            );
            const pendingReviewsSnapshot = await getDocs(pendingReviewsQuery);
            const pendingReviews = pendingReviewsSnapshot.size;

            // Calculate total revenue (simplified version)
            const paymentsQuery = query(
                collection(db, 'payments'),
                where('status', '==', 'succeeded')
            );
            const paymentsSnapshot = await getDocs(paymentsQuery);
            let totalRevenue = 0;
            paymentsSnapshot.forEach(doc => {
                const payment = doc.data();
                totalRevenue += payment.amount || 0;
            });

            const stats: AdminStats = {
                totalUsers,
                totalCourses,
                totalLessons,
                totalRevenue,
                activeUsers,
                pendingReviews
            };

            // Update state
            dispatch({ type: 'SET_STATS', payload: stats });
            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'stats', status: 'success' }
            });            // Cache the results (valid for 1 hour)
            setCachedData(cacheKey, stats, { persist: true });

            return stats;
        } catch (error) {
            console.error("Error getting admin stats:", error);
            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'stats', status: 'error' }
            });
            return null;
        }
    }, [user, isAdmin, db, generateCacheKey, getCachedData, setCachedData]);

    // Get pending reviews for approval
    const getPendingReviews = useCallback(async (pageSize = 20, refresh = false) => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return { items: [], lastDoc: null, hasMore: false };
        }

        dispatch({
            type: 'SET_LOADING_STATE',
            payload: { resource: 'pendingReviews', status: 'loading' }
        });

        try {
            let q;
            let lastDoc = refresh ? null : state.lastDocs['pendingReviews'];

            if (lastDoc) {
                q = query(
                    collection(db, 'userReviews'),
                    where('status', '==', 'pending'),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(pageSize)
                );
            } else {
                q = query(
                    collection(db, 'userReviews'),
                    where('status', '==', 'pending'),
                    orderBy('createdAt', 'desc'),
                    limit(pageSize)
                );
            }

            const querySnapshot = await getDocs(q);
            const reviews: any[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                reviews.push(data);
            });

            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'pendingReviews', status: 'success' }
            });

            if (!querySnapshot.empty) {
                dispatch({
                    type: 'SET_LAST_DOC',
                    payload: {
                        resource: 'pendingReviews',
                        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
                    }
                });
            }

            return {
                items: reviews,
                lastDoc: querySnapshot.empty ? null : querySnapshot.docs[querySnapshot.docs.length - 1],
                hasMore: querySnapshot.size === pageSize
            };
        } catch (error) {
            console.error("Error fetching pending reviews:", error);
            dispatch({
                type: 'SET_LOADING_STATE',
                payload: { resource: 'pendingReviews', status: 'error' }
            });
            return { items: [], lastDoc: null, hasMore: false };
        }
    }, [user, isAdmin, db, state.lastDocs]);

    // Update review status (approve or reject)
    const updateReviewStatus = useCallback(async (courseId: string, reviewId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            return false;
        }

        try {
            // Update in course reviews collection
            const reviewRef = doc(db, `courses/${courseId}/reviews`, reviewId);
            await updateDoc(reviewRef, {
                status,
                updatedAt: Date.now(),
                reviewedBy: user.uid,
                reviewedAt: Date.now()
            });

            // Update in user reviews collection
            const userReviewRef = doc(db, 'userReviews', reviewId);
            await updateDoc(userReviewRef, {
                status,
                updatedAt: Date.now(),
                reviewedBy: user.uid,
                reviewedAt: Date.now()
            });

            return true;
        } catch (error) {
            console.error(`Error updating review ${reviewId} status:`, error);
            return false;
        }
    }, [user, isAdmin, db]);

    // Upload course image
    const uploadCourseImage = useCallback(async (courseId: string, file: File): Promise<string> => {
        if (!user || !isAdmin) {
            console.error("Unauthorized access to admin function");
            throw new Error("Unauthorized access to admin function");
        }

        try {
            const fileRef = ref(storage, `courses/${courseId}/cover_${Date.now()}`);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);

            // Update course with new image URL
            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                imageUrl: downloadURL,
                updatedAt: Date.now()
            });

            return downloadURL;
        } catch (error) {
            console.error("Error uploading course image:", error);
            throw error;
        }
    }, [user, isAdmin, db, storage]);

    // Context value
    const value: AdminContextType = {
        state,
        getUsers,
        getUser,
        updateUser,
        deleteUser,
        getAdminStats,
        getPendingReviews,
        updateReviewStatus,
        uploadCourseImage
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

// Export the hook
export { useAdminContext };

// Export a combined hook for convenience
export function useAdmin() {
    return useAdminContext();
}


/**
 * Database Statistics Tracking Utility
 * Manages counters and statistics in Firestore
 */

import { doc, increment, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB } from './firebase/firebase.config';

// ============================================
// COURSE STATISTICS
// ============================================

/**
 * Increment course view count
 */
export async function incrementCourseViews(courseId: string): Promise<void> {
    try {
        const courseRef = doc(firestoreDB, 'courses', courseId);
        await updateDoc(courseRef, {
            viewCount: increment(1),
            lastViewedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to increment course views:', error);
    }
}

/**
 * Increment course enrollment count
 */
export async function incrementCourseEnrollments(courseId: string): Promise<void> {
    try {
        const courseRef = doc(firestoreDB, 'courses', courseId);
        await updateDoc(courseRef, {
            enrollmentCount: increment(1),
            lastEnrolledAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to increment course enrollments:', error);
    }
}

/**
 * Increment course completion count
 */
export async function incrementCourseCompletions(courseId: string): Promise<void> {
    try {
        const courseRef = doc(firestoreDB, 'courses', courseId);
        await updateDoc(courseRef, {
            completionCount: increment(1),
            lastCompletedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to increment course completions:', error);
    }
}

/**
 * Update course rating statistics
 */
export async function updateCourseRating(courseId: string, newRating: number): Promise<void> {
    try {
        const courseRef = doc(firestoreDB, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);

        if (courseDoc.exists()) {
            const data = courseDoc.data();
            const currentRating = data.rating || 0;
            const currentRatingCount = data.ratingCount || 0;

            // Calculate new average rating
            const totalRating = currentRating * currentRatingCount + newRating;
            const newRatingCount = currentRatingCount + 1;
            const newAverageRating = totalRating / newRatingCount;

            await updateDoc(courseRef, {
                rating: newAverageRating,
                ratingCount: newRatingCount,
                lastRatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Failed to update course rating:', error);
    }
}

// ============================================
// LESSON STATISTICS
// ============================================

/**
 * Increment lesson view count
 */
export async function incrementLessonViews(courseId: string, lessonId: string): Promise<void> {
    try {
        const lessonRef = doc(firestoreDB, 'courses', courseId, 'lessons', lessonId);
        await updateDoc(lessonRef, {
            viewCount: increment(1),
            lastViewedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to increment lesson views:', error);
    }
}

/**
 * Increment lesson completion count
 */
export async function incrementLessonCompletions(courseId: string, lessonId: string): Promise<void> {
    try {
        const lessonRef = doc(firestoreDB, 'courses', courseId, 'lessons', lessonId);
        await updateDoc(lessonRef, {
            completionCount: increment(1),
            lastCompletedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to increment lesson completions:', error);
    }
}

/**
 * Track video watch time
 */
export async function trackVideoWatchTime(
    courseId: string,
    lessonId: string,
    watchTimeSeconds: number
): Promise<void> {
    try {
        // Validate courseId and lessonId
        if (!courseId || !lessonId || courseId === 'lessons') {
            console.warn('Invalid courseId or lessonId for tracking watch time:', { courseId, lessonId });
            return;
        }
        
        const lessonRef = doc(firestoreDB, 'courses', courseId, 'lessons', lessonId);
        await updateDoc(lessonRef, {
            totalWatchTime: increment(watchTimeSeconds),
            watchCount: increment(1),
        });
    } catch (error) {
        console.error('Failed to track video watch time:', error);
    }
}

// ============================================
// USER STATISTICS
// ============================================

/**
 * Update user course progress
 */
export async function updateUserCourseProgress(
    userId: string,
    courseId: string,
    progress: number
): Promise<void> {
    try {
        const progressRef = doc(firestoreDB, 'users', userId, 'progress', courseId);
        await setDoc(
            progressRef,
            {
                progress,
                lastAccessedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Failed to update user course progress:', error);
    }
}

/**
 * Track user activity
 */
export async function trackUserActivity(
    userId: string,
    activityType: string,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        const activityRef = doc(firestoreDB, 'users', userId, 'activity', `${Date.now()}_${activityType}`);
        await setDoc(activityRef, {
            type: activityType,
            timestamp: serverTimestamp(),
            ...metadata,
        });
    } catch (error) {
        console.error('Failed to track user activity:', error);
    }
}

/**
 * Increment user course count
 */
export async function incrementUserCourseCount(userId: string): Promise<void> {
    try {
        const userRef = doc(firestoreDB, 'users', userId);
        await updateDoc(userRef, {
            enrolledCoursesCount: increment(1),
        });
    } catch (error) {
        console.error('Failed to increment user course count:', error);
    }
}

/**
 * Increment user completed courses count
 */
export async function incrementUserCompletedCourses(userId: string): Promise<void> {
    try {
        const userRef = doc(firestoreDB, 'users', userId);
        await updateDoc(userRef, {
            completedCoursesCount: increment(1),
        });
    } catch (error) {
        console.error('Failed to increment user completed courses:', error);
    }
}

// ============================================
// PLATFORM STATISTICS
// ============================================

/**
 * Track platform-wide statistics
 */
export async function updatePlatformStats(statType: string, incrementValue: number = 1): Promise<void> {
    try {
        const statsRef = doc(firestoreDB, 'analytics', 'platform_stats');
        await setDoc(
            statsRef,
            {
                [statType]: increment(incrementValue),
                lastUpdated: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Failed to update platform stats:', error);
    }
}

/**
 * Track daily active users
 */
export async function trackDailyActiveUser(userId: string): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const dauRef = doc(firestoreDB, 'analytics', 'daily_active_users', 'dates', today);

        await setDoc(
            dauRef,
            {
                users: {
                    [userId]: serverTimestamp(),
                },
                date: today,
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Failed to track daily active user:', error);
    }
}

// ============================================
// SEARCH STATISTICS
// ============================================

/**
 * Track search query
 */
export async function trackSearchQuery(query: string, resultsCount: number, userId?: string): Promise<void> {
    try {
        const searchRef = doc(firestoreDB, 'analytics', 'search_queries', 'queries', query.toLowerCase());

        await setDoc(
            searchRef,
            {
                query: query,
                searchCount: increment(1),
                totalResults: increment(resultsCount),
                lastSearched: serverTimestamp(),
                ...(userId && { lastSearchedBy: userId }),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Failed to track search query:', error);
    }
}

// ============================================
// SUBSCRIPTION STATISTICS
// ============================================

/**
 * Track subscription event
 */
export async function trackSubscriptionEvent(
    userId: string,
    eventType: 'subscribe' | 'cancel' | 'renew',
    planName: string,
    amount?: number
): Promise<void> {
    try {
        const eventRef = doc(firestoreDB, 'analytics', 'subscriptions', 'events', `${Date.now()}_${userId}`);

        await setDoc(eventRef, {
            userId,
            eventType,
            planName,
            amount,
            timestamp: serverTimestamp(),
        });

        // Update user subscription count
        const userRef = doc(firestoreDB, 'users', userId);
        if (eventType === 'subscribe') {
            await updateDoc(userRef, {
                hasActiveSubscription: true,
                subscriptionPlan: planName,
            });
        } else if (eventType === 'cancel') {
            await updateDoc(userRef, {
                hasActiveSubscription: false,
            });
        }
    } catch (error) {
        console.error('Failed to track subscription event:', error);
    }
}

// ============================================
// REVENUE STATISTICS
// ============================================

/**
 * Track revenue
 */
export async function trackRevenue(
    amount: number,
    currency: string,
    source: 'course' | 'subscription',
    sourceId: string
): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const revenueRef = doc(firestoreDB, 'analytics', 'revenue', 'daily', today);

        await setDoc(
            revenueRef,
            {
                date: today,
                [`total_${currency.toLowerCase()}`]: increment(amount),
                [`${source}_revenue_${currency.toLowerCase()}`]: increment(amount),
                transactionCount: increment(1),
                lastUpdated: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Failed to track revenue:', error);
    }
}

export default {
    incrementCourseViews,
    incrementCourseEnrollments,
    incrementCourseCompletions,
    updateCourseRating,
    incrementLessonViews,
    incrementLessonCompletions,
    trackVideoWatchTime,
    updateUserCourseProgress,
    trackUserActivity,
    incrementUserCourseCount,
    incrementUserCompletedCourses,
    updatePlatformStats,
    trackDailyActiveUser,
    trackSearchQuery,
    trackSubscriptionEvent,
    trackRevenue,
};

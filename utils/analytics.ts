/**
 * Firebase Analytics Utility
 * Comprehensive analytics tracking for StudiAI platform
 */

import { Analytics, getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { firebaseApp } from './firebase/firebase.config';

let analytics: Analytics | null = null;

/**
 * Initialize Firebase Analytics (client-side only)
 */
export const initAnalytics = (): Analytics | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!analytics) {
        try {
            analytics = getAnalytics(firebaseApp);
        } catch (error) {
            console.error('[Analytics] Failed to initialize Firebase Analytics:', error);
        }
    }

    return analytics;
};

/**
 * Log a custom analytics event
 */
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
    const analyticsInstance = initAnalytics();
    if (!analyticsInstance) {
        console.warn('[Analytics] Analytics not initialized, skipping event:', eventName);
        return;
    }

    try {
        logEvent(analyticsInstance, eventName, eventParams);
    } catch (error) {
        console.error('[Analytics] Failed to log analytics event:', eventName, error);
    }
};

// ============================================
// PAGE VIEW EVENTS
// ============================================

/**
 * Log page view
 */
export const logPageView = (pagePath: string, pageTitle: string) => {
    logAnalyticsEvent('page_view', {
        page_path: pagePath,
        page_title: pageTitle,
    });
};

// ============================================
// USER EVENTS
// ============================================

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string) => {
    const analyticsInstance = initAnalytics();
    if (!analyticsInstance) return;

    try {
        setUserId(analyticsInstance, userId);
    } catch (error) {
        console.error('Failed to set analytics user ID:', error);
    }
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
    const analyticsInstance = initAnalytics();
    if (!analyticsInstance) return;

    try {
        setUserProperties(analyticsInstance, properties);
    } catch (error) {
        console.error('Failed to set analytics user properties:', error);
    }
};

/**
 * Log user registration
 */
export const logUserRegistration = (method: string) => {
    logAnalyticsEvent('sign_up', {
        method,
    });
};

/**
 * Log user login
 */
export const logUserLogin = (method: string) => {
    logAnalyticsEvent('login', {
        method,
    });
};

/**
 * Log user logout
 */
export const logUserLogout = () => {
    logAnalyticsEvent('logout');
};

// ============================================
// COURSE EVENTS
// ============================================

/**
 * Log course view
 */
export const logCourseView = (courseId: string, courseName: string, category?: string) => {
    logAnalyticsEvent('view_item', {
        item_id: courseId,
        item_name: courseName,
        item_category: category || 'course',
    });
};

/**
 * Log course enrollment/purchase
 */
export const logCourseEnrollment = (courseId: string, courseName: string, price: number, currency: string = 'USD') => {
    logAnalyticsEvent('purchase', {
        transaction_id: `enrollment_${courseId}_${Date.now()}`,
        value: price,
        currency,
        items: [
            {
                item_id: courseId,
                item_name: courseName,
                item_category: 'course',
                price,
                quantity: 1,
            },
        ],
    });
};

/**
 * Log course purchase (GA4-compliant ecommerce event)
 * Should be called AFTER successful payment, not before
 */
export const logCoursePurchase = (
    courseId: string,
    courseName: string,
    price: number,
    currency: string = 'USD',
    transactionId: string
) => {
    console.log('[Analytics] Preparing course purchase event:', {
        courseId,
        courseName,
        price,
        currency,
        transactionId
    });

    logAnalyticsEvent('purchase', {
        transaction_id: transactionId,
        value: price,
        currency: currency.toUpperCase(),
        tax: 0,
        shipping: 0,
        items: [{
            item_id: courseId,
            item_name: courseName,
            item_category: 'course',
            price: price,
            quantity: 1,
        }],
        payment_type: 'one_time',
    });

    console.log('[Analytics] Course purchase event sent');
};

/**
 * Log course start
 */
export const logCourseStart = (courseId: string, courseName: string) => {
    logAnalyticsEvent('course_start', {
        course_id: courseId,
        course_name: courseName,
    });
};

/**
 * Log course completion
 */
export const logCourseCompletion = (courseId: string, courseName: string, completionPercentage: number) => {
    logAnalyticsEvent('course_completion', {
        course_id: courseId,
        course_name: courseName,
        completion_percentage: completionPercentage,
    });
};

/**
 * Log course rating
 */
export const logCourseRating = (courseId: string, courseName: string, rating: number, reviewText?: string) => {
    logAnalyticsEvent('course_rating', {
        course_id: courseId,
        course_name: courseName,
        rating,
        has_review: !!reviewText,
    });
};

/**
 * Log course share
 */
export const logCourseShare = (courseId: string, courseName: string, method: string) => {
    logAnalyticsEvent('share', {
        content_type: 'course',
        item_id: courseId,
        item_name: courseName,
        method,
    });
};

// ============================================
// LESSON EVENTS
// ============================================

/**
 * Log lesson view
 */
export const logLessonView = (lessonId: string, lessonName: string, courseId: string, courseName: string) => {
    logAnalyticsEvent('lesson_view', {
        lesson_id: lessonId,
        lesson_name: lessonName,
        course_id: courseId,
        course_name: courseName,
    });
};

/**
 * Log lesson completion
 */
export const logLessonCompletion = (lessonId: string, lessonName: string, courseId: string, duration: number) => {
    logAnalyticsEvent('lesson_completion', {
        lesson_id: lessonId,
        lesson_name: lessonName,
        course_id: courseId,
        duration_seconds: duration,
    });
};

/**
 * Log video play
 */
export const logVideoPlay = (lessonId: string, videoUrl: string, courseId: string) => {
    logAnalyticsEvent('video_play', {
        lesson_id: lessonId,
        video_url: videoUrl,
        course_id: courseId,
    });
};

/**
 * Log video progress
 */
export const logVideoProgress = (lessonId: string, progress: number, courseId: string) => {
    logAnalyticsEvent('video_progress', {
        lesson_id: lessonId,
        progress_percentage: progress,
        course_id: courseId,
    });
};

// ============================================
// SUBSCRIPTION EVENTS
// ============================================

/**
 * Log subscription view
 */
export const logSubscriptionView = (planName: string) => {
    logAnalyticsEvent('view_promotion', {
        promotion_name: planName,
        creative_name: 'subscription_plan',
    });
};

/**
 * Log subscription selection
 */
export const logSubscriptionSelection = (planName: string, price: number, interval: string) => {
    logAnalyticsEvent('select_promotion', {
        promotion_name: planName,
        price,
        interval,
    });
};

/**
 * Log subscription purchase
 * Follows GA4 ecommerce specification for purchase events
 */
export const logSubscriptionPurchase = (
    planName: string,
    price: number,
    currency: string = 'USD',
    interval: string,
    transactionId: string
) => {
    console.log('[Analytics] Preparing subscription purchase event:', {
        planName,
        price,
        currency,
        interval,
        transactionId
    });

    logAnalyticsEvent('purchase', {
        transaction_id: transactionId,
        value: price,
        currency: currency.toUpperCase(),
        tax: 0,
        shipping: 0,
        items: [
            {
                item_id: `subscription_${planName.toLowerCase().replace(/\s+/g, '_')}`,
                item_name: `${planName} Subscription`,
                item_category: 'subscription',
                item_variant: interval,
                price: price,
                quantity: 1,
            },
        ],
        // Additional subscription metadata
        subscription_interval: interval,
        payment_type: 'subscription',
    });

    console.log('[Analytics] Subscription purchase event sent');
};

/**
 * Log subscription cancellation
 */
export const logSubscriptionCancellation = (planName: string, reason?: string) => {
    logAnalyticsEvent('subscription_cancel', {
        plan_name: planName,
        cancellation_reason: reason,
    });
};

// ============================================
// SEARCH EVENTS
// ============================================

/**
 * Log search
 */
export const logSearch = (searchTerm: string, resultsCount: number) => {
    logAnalyticsEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount,
    });
};

/**
 * Log search result click
 */
export const logSearchResultClick = (searchTerm: string, courseId: string, position: number) => {
    logAnalyticsEvent('select_content', {
        content_type: 'course',
        item_id: courseId,
        search_term: searchTerm,
        position,
    });
};

// ============================================
// ENGAGEMENT EVENTS
// ============================================

/**
 * Log button click
 */
export const logButtonClick = (buttonName: string, location: string) => {
    logAnalyticsEvent('button_click', {
        button_name: buttonName,
        location,
    });
};

/**
 * Log form submission
 */
export const logFormSubmission = (formName: string, success: boolean) => {
    logAnalyticsEvent('form_submission', {
        form_name: formName,
        success,
    });
};

/**
 * Log download
 */
export const logDownload = (fileName: string, fileType: string) => {
    logAnalyticsEvent('download', {
        file_name: fileName,
        file_type: fileType,
    });
};

/**
 * Log certificate generation
 */
export const logCertificateGeneration = (courseId: string, courseName: string) => {
    logAnalyticsEvent('certificate_generation', {
        course_id: courseId,
        course_name: courseName,
    });
};

// ============================================
// ERROR EVENTS
// ============================================

/**
 * Log error
 */
export const logError = (errorMessage: string, errorCode?: string, fatal: boolean = false) => {
    logAnalyticsEvent('error', {
        error_message: errorMessage,
        error_code: errorCode,
        fatal,
    });
};

// ============================================
// ADMIN EVENTS
// ============================================

/**
 * Log admin action
 */
export const logAdminAction = (action: string, resourceType: string, resourceId?: string) => {
    logAnalyticsEvent('admin_action', {
        action,
        resource_type: resourceType,
        resource_id: resourceId,
    });
};

/**
 * Log content creation
 */
export const logContentCreation = (contentType: string, contentId: string, contentName: string) => {
    logAnalyticsEvent('content_creation', {
        content_type: contentType,
        content_id: contentId,
        content_name: contentName,
    });
};

/**
 * Log content update
 */
export const logContentUpdate = (contentType: string, contentId: string, changes: string[]) => {
    logAnalyticsEvent('content_update', {
        content_type: contentType,
        content_id: contentId,
        changes: changes.join(', '),
    });
};

/**
 * Log content deletion
 */
export const logContentDeletion = (contentType: string, contentId: string) => {
    logAnalyticsEvent('content_deletion', {
        content_type: contentType,
        content_id: contentId,
    });
};

// ============================================
// NAVIGATION EVENTS
// ============================================

/**
 * Log navigation
 */
export const logNavigation = (from: string, to: string, method: string = 'click') => {
    logAnalyticsEvent('navigation', {
        from,
        to,
        method,
    });
};

// ============================================
// SOCIAL EVENTS
// ============================================

/**
 * Log social interaction
 */
export const logSocialInteraction = (network: string, action: string, target: string) => {
    logAnalyticsEvent('social_interaction', {
        network,
        action,
        target,
    });
};

export default {
    initAnalytics,
    logAnalyticsEvent,
    logPageView,
    setAnalyticsUserId,
    setAnalyticsUserProperties,
    logUserRegistration,
    logUserLogin,
    logUserLogout,
    logCourseView,
    logCourseEnrollment,
    logCourseStart,
    logCourseCompletion,
    logCourseRating,
    logCourseShare,
    logLessonView,
    logLessonCompletion,
    logVideoPlay,
    logVideoProgress,
    logSubscriptionView,
    logSubscriptionSelection,
    logSubscriptionPurchase,
    logSubscriptionCancellation,
    logSearch,
    logSearchResultClick,
    logButtonClick,
    logFormSubmission,
    logDownload,
    logCertificateGeneration,
    logError,
    logAdminAction,
    logContentCreation,
    logContentUpdate,
    logContentDeletion,
    logNavigation,
    logSocialInteraction,
};

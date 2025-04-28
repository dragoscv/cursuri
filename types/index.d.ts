import { Timestamp, Unsubscribe } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ReactNode } from 'react';

// Toast related types
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';

export interface ToastProps {
    id: string;
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
    position?: ToastPosition;
    isClosable?: boolean;
    action?: () => void;
    actionLabel?: string;
    onClose?: () => void;
}

export interface Toast extends ToastProps {
    createdAt: number;
}

// Next.js 15 specific types
declare module 'next' {
    export interface PageProps {
        params?: any;
        searchParams?: Record<string, string | string[]>;
    }
}

// Alternative page params interface for our usage
export interface PageParams<T extends Record<string, string> = Record<string, string>> {
    params: T;
    searchParams?: Record<string, string | string[]>;
}

// Add TypeScript types for color schemes
export type ColorScheme = 'modern-purple' | 'black-white' | 'green-neon' | 'blue-ocean' | 'brown-sunset' | 'yellow-morning' | 'red-blood' | 'pink-candy';

// User preferences interface for storing settings in Firestore
export interface UserPreferences {
    // Theme settings
    isDark: boolean;
    colorScheme: ColorScheme;
    // Notification settings
    emailNotifications: boolean;
    courseUpdates: boolean;
    marketingEmails: boolean;
    // Language settings
    language: string;
    // Other user settings
    bio?: string;
    // Timestamp for when the preferences were last updated
    lastUpdated: Timestamp | Date;
}

export interface AppContextProps {
    isDark: boolean;
    toggleTheme: () => void;
    colorScheme: ColorScheme;
    setColorScheme: (scheme: ColorScheme) => void;
    userPreferences: UserPreferences | null;
    saveUserPreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
    user: User | null;
    authLoading: boolean;
    openModal: (modal: ModalProps) => void;
    closeModal: (id: string) => void;
    updateModal: (modal: Partial<ModalProps>) => void;
    products: any[];
    isAdmin: boolean;
    courses: Record<string, Course>;
    lessons: Record<string, Record<string, Lesson>>;
    getCourseLessons: (courseId: string) => Promise<Unsubscribe | void>;
    userPaidProducts: UserPaidProduct[];
    userPurchases?: Record<string, UserPaidProduct>; // Added missing property
    reviews: Record<string, Record<string, Review>>;
    getCourseReviews: (courseId: string) => Promise<Unsubscribe | void>;
    lessonProgress: Record<string, Record<string, UserLessonProgress>>;
    saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted?: boolean) => Promise<boolean | void>;
    markLessonComplete: (courseId: string, lessonId: string) => Promise<boolean | void>;
    // Admin-specific properties and functions
    users?: Record<string, UserProfile>;
    getAllUsers?: () => Promise<Record<string, UserProfile> | null>;
    assignCourseToUser?: (userId: string, courseId: string) => Promise<boolean>;
    adminAnalytics?: AdminAnalytics | null;
    getAdminAnalytics?: () => Promise<AdminAnalytics | null>;
    adminSettings?: AdminSettings | null;
    getAdminSettings?: () => Promise<AdminSettings | null>;
    updateAdminSettings?: (settings: Partial<AdminSettings>) => Promise<boolean>;
}

// For use with framer-motion inView
export interface MarginType {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
}

/**
 * Props for a modal component.
 */
export interface ModalProps {
    /** The ID of the modal. */
    id: string;
    /** Whether the modal is currently open or not. */
    isOpen: boolean;
    /** Function to call when the modal is closed. */
    onClose?: () => void;
    /** Whether to hide the close button or not. */
    hideCloseButton?: boolean;
    hideCloseIcon?: boolean;
    /** The backdrop to use for the modal. */
    backdrop?: 'blur' | 'opaque' | 'transparent';
    /** The size of the modal. */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** The scroll behavior of the modal. */
    scrollBehavior?: 'inside' | 'outside';
    /** Whether the modal can be dismissed or not. */
    isDismissable?: boolean;
    /** The header text for the modal. */
    modalHeader: string;
    /** The body content for the modal. */
    modalBody: ReactNode;
    /** Whether the header is disabled or not. */
    headerDisabled?: boolean;
    /** Whether the footer is disabled or not. */
    footerDisabled?: boolean;
    /** Function to call when the footer button is clicked. */
    footerButtonClick?: () => void;
    /** The text to display on the footer button. */
    footerButtonText?: string;
    /** Whether to replace the URL or not. */
    noReplaceURL?: boolean;
    /** Additional class names to apply to the modal. */
    classNames?: {};
    modalBottomComponent?: ReactNode;
    /** Course data when opening course-related modals */
    course?: Course;
}

/**
 * Interface for a resource.
 */
export interface Resource {
    /** The unique identifier of the resource. */
    id?: string;
    /** The name of the resource. */
    name?: string;
    /** The title of the resource. */
    title?: string;
    /** The URL of the resource. */
    url: string;
    /** The type of resource. */
    type?: 'link' | 'pdf' | 'video' | 'code' | 'other';
    /** Description of the resource. */
    description?: string;
}

/**
 * Interface for a lesson resource.
 * Extends Resource interface
 */
export interface LessonResource extends Resource { }

/**
 * Interface for a course.
 */
export interface Course {
    /** The unique identifier of the course. */
    id: string;
    /** The name of the course. */
    name: string;
    /** The description of the course. */
    description?: string;
    /** Full description with more details */
    fullDescription?: string;
    /** The difficulty level of the course. */
    difficulty?: string;
    /** The course level (beginner, intermediate, advanced) */
    level?: string;
    /** The duration of the course. */
    duration?: string;
    /** The URL of the course thumbnail/image. */
    imageUrl?: string;
    /** The price of the course. */
    price?: number;
    /** Original price before discount */
    originalPrice?: number;
    /** Whether the course is free */
    isFree?: boolean;
    /** Whether this is a limited time offer */
    limitedOffer?: boolean;
    /** Whether money back guarantee is offered */
    moneyBackGuarantee?: boolean;
    /** Number of lessons in the course */
    lessonsCount?: number;
    /** Whether the course offers a certificate */
    certificate?: boolean;
    /** Additional metadata for the course */
    metadata?: {
        certificateEnabled?: boolean;
        allowPromoCodes?: boolean;
        [key: string]: any;
    };
    certificate?: boolean;
    /** Whether the course has downloadable resources */
    downloadableResources?: boolean;
    /** The status of the course (e.g., 'active', 'draft'). */
    status?: string;
    /** The resources associated with the course. */
    resources?: Resource[];
    /** Repository URL for course materials */
    repoUrl?: string;
    /** Additional information about the course */
    additionalInfo?: string;
    /** The creation date of the course. */
    createdAt?: string | Date;
    /** The last update date of the course. */
    updatedAt?: string | Date;
    /** The instructor/author of the course. */
    instructor?: string | {
        name?: string;
        photoUrl?: string;
        bio?: string;
        title?: string;
    };
    /** Tags or categories for the course. */
    tags?: string[];
    /** Benefits of taking the course */
    benefits?: string[];
    /** Course requirements or prerequisites */
    requirements?: string[];
    /** Course modules or sections */
    modules?: CourseModule[];
    /** Course reviews */
    reviews?: Review[];
    /** The price product information from Stripe. */
    priceProduct?: {
        /** The prices for the course. */
        prices: {
            /** The amount in cents. */
            unit_amount: number;
            /** The currency code. */
            currency: string;
            /** The Stripe price ID. */
            id: string;
        }[];
        /** The Stripe product ID. */
        id: string;
    };
}

/**
 * Interface for a course module or section
 */
export interface CourseModule {
    id: string;
    title: string;
    description?: string;
    lessons?: string[]; // Array of lesson IDs
    lessonCount?: number; // Count of lessons in this module
    duration?: string; // Total duration of the module
}

/**
 * Define the LessonType enum to specify the type of lesson (video, text, etc.)
 */
export enum LessonType {
    VIDEO = 'video',
    TEXT = 'text',
    QUIZ = 'quiz',
    CODING = 'coding',
    EXERCISE = 'exercise'
}

/**
 * Define the Lesson interface that represents a lesson in a course
 */
export interface Lesson {
    id: string;
    name: string;
    description?: string;
    content?: string;
    file?: string;
    videoUrl?: string;
    thumbnail?: string;
    thumbnailUrl?: string; // Alternative property name for thumbnail
    order?: number;
    isFree?: boolean;
    duration?: string;
    moduleId?: string;
    courseId?: string;
    resources?: LessonResource[];
    captions?: Record<string, { url?: string, content?: string }>;
    type?: LessonType;
    isCompleted?: boolean;
    lastModified?: number;
    createdBy?: string;
    status?: string;
    hasQuiz?: boolean;
    isLocked?: boolean;
    estimatedTime?: string;
    title?: string; // Some components use title instead of name
    repoUrl?: string; // Repository URL for lesson materials
    transcription?: string; // Transcription of lesson content
}

/**
 * Interface for tracking a user's progress through a lesson
 */
export interface UserLessonProgress {
    /** The unique identifier of the lesson. */
    lessonId: string;
    /** The course ID the lesson belongs to. */
    courseId: string;
    /** The user ID. */
    userId: string;
    /** Whether the lesson has been completed by the user. */
    isCompleted: boolean;
    /** The last timestamp/position in the video where the user left off (in seconds). */
    lastPosition: number;
    /** When the progress was last updated. */
    lastUpdated: Date | string | Timestamp;
    /** Video progress percentage */
    videoProgress?: number;
    /** User notes for the lesson */
    notes?: string;
}

/**
 * Interface for a review author.
 */
export interface Author {
    /** The name of the review author. */
    name: string;
    /** The role or title of the review author. */
    role: string;
    /** The URL to the author's avatar/profile picture. */
    avatar: string;
}

/**
 * Interface for a review.
 */
export interface Review {
    /** The unique identifier of the review. */
    id: string | number;
    /** The course ID the review is for. */
    courseId?: string;
    /** The user ID who wrote the review. */
    userId?: string;
    /** The user's name who wrote the review. */
    userName?: string;
    /** The user's role or title. */
    userRole?: string;
    /** The author object with name, role, and avatar. */
    author?: Author;
    /** The rating given (typically 1-5). */
    rating: number;
    /** The review text content. */
    content: string;
    /** Alternative field for review content (for backward compatibility). */
    comment?: string;
    /** The course type or category. */
    courseType: string;
    /** The date the review was created. */
    createdAt?: string | Date;
    /** Additional properties that might be present. */
    [key: string]: any;
}

/**
 * Interface for a user's paid product/course.
 */
export interface UserPaidProduct {
    /** The unique identifier of the purchase. */
    id: string;
    /** The product ID that was purchased. */
    productId: string;
    /** Metadata associated with the purchase. */
    metadata: {
        /** The course ID that was purchased. */
        courseId: string;
        [key: string]: any;
    };
    /** The status of the purchase. */
    status?: string;
    /** The purchase date. */
    purchaseDate?: string | Date;
    /** The creation timestamp */
    created?: number;
}

/**
 * Interface for a course with its Stripe price product
 */
export interface CourseWithPriceProduct extends Course {
    priceProduct: {
        prices: {
            unit_amount: number;
            currency: string;
            id: string;
        }[];
        id: string;
    };
}

export interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

/**
 * Interface for a Q&A question in a lesson
 */
export interface Question {
    id: string;
    lessonId: string;
    courseId: string;
    userId: string;
    userName: string;
    userRole?: string;
    userAvatar?: string;
    title: string;
    content: string;
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    isResolved: boolean;
    answers: Answer[];
    likes: number;
    likedBy?: string[]; // Array of user IDs who liked the question
}

/**
 * Interface for an answer to a question
 */
export interface Answer {
    id: string;
    questionId: string;
    userId: string;
    userName: string;
    userRole?: string;
    userAvatar?: string;
    content: string;
    htmlContent?: string; // For rich text content
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    isAuthorOrAdmin: boolean;
    attachments?: Attachment[];
    likes: number;
    likedBy?: string[]; // Array of user IDs who liked the answer
}

/**
 * Interface for attachments to answers (images, videos, etc.)
 */
export interface Attachment {
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
}

/**
 * Interface for application user information
 * This extends the Firebase Auth User with additional data
 */
export interface UserProfile {
    /** The unique identifier of the user. */
    id: string;
    /** The user's email. */
    email: string;
    /** The user's display name. */
    displayName?: string;
    /** The user's profile photo URL. */
    photoURL?: string;
    /** The user's bio. */
    bio?: string;
    /** The user's role (e.g. 'user', 'admin', 'instructor'). */
    role?: string;
    /** When the user was created. */
    createdAt: Timestamp | Date;
    /** When the user was last updated. */
    updatedAt?: Timestamp | Date;
    /** Whether the user's email is verified. */
    emailVerified: boolean;
    /** Additional profile data. */
    metadata?: Record<string, any>;
    /** User's enrollment status in various courses */
    enrollments?: Record<string, {
        enrolledAt: Timestamp | Date;
        completedAt?: Timestamp | Date;
        status: 'active' | 'completed' | 'expired';
        source: 'purchase' | 'admin' | 'gift';
    }>;
}

/**
 * Interface for admin dashboard analytics data
 */
export interface AdminAnalytics {
    /** Total number of registered users. */
    totalUsers: number;
    /** Total number of courses. */
    totalCourses: number;
    /** Total number of lessons. */
    totalLessons: number;
    /** Total revenue. */
    totalRevenue: number;
    /** New users in the last 30 days. */
    newUsers: number;
    /** New sales in the last 30 days. */
    newSales: number;
    /** Monthly revenue breakdown. */
    monthlyRevenue: Record<string, number>;
    /** Popular courses by enrollment. */
    popularCourses: Array<{
        courseId: string;
        courseName: string;
        enrollments: number;
    }>;
}

/**
 * Interface for admin platform settings
 */
export interface AdminSettings {
    /** Site name. */
    siteName: string;
    /** Site description. */
    siteDescription: string;
    /** Default email for notifications. */
    contactEmail: string;
    /** Whether to allow user registration. */
    allowRegistration: boolean;
    /** Whether to allow social login. */
    allowSocialLogin: boolean;
    /** Payment processor status. */
    paymentProcessorEnabled: boolean;
    /** Tax rate for purchases. */
    taxRate: number;
    /** Currency code. */
    currencyCode: string;
}

/**
 * Lesson Settings Props interface
 */
export interface LessonSettingsProps {
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    autoPlayNext: boolean;
    saveProgress: boolean;
    setAutoPlayNext: React.Dispatch<React.SetStateAction<boolean>>;
    setSaveProgress: React.Dispatch<React.SetStateAction<boolean>>;
    saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted?: boolean) => Promise<boolean | void>;
    markLessonComplete: (courseId: string, lessonId: string) => Promise<boolean | void>;
}

/**
 * QA Props interface for Lesson QA section
 */
export interface QAProps {
    courseId: string;
    lessonId: string;
}

// Other existing types...
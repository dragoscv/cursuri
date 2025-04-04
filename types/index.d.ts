import { User } from 'firebase/auth';
import { ReactNode } from 'react';

export interface AppContextProps {
    isDark: boolean;
    toggleTheme: () => void;
    user: User | null;
    openModal: (modal: ModalProps) => void;
    closeModal: (id: string) => void;
    updateModal: (modal: string, props: ModalProps) => void;
    products: any[];
    isAdmin: boolean;
    courses: Record<string, Course>;
    lessons: Record<string, Record<string, Lesson>>;
    getCourseLessons: (courseId: string) => Promise<void>;
    userPaidProducts: UserPaidProduct[];
    reviews: Record<string, Record<string, Review>>;
    getCourseReviews: (courseId: string) => Promise<void>;
    lessonProgress: Record<string, Record<string, UserLessonProgress>>;
    saveLessonProgress: (courseId: string, lessonId: string, position: number, isCompleted?: boolean) => Promise<boolean | void>;
    markLessonComplete: (courseId: string, lessonId: string) => Promise<boolean | void>;
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
 * Interface for a course resource.
 */
export interface Resource {
    /** The name of the resource. */
    name: string;
    /** The URL of the resource. */
    url: string;
}

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
    /** The difficulty level of the course. */
    difficulty?: string;
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
    /** Whether the course has downloadable resources */
    downloadableResources?: boolean;
    /** The status of the course (e.g., 'active', 'draft'). */
    status?: string;
    /** The resources associated with the course. */
    resources?: Resource[];
    /** The creation date of the course. */
    createdAt?: string | Date;
    /** The last update date of the course. */
    updatedAt?: string | Date;
    /** The instructor/author of the course. */
    instructor?: string;
    /** Tags or categories for the course. */
    tags?: string[];
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
 * Interface for a lesson within a course.
 */
export interface Lesson {
    /** The unique identifier of the lesson. */
    id: string;
    /** The course ID the lesson belongs to. */
    courseId?: string;
    /** The name/title of the lesson. */
    name: string;
    /** The description of the lesson. */
    description?: string;
    /** The file URL for the lesson video/content. */
    file: string;
    /** HTML content for the lesson. */
    content?: string;
    /** Whether the lesson has a quiz. */
    hasQuiz?: boolean;
    /** The resources associated with the lesson. */
    resources?: Resource[];
    /** The order/position of the lesson within the course. */
    order?: number;
    /** The duration of the lesson. */
    duration?: string;
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
    lastUpdated: Date | string;
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
}
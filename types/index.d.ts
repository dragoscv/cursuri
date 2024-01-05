import { User } from 'firebase/auth';

export interface AppContextProps {
    isDark: boolean;
    toggleTheme: () => void;
    user: User | null;
    openModal: (modal: ModalProps) => void;
    closeModal: (id: string) => void;
    updateModal: (modal: string, props: ModalProps) => void;
    products: any[];
    isAdmin: boolean;
    courses: any[];
    lessons: any[];
    getCourseLessons: (courseId: string) => Promise<void>;
    userPaidProducts: any[];
    reviews: any[];
    getCourseReviews: (courseId: string) => Promise<void>;
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
}
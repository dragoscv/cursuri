'use client'

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ToastType, ToastPosition } from '@/types';

// Toast interface
interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    position?: ToastPosition;
    persistent?: boolean;
}

interface ToastState {
    toasts: Toast[];
    error: string | null;
}

// Toast action types
type ToastAction =
    | { type: 'ADD_TOAST'; payload: Toast }
    | { type: 'REMOVE_TOAST'; payload: string }
    | { type: 'CLEAR_ALL_TOASTS' }
    | { type: 'SET_ERROR'; payload: string | null };

// Toast reducer
const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
    switch (action.type) {
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [...state.toasts, action.payload]
            };
        case 'REMOVE_TOAST':
            return {
                ...state,
                toasts: state.toasts.filter(toast => toast.id !== action.payload)
            };
        case 'CLEAR_ALL_TOASTS':
            return { ...state, toasts: [] };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

// Initial toast state
const initialToastState: ToastState = {
    toasts: [],
    error: null
};

// Toast context interface
interface ToastContextType {
    // State
    toasts: Toast[];
    error: string | null;

    // Toast methods
    showToast: (message: string, type?: ToastType, options?: Partial<Toast>) => void;
    showSuccess: (message: string, options?: Partial<Toast>) => void;
    showError: (message: string, options?: Partial<Toast>) => void;
    showWarning: (message: string, options?: Partial<Toast>) => void;
    showInfo: (message: string, options?: Partial<Toast>) => void;
    removeToast: (toastId: string) => void;
    clearAllToasts: () => void;
    clearError: () => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Custom hook to use toast context
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast provider props
interface ToastProviderProps {
    children: ReactNode;
}

// Generate unique ID for toasts
const generateToastId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Toast provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(toastReducer, initialToastState);

    // Show toast
    const showToast = useCallback((
        message: string,
        type: ToastType = 'info',
        options?: Partial<Toast>
    ) => {
        try {
            const toast: Toast = {
                id: generateToastId(),
                message,
                type,
                duration: 5000,
                position: 'top-right',
                persistent: false,
                ...options
            };

            dispatch({ type: 'ADD_TOAST', payload: toast });

            // Auto-remove toast if not persistent
            if (!toast.persistent && toast.duration && toast.duration > 0) {
                setTimeout(() => {
                    removeToast(toast.id);
                }, toast.duration);
            }

            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error showing toast:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to show toast' });
        }
    }, []);

    // Show success toast
    const showSuccess = useCallback((message: string, options?: Partial<Toast>) => {
        showToast(message, 'success', options);
    }, [showToast]);

    // Show error toast
    const showError = useCallback((message: string, options?: Partial<Toast>) => {
        showToast(message, 'error', { ...options, duration: 8000 }); // Longer duration for errors
    }, [showToast]);

    // Show warning toast
    const showWarning = useCallback((message: string, options?: Partial<Toast>) => {
        showToast(message, 'warning', options);
    }, [showToast]);

    // Show info toast
    const showInfo = useCallback((message: string, options?: Partial<Toast>) => {
        showToast(message, 'info', options);
    }, [showToast]);

    // Remove toast
    const removeToast = useCallback((toastId: string) => {
        try {
            dispatch({ type: 'REMOVE_TOAST', payload: toastId });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error removing toast:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to remove toast' });
        }
    }, []);

    // Clear all toasts
    const clearAllToasts = useCallback(() => {
        try {
            dispatch({ type: 'CLEAR_ALL_TOASTS' });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error clearing all toasts:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to clear all toasts' });
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);

    // Context value
    const value: ToastContextType = {
        // State
        toasts: state.toasts,
        error: state.error,

        // Toast methods
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        clearAllToasts,
        clearError
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

export default ToastContext;
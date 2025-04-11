'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from '@/components/icons/FeatherIcons';

// Toast Types
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

// Toast Context Interface
interface ToastContextProps {
  showToast: (props: Omit<ToastProps, 'id'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
  updateToast: (id: string, props: Partial<ToastProps>) => void;
}

// Create Context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Toast Component
const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  // Toast icon based on type
  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-[color:var(--ai-success, #10b981)]" size={18} />;
      case 'warning':
        return <FiAlertTriangle className="text-[color:var(--ai-warning, #f59e0b)]" size={18} />;
      case 'error':
        return <FiAlertCircle className="text-[color:var(--ai-error, #ef4444)]" size={18} />;
      case 'info':
      default:
        return <FiInfo className="text-[color:var(--ai-primary)]" size={18} />;
    }
  };

  // Toast background color based on type
  const getToastBgClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-[color:var(--ai-success, #10b981)]/10 border-[color:var(--ai-success, #10b981)]/30';
      case 'warning':
        return 'bg-[color:var(--ai-warning, #f59e0b)]/10 border-[color:var(--ai-warning, #f59e0b)]/30';
      case 'error':
        return 'bg-[color:var(--ai-error, #ef4444)]/10 border-[color:var(--ai-error, #ef4444)]/30';
      case 'info':
      default:
        return 'bg-[color:var(--ai-primary)]/10 border-[color:var(--ai-primary)]/30';
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-lg shadow-lg backdrop-blur-sm border ${getToastBgClass(toast.type)} p-4 flex gap-3 items-start`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toast.type)}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-[color:var(--ai-foreground)]">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-[color:var(--ai-foreground)] opacity-90">
          {toast.message}
        </p>

        {toast.action && toast.actionLabel && (
          <button
            onClick={toast.action}
            className="mt-2 text-xs font-medium text-[color:var(--ai-primary)] hover:text-[color:var(--ai-secondary)] transition-colors"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>

      {toast.isClosable !== false && (
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 rounded-full p-1 hover:bg-[color:var(--ai-card-border)]/30 transition-colors"
          aria-label="Close notification"
        >
          <FiX size={16} className="text-[color:var(--ai-foreground)] opacity-60" />
        </button>
      )}
    </motion.div>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'bottom-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, Toast[]>);

  // Get the CSS class for the toast position
  const getPositionClass = (position: ToastPosition): string => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-[9999] flex flex-col gap-2 min-w-[300px] max-w-md ${getPositionClass(position as ToastPosition)}`}
        >
          <AnimatePresence>
            {positionToasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((props: Omit<ToastProps, 'id'>): string => {
    const id = crypto.randomUUID();
    const toast: Toast = {
      id,
      type: props.type || 'info',
      title: props.title,
      message: props.message,
      duration: props.duration || 5000,
      position: props.position || 'bottom-right',
      isClosable: props.isClosable !== false,
      action: props.action,
      actionLabel: props.actionLabel,
      onClose: props.onClose,
      createdAt: Date.now(),
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss toast after duration if provided
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast && toast.onClose) {
        toast.onClose();
      }
      return prev.filter(toast => toast.id !== id);
    });
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, props: Partial<ToastProps>) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...props } : toast
    ));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast functionality
export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Default export for direct importing
export default ToastProvider;

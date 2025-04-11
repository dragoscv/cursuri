'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast, ToastPosition } from '@/types';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from '@/components/icons/FeatherIcons';

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

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

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'bottom-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, Toast[]>);

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

  // Animation variants for toasts
  const getAnimationVariants = (position: ToastPosition) => {
    // Determine if the toast enters from top or bottom
    const isTop = position.startsWith('top');

    return {
      initial: { opacity: 0, y: isTop ? -20 : 20 },
      animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
      exit: { opacity: 0, x: 100, transition: { duration: 0.2 } }
    };
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
              <motion.div
                key={toast.id}
                layout
                className={`rounded-lg shadow-lg backdrop-blur-sm border ${getToastBgClass(toast.type)} p-4 flex gap-3 items-start`}
                variants={getAnimationVariants(position as ToastPosition)}
                initial="initial"
                animate="animate"
                exit="exit"
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
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

export default ToastContainer;

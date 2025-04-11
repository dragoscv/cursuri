'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps, ToastType } from '@/types';
import ToastContainer from './ToastContainer';

interface ToastContextProps {
  showToast: (props: Omit<ToastProps, 'id'>) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
  updateToast: (id: string, props: Partial<ToastProps>) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export both the provider and the hook
export { ToastProvider, useToast };

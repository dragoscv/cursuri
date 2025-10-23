'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Modal state interface
export interface ModalProps {
  id: string;
  isOpen: boolean;
  modalBody: React.ReactNode | string;
  hideCloseIcon?: boolean;
  hideCloseButton?: boolean;
  backdrop?: 'blur' | 'opaque' | 'transparent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  scrollBehavior?: 'inside' | 'outside';
  isDismissable?: boolean;
  modalHeader?: string | React.ReactNode;
  headerDisabled?: boolean;
  footerDisabled?: boolean;
  footerButtonText?: string | null;
  footerButtonClick?: (() => void) | null;
  modalBottomComponent?: React.ReactNode | null;
  noReplaceURL?: boolean;
  classNames?: {
    backdrop?: string;
    base?: string;
    [key: string]: string | undefined;
  };
  onClose?: () => void;
}

interface ModalState {
  modals: ModalProps[];
  error: string | null;
}

// Modal action types
type ModalAction =
  | { type: 'OPEN_MODAL'; payload: ModalProps }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'UPDATE_MODAL'; payload: Partial<ModalProps> & { id: string } }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'SET_ERROR'; payload: string | null };

// Modal reducer
const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'OPEN_MODAL': {
      // Check if modal with same ID already exists
      const existingIndex = state.modals.findIndex((modal) => modal.id === action.payload.id);
      if (existingIndex >= 0) {
        // Replace existing modal
        const newModals = [...state.modals];
        newModals[existingIndex] = action.payload;
        return { ...state, modals: newModals };
      } else {
        // Add new modal
        return { ...state, modals: [...state.modals, action.payload] };
      }
    }
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: state.modals.filter((modal) => modal.id !== action.payload),
      };
    case 'UPDATE_MODAL':
      return {
        ...state,
        modals: state.modals.map((modal) =>
          modal.id === action.payload.id ? { ...modal, ...action.payload } : modal
        ),
      };
    case 'CLOSE_ALL_MODALS':
      return { ...state, modals: [] };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Initial modal state
const initialModalState: ModalState = {
  modals: [],
  error: null,
};

// Modal context interface
interface ModalContextType {
  // State
  modals: ModalProps[];
  error: string | null;

  // Modal methods
  openModal: (modalProps: ModalProps) => void;
  closeModal: (modalId: string) => void;
  updateModal: (updates: Partial<ModalProps> & { id: string }) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  clearError: () => void;
}

// Create context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Custom hook to use modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Modal provider props
interface ModalProviderProps {
  children: ReactNode;
}

// Modal provider component
export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialModalState);

  // Open modal
  const openModal = useCallback((modalProps: ModalProps) => {
    try {
      // Set default values
      const modalWithDefaults: ModalProps = {
        hideCloseIcon: false,
        hideCloseButton: false,
        backdrop: 'blur',
        size: 'md',
        scrollBehavior: 'inside',
        isDismissable: true,
        headerDisabled: false,
        footerDisabled: true,
        footerButtonText: null,
        footerButtonClick: null,
        modalBottomComponent: null,
        noReplaceURL: false,
        onClose: () => closeModal(modalProps.id),
        ...modalProps,
      };

      dispatch({ type: 'OPEN_MODAL', payload: modalWithDefaults });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error opening modal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to open modal' });
    }
  }, []);

  // Close modal
  const closeModal = useCallback((modalId: string) => {
    try {
      dispatch({ type: 'CLOSE_MODAL', payload: modalId });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error closing modal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to close modal' });
    }
  }, []);

  // Update modal
  const updateModal = useCallback((updates: Partial<ModalProps> & { id: string }) => {
    try {
      dispatch({ type: 'UPDATE_MODAL', payload: updates });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating modal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update modal' });
    }
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    try {
      dispatch({ type: 'CLOSE_ALL_MODALS' });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error closing all modals:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to close all modals' });
    }
  }, []);

  // Check if modal is open
  const isModalOpen = useCallback(
    (modalId: string): boolean => {
      return state.modals.some((modal) => modal.id === modalId && modal.isOpen);
    },
    [state.modals]
  );

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Context value
  const value: ModalContextType = {
    // State
    modals: state.modals,
    error: state.error,

    // Modal methods
    openModal,
    closeModal,
    updateModal,
    closeAllModals,
    isModalOpen,
    clearError,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export default ModalContext;

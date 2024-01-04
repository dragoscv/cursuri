

import React, { createContext, useState, useEffect, useReducer, useCallback } from 'react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import { onAuthStateChanged, User } from 'firebase/auth';
import ModalComponent from '@/components/Modal';

import { AppContextProps } from '@/types';

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const initialState = {
        modals: [],
    };

    const reducer = (state: any, action: any) => {
        switch (action.type) {
            case 'ADD_MODAL': {
                const existingModalIndex = state.modals.findIndex((modal: any) => modal.id === action.payload.id);
                if (existingModalIndex !== -1) {
                    // Modal with the specified id already exists. Update its properties.
                    return {
                        ...state,
                        modals: state.modals.map((modal: any, index: any) =>
                            index === existingModalIndex
                                ? {
                                    ...modal,
                                    isOpen: true,
                                    size: action.payload.size,
                                    scrollBehavior: action.payload.scrollBehavior,
                                    isDismissable: action.payload.isDismissable,
                                    backdrop: action.payload.backdrop,
                                    hideCloseButton: action.payload.hideCloseButton,
                                    hideCloseIcon: action.payload.hideCloseIcon,
                                    modalBody: action.payload.modalBody,
                                    headerDisabled: action.payload.headerDisabled,
                                    modalHeader: action.payload.modalHeader,
                                    footerDisabled: action.payload.footerDisabled,
                                    footerButtonText: action.payload.footerButtonText,
                                    footerButtonClick: action.payload.footerButtonClick,
                                    noReplaceURL: action.payload.noReplaceURL,
                                    modalBottomComponent: action.payload.modalBottomComponent,
                                }
                                : modal
                        ),
                    };
                } else {
                    // Modal with the specified id does not exist. Add the new modal to the modalProps array.
                    return { ...state, modals: [...state.modals, action.payload] };
                }
            }
            case 'CLOSE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload
                            ? { ...modal, isOpen: false }
                            : modal
                    )
                };
            case 'UPDATE_MODAL':
                return {
                    ...state,
                    modals: state.modals.map((modal: any) =>
                        modal.id === action.payload.id
                            ? { ...modal, ...action.payload }
                            : modal
                    )
                };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // This code sets the modal props for the modal component.
    const openModal = useCallback((props: any) => {
        dispatch({ type: 'ADD_MODAL', payload: props });
    }, [dispatch]);

    const closeModal = useCallback((id: string) => {
        dispatch({ type: 'CLOSE_MODAL', payload: id });
    }, [dispatch]);

    const updateModal = useCallback((props: any) => {
        dispatch({ type: 'UPDATE_MODAL', payload: props });
    }, [dispatch]);

    useEffect(() => {
        onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                console.log('user', user);
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

    return (
        <AppContext.Provider value={{
            isDark, toggleTheme,
            user,
            openModal, closeModal, updateModal
        }}>
            {children}
            {state.modals.map((modal: any) => (
                <ModalComponent key={modal.id} {...modal} />
            ))}
        </AppContext.Provider>
    );
};
import React from 'react';
import { DropdownItem } from "@heroui/react";  // Updated to use HeroUI
import Login from "@/components/Login";
import { firebaseAuth } from "@/utils/firebase/firebase.config";
import { signOut } from "firebase/auth";
import { ModalProps } from '@/types';

interface AuthActionsProps {
    user: any;
    openModal: (modalProps: ModalProps) => void;
    closeModal: (id: string) => void;
}

const AuthActions: React.FC<AuthActionsProps> = ({ user, openModal, closeModal }) => {
    const handleSignOut = async () => {
        await signOut(firebaseAuth);
    }

    return (
        <DropdownItem
            key="account"
            textValue='Account'
            color="danger"
            className='p-0'
        >
            {user ? (
                <div
                    className='cursor-pointer hover:bg-[rgb(243,18,96)]/20 hover:text-[rgb(243,18,96)] rounded-lg p-2'
                    onClick={handleSignOut}
                >
                    Logout
                </div>
            ) : (
                <div
                    className='cursor-pointer hover:bg-[rgb(18,243,67)]/20 hover:text-[rgb(18,243,67)] rounded-lg p-2'
                    onClick={() => openModal({
                        id: 'login',
                        isOpen: true,
                        hideCloseButton: false,
                        backdrop: 'blur',
                        size: 'full',
                        scrollBehavior: 'inside',
                        isDismissable: true,
                        modalHeader: 'Autentificare',
                        modalBody: <Login onClose={() => closeModal('login')} />,
                        headerDisabled: true,
                        footerDisabled: true,
                        noReplaceURL: true,
                        onClose: () => closeModal('login'),
                    })}
                >
                    Login
                </div>
            )}
        </DropdownItem>
    );
};

export default AuthActions;
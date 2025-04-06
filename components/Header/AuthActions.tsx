'use client'

import React, { useContext } from 'react';
import { AppContext } from "@/components/AppContext";
import Button from "@/components/ui/Button";
import Login from "@/components/Login";

/**
 * AuthActions component that displays login/signup buttons when user is not authenticated
 */
export default function AuthActions() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("Missing context value");
    }

    const { user, openModal, closeModal } = context;

    // Don't show login buttons if user is already logged in
    if (user) {
        return null;
    }

    const handleOpenLoginModal = () => {
        openModal({
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
        });
    };

    return (
        <div className="flex gap-3">
            <Button
                variant="flat"
                color="primary"
                onClick={handleOpenLoginModal}
                className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
            >
                Login
            </Button>
            <Button
                color="primary"
                onClick={handleOpenLoginModal}
                className="font-medium bg-[color:var(--ai-primary)] text-white hover:bg-[color:var(--ai-primary)]/90"
            >
                Sign Up
            </Button>
        </div>
    );
}
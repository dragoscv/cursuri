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
    } const handleOpenLoginModal = () => {
        openModal({
            id: 'login',
            isOpen: true,
            hideCloseButton: false,
            backdrop: 'blur',
            size: 'md',
            scrollBehavior: 'inside',
            isDismissable: true,
            modalHeader: 'Autentificare',
            modalBody: <Login onClose={() => closeModal('login')} />,
            headerDisabled: true,
            footerDisabled: true,
            noReplaceURL: true,
            onClose: () => closeModal('login'),
            classNames: {
                backdrop: "z-50 backdrop-blur-md backdrop-saturate-150 bg-black/60 w-screen min-h-[100dvh] fixed inset-0",
                base: "z-50 mx-auto my-auto rounded-xl shadow-xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] overflow-hidden h-auto min-h-0",
                wrapper: "z-50 w-full flex flex-col justify-center items-center overflow-hidden min-h-[100dvh]",
                content: "h-auto min-h-0",
            },
        });
    };

    return (
        <div className="flex items-center gap-2 md:gap-3">
            <Button
                variant="flat"
                size="sm"
                onClick={handleOpenLoginModal}
                className="
                    font-medium 
                    text-[color:var(--ai-primary)] 
                    bg-[color:var(--ai-primary)]/10 
                    hover:bg-[color:var(--ai-primary)]/20
                    border border-[color:var(--ai-primary)]/20
                    hover:border-[color:var(--ai-primary)]/30
                    rounded-lg
                    px-3 py-2 md:px-4 md:py-2
                    transition-all duration-200
                    min-w-[60px] md:min-w-[70px]
                    text-sm
                "
            >
                Login
            </Button>
            <Button
                variant="primary"
                size="sm" 
                onClick={handleOpenLoginModal}
                style={{
                    background: 'linear-gradient(to right, var(--ai-primary), var(--ai-secondary))'
                }}
                className="
                    font-medium 
                    text-white 
                    hover:opacity-90
                    hover:shadow-md hover:shadow-[color:var(--ai-primary)]/25
                    rounded-lg
                    px-3 py-2 md:px-4 md:py-2
                    transition-all duration-200
                    min-w-[70px] md:min-w-[80px]
                    text-sm
                    border-0
                "
            >
                Sign Up
            </Button>
        </div>
    );
}
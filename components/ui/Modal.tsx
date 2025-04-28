'use client';

import React, { forwardRef } from 'react';
import { Modal as HeroModal, ModalContent as HeroModalContent, ModalHeader as HeroModalHeader, ModalBody as HeroModalBody, ModalFooter as HeroModalFooter } from '@heroui/react';
import type { ModalProps as HeroModalProps } from '@heroui/react';

export interface ModalProps extends HeroModalProps {
    className?: string;
    classNames?: {
        base?: string;
        backdrop?: string;
        header?: string;
        body?: string;
        footer?: string;
    };
}

const Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
    const {
        children,
        className = '',
        classNames = {},
        ...rest
    } = props;

    const defaultClassNames = {
        base: "bg-[color:var(--ai-card-background)] text-[color:var(--ai-foreground)]",
        backdrop: "bg-[color:var(--ai-overlay)]",
        header: "border-b border-[color:var(--ai-card-border)]",
        body: "",
        footer: "border-t border-[color:var(--ai-card-border)]",
    };

    // Merge default classNames with user-provided ones
    const mergedClassNames = {
        base: `${defaultClassNames.base} ${classNames.base || ''}`,
        backdrop: `${defaultClassNames.backdrop} ${classNames.backdrop || ''}`,
        header: `${defaultClassNames.header} ${classNames.header || ''}`,
        body: `${defaultClassNames.body} ${classNames.body || ''}`,
        footer: `${defaultClassNames.footer} ${classNames.footer || ''}`,
    };

    return (
        <HeroModal
            ref={ref}
            className={className}
            classNames={mergedClassNames}
            {...rest}
        >
            {children}
        </HeroModal>
    );
});

Modal.displayName = 'Modal';

export default Modal;

export const ModalContent = forwardRef<HTMLDivElement, any>((props, ref) => {
    // Don't forward the ref directly as HeroModalContent doesn't accept it
    // Ensure we're passing the children prop which is required
    const { children, ...rest } = props;
    return <HeroModalContent {...rest}>{children}</HeroModalContent>;
});
ModalContent.displayName = 'ModalContent';

export const ModalHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
    // Don't forward the ref directly as HeroModalHeader doesn't accept it
    return <HeroModalHeader {...props} />;
});
ModalHeader.displayName = 'ModalHeader';

export const ModalBody = forwardRef<HTMLDivElement, any>((props, ref) => {
    // Don't forward the ref directly as HeroModalBody doesn't accept it
    return <HeroModalBody {...props} />;
});
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, any>((props, ref) => {
    // Don't forward the ref directly as HeroModalFooter doesn't accept it
    return <HeroModalFooter {...props} />;
});
ModalFooter.displayName = 'ModalFooter';

// Export all components together
// Note: Removing the duplicate export at the bottom

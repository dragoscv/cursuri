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
    return <HeroModalContent ref={ref} {...props} />;
});
ModalContent.displayName = 'ModalContent';

export const ModalHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
    return <HeroModalHeader ref={ref} {...props} />;
});
ModalHeader.displayName = 'ModalHeader';

export const ModalBody = forwardRef<HTMLDivElement, any>((props, ref) => {
    return <HeroModalBody ref={ref} {...props} />;
});
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<HTMLDivElement, any>((props, ref) => {
    return <HeroModalFooter ref={ref} {...props} />;
});
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter };

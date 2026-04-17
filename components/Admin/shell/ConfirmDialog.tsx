'use client';

import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@heroui/react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'primary' | 'danger' | 'warning';
    loading?: boolean;
    icon?: React.ReactNode;
}

const ConfirmDialog: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'danger',
    loading = false,
    icon,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} backdrop="blur" placement="center" size="md">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex items-center gap-3">
                            {icon && (
                                <div
                                    className={[
                                        'h-10 w-10 grid place-items-center rounded-xl',
                                        tone === 'danger' && 'bg-rose-500/10 text-rose-500',
                                        tone === 'warning' && 'bg-amber-500/10 text-amber-500',
                                        tone === 'primary' && 'bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    {icon}
                                </div>
                            )}
                            <span>{title}</span>
                        </ModalHeader>
                        <ModalBody>
                            {description && (
                                <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">{description}</p>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={close} isDisabled={loading}>
                                {cancelLabel}
                            </Button>
                            <Button
                                color={tone === 'primary' ? 'primary' : tone === 'warning' ? 'warning' : 'danger'}
                                onPress={async () => {
                                    await onConfirm();
                                }}
                                isLoading={loading}
                            >
                                {confirmLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ConfirmDialog;

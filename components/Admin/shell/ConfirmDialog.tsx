'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { AppModal, type AppModalTone } from '@/components/shared/ui';

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
    const modalTone: AppModalTone = tone;
    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            tone={modalTone}
            icon={icon}
            title={title}
            footer={
                <>
                    <Button variant="flat" onPress={onClose} isDisabled={loading}>
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
                </>
            }
        >
            {description && (
                <p className="text-sm text-[color:var(--ai-muted)] leading-relaxed">{description}</p>
            )}
        </AppModal>
    );
};

export default ConfirmDialog;

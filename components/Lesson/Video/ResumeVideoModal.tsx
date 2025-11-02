'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';

interface ResumeVideoModalProps {
    isOpen: boolean;
    savedPosition: number;
    duration: number;
    onResume: () => void;
    onStartFromBeginning: () => void;
    formatTime: (seconds: number) => string;
}

export const ResumeVideoModal: React.FC<ResumeVideoModalProps> = ({
    isOpen,
    savedPosition,
    duration,
    onResume,
    onStartFromBeginning,
    formatTime,
}) => {
    const t = useTranslations('lessons.resumeVideo');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onStartFromBeginning}
            backdrop="blur"
            size="md"
            classNames={{
                base: "bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] rounded-2xl",
                header: "border-b border-[color:var(--ai-card-border)] rounded-t-2xl",
                body: "py-6",
                footer: "border-t border-[color:var(--ai-card-border)] rounded-b-2xl"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-[color:var(--ai-foreground)]">
                        {t('title')}
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <p className="text-[color:var(--ai-foreground)]">
                            {t('message')}
                        </p>
                        <div className="bg-[color:var(--ai-card-bg)]/60 border border-[color:var(--ai-card-border)] rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[color:var(--ai-muted)]">{t('savedPosition')}:</span>
                                <span className="text-[color:var(--ai-primary)] font-semibold">
                                    {formatTime(savedPosition)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[color:var(--ai-muted)]">{t('totalDuration')}:</span>
                                <span className="text-[color:var(--ai-foreground)] font-semibold">
                                    {formatTime(duration)}
                                </span>
                            </div>
                            <div className="mt-3">
                                <div className="w-full bg-[color:var(--ai-card-border)] rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] h-2 rounded-full transition-all"
                                        style={{ width: `${(savedPosition / duration) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter className="flex gap-2">
                    <Button
                        variant="bordered"
                        onPress={onStartFromBeginning}
                        className="flex-1 rounded-xl"
                    >
                        {t('startFromBeginning')}
                    </Button>
                    <Button
                        color="primary"
                        onPress={onResume}
                        className="flex-1 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-xl"
                    >
                        {t('resume')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ResumeVideoModal;

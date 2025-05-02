import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionText?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionText,
    actionHref,
    onAction
}: EmptyStateProps) {
    return (
        <motion.div
            className="w-full flex flex-col items-center justify-center py-16 px-6 border border-dashed border-[color:var(--ai-card-border)] rounded-lg bg-[color:var(--ai-card-bg)]/40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="p-5 rounded-full bg-[color:var(--ai-primary)]/5 mb-4 text-[color:var(--ai-primary)]">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-center text-[color:var(--ai-muted)] max-w-md mb-6">{description}</p>

            {(actionText && actionHref) && (
                <Link href={actionHref}>
                    <Button
                        color="primary"
                        variant="light"
                        onClick={onAction}
                    >
                        {actionText}
                    </Button>
                </Link>
            )}

            {(actionText && !actionHref && onAction) && (
                <Button
                    color="primary"
                    variant="light"
                    onClick={onAction}
                >
                    {actionText}
                </Button>
            )}
        </motion.div>
    );
}

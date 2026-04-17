'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

const EmptyState: React.FC<Props> = ({ icon, title, description, action, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={[
                'flex flex-col items-center justify-center text-center py-12 px-6',
                className,
            ].join(' ')}
        >
            {icon && (
                <div className="h-14 w-14 rounded-2xl grid place-items-center bg-gradient-to-br from-[color:var(--ai-primary)]/15 to-[color:var(--ai-secondary)]/10 text-[color:var(--ai-primary)] mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-semibold text-[color:var(--ai-foreground)]">{title}</h3>
            {description && (
                <p className="text-sm text-[color:var(--ai-muted)] mt-1.5 max-w-sm">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    );
};

export default EmptyState;

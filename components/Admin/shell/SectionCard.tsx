'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** Remove inner padding when content is a table or other edge-to-edge content */
    flush?: boolean;
    className?: string;
    children: React.ReactNode;
}

const SectionCard: React.FC<Props> = ({
    title,
    description,
    actions,
    flush = false,
    className = '',
    children,
}) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={[
                'rounded-2xl border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/70 backdrop-blur-sm overflow-hidden',
                'shadow-[0_2px_12px_-8px_rgba(0,0,0,0.18)]',
                className,
            ].join(' ')}
        >
            {(title || actions) && (
                <header className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-3">
                    <div className="min-w-0">
                        {title && (
                            <h2 className="text-base font-semibold text-[color:var(--ai-foreground)]">{title}</h2>
                        )}
                        {description && (
                            <p className="text-xs text-[color:var(--ai-muted)] mt-0.5">{description}</p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </header>
            )}
            <div className={flush ? '' : 'px-5 sm:px-6 pb-5 sm:pb-6 pt-1'}>{children}</div>
        </motion.section>
    );
};

export default SectionCard;

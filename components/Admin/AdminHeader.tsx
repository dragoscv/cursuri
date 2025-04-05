import React from 'react';
import { motion } from 'framer-motion';

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    title,
    subtitle,
    actions
}) => {
    return (
        <div className="mb-8">
            <div className="relative">
                {/* Background gradient with admin theme colors */}
                <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] opacity-10 rounded-lg -z-10" />

                {/* Content */}
                <div className="py-6 px-6 rounded-lg">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">
                                    {title}
                                </h1>

                                {subtitle && (
                                    <p className="mt-2 text-[color:var(--ai-muted)]">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Admin badge */}
                            <div className="mt-3 sm:mt-0">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] dark:bg-[color:var(--ai-primary)]/20 dark:text-[color:var(--ai-primary)]/90">
                                    <span className="mr-1.5 h-2 w-2 rounded-full bg-[color:var(--ai-primary)]"></span>
                                    Admin Dashboard
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Optional action buttons */}
                    {actions && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
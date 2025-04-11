import React from 'react';
import { motion } from 'framer-motion';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    description,
    actions
}) => {
    return (
        <div className="mb-8">
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-7 border border-white/10 dark:border-[color:var(--ai-card-border)] shadow-xl relative overflow-hidden">
                {/* Decorative circuit pattern element */}
                <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.05] dark:opacity-[0.07] pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10,30 L30,30 L30,10 M70,10 L70,30 L90,30 M90,70 L70,70 L70,90 M30,90 L30,70 L10,70"
                            fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                        <path d="M50,30 L50,10 M70,50 L90,50 M50,70 L50,90 M30,50 L10,50"
                            fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                </div>

                {/* Animated decorative elements */}
                <div className="absolute top-4 right-14 h-2 w-2 rounded-full bg-[color:var(--ai-primary)]/40 animate-pulse"></div>
                <div className="absolute top-8 right-8 h-3 w-3 rounded-full bg-[color:var(--ai-secondary)]/30 animate-pulse" style={{ animationDelay: "1s" }}></div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 relative z-10"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-3">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-[color:var(--ai-muted)] max-w-2xl text-base leading-relaxed">
                            {description}
                        </p>
                    )}
                </motion.div>

                {/* Optional action buttons */}
                {actions && (
                    <div className="flex flex-wrap gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPageHeader;

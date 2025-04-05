import React from 'react';

interface CoursesHeaderProps {
    title: string;
    description: string;
}

export default function CoursesHeader({ title, description }: CoursesHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 dark:border-[color:var(--ai-card-border)] shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent mb-2">{title}</h1>
            <p className="text-[color:var(--ai-muted)]">
                {description}
            </p>
        </div>
    );
}
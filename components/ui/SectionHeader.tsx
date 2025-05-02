import React from 'react';

interface SectionHeaderProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
}

export default function SectionHeader({ icon, title, subtitle, className = '' }: SectionHeaderProps) {
    return (
        <div className={`flex gap-3 items-center px-6 py-4 border-b border-[color:var(--ai-card-border)]/60 bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-transparent ${className}`}>
            {icon}
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)]">{title}</h2>
                {subtitle && <p className="text-[color:var(--ai-muted)] text-sm">{subtitle}</p>}
            </div>
        </div>
    );
}

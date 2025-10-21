import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody } from '@heroui/react';

interface ActionButtonProps {
    title: string;
    href?: string;
    onClick?: () => void;
    icon: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, href, onClick, icon }) => (
    <a
        href={href || "#"}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 rounded-lg bg-[color:var(--ai-primary)]/5 dark:bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/10 dark:hover:bg-[color:var(--ai-primary)]/15 transition duration-200 cursor-pointer shadow-sm hover:shadow-md border border-[color:var(--ai-card-border)]/30"
    >
        <div className="p-2 rounded-full bg-[color:var(--ai-primary)]/10 dark:bg-[color:var(--ai-primary)]/20 text-[color:var(--ai-primary)] mb-3">
            {icon}
        </div>
        <span className="font-medium text-[color:var(--ai-foreground)]">{title}</span>
    </a>
);

interface AdminQuickActionsSectionProps {
    onTabChange: (tab: string) => void;
}

export default function AdminQuickActionsSection({ onTabChange }: AdminQuickActionsSectionProps) {
    const t = useTranslations('admin.quickActions');

    return (
        <Card className="shadow-md mb-8">
            <CardBody>
                <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ActionButton
                        title={t('addCourse')}
                        href="/admin/courses/add"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        }
                    />
                    <ActionButton
                        title={t('manageUsers')}
                        onClick={() => onTabChange('users')}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <ActionButton
                        title={t('viewAnalytics')}
                        onClick={() => onTabChange('analytics')}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                    <ActionButton
                        title={t('settings')}
                        onClick={() => onTabChange('settings')}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                </div>
            </CardBody>
        </Card>
    );
}

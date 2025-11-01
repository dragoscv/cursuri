import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FiBook } from '@/components/icons/FeatherIcons';
import { useTranslations } from 'next-intl';

interface ProfileActionButtonsProps {
    hasPaidCourses: boolean;
}

export default function ProfileActionButtons({ hasPaidCourses }: ProfileActionButtonsProps) {
    const t = useTranslations('profile');

    return (
        <div className="mt-10 mb-6 text-center relative">
            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16 bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-64 h-16 bg-gradient-to-r from-[color:var(--ai-secondary)]/10 via-[color:var(--ai-accent)]/10 to-[color:var(--ai-primary)]/10 rounded-full blur-xl -z-10"></div>

            {hasPaidCourses ? (
                <Link href="/profile/courses">
                    <Button
                        color="primary"
                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-10 py-6 rounded-xl shadow-lg hover:shadow-[0_8px_20px_-6px_rgba(var(--ai-primary-rgb),0.5)] transition-all duration-300 hover:-translate-y-1"
                        startContent={<div className="bg-white/20 p-1 rounded-full"><FiBook size={18} /></div>}
                        size="lg"
                    >
                        {t('continueLearning')}
                    </Button>
                </Link>
            ) : (
                <Link href="/courses">
                    <Button
                        color="primary"
                        className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium px-10 py-6 rounded-xl shadow-lg hover:shadow-[0_8px_20px_-6px_rgba(var(--ai-primary-rgb),0.5)] transition-all duration-300 hover:-translate-y-1"
                        startContent={<div className="bg-white/20 p-1 rounded-full"><FiBook size={18} /></div>}
                        size="lg"
                    >
                        {t('browseCourses')}
                    </Button>
                </Link>)}
        </div>
    );
}

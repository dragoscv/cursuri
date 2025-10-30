import React from 'react';
import Button from '@/components/ui/Button';
import { Input } from '@heroui/react';
import { FiSearch, FiLayers, FiPlay, FiBarChart2 } from '@/components/icons/FeatherIcons';
import { useTranslations } from 'next-intl';

interface ProfileCoursesFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
}

export default function ProfileCoursesFilter({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus
}: ProfileCoursesFilterProps) {
    const t = useTranslations('profile.courses.filter');
    return (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <div className="bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm border border-[color:var(--ai-card-border)] rounded-xl p-4 shadow-md">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:max-w-xs">
                        <Input
                            className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] border-[color:var(--ai-card-border)]/30 rounded-lg"
                            placeholder={t('searchPlaceholder')}
                            startContent={
                                <div className="bg-[color:var(--ai-primary)]/10 p-1 rounded-full">
                                    <FiSearch className="text-[color:var(--ai-primary)]" />
                                </div>
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute top-1.5 right-2 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                {t('filtering')}
                            </div>
                        )}
                    </div>

                    <div className="inline-flex gap-2 ml-auto p-1 bg-[color:var(--ai-card-bg)]/80 rounded-lg border border-[color:var(--ai-card-border)]/20 shadow-inner">
                        <Button
                            color={filterStatus === 'all' ? 'primary' : 'default'}
                            variant={filterStatus === 'all' ? 'flat' : 'light'}
                            size="sm"
                            radius="lg"
                            className={filterStatus === 'all' ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                            startContent={<FiLayers size={16} />}
                            onClick={() => setFilterStatus('all')}
                        >
                            {t('all')}
                        </Button>
                        <Button
                            color={filterStatus === 'in-progress' ? 'primary' : 'default'}
                            variant={filterStatus === 'in-progress' ? 'flat' : 'light'}
                            size="sm"
                            radius="lg"
                            className={filterStatus === 'in-progress' ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                            startContent={<FiPlay size={16} />}
                            onClick={() => setFilterStatus('in-progress')}
                        >
                            {t('inProgress')}
                        </Button>
                        <Button
                            color={filterStatus === 'completed' ? 'success' : 'default'}
                            variant={filterStatus === 'completed' ? 'flat' : 'light'}
                            size="sm"
                            radius="lg"
                            className={filterStatus === 'completed' ? 'bg-gradient-to-r from-[color:var(--ai-success)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                            startContent={<FiBarChart2 size={16} />}
                            onClick={() => setFilterStatus('completed')}
                        >
                            {t('completed')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

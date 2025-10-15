import React from 'react';
import Button from '@/components/ui/Button';
import { Input } from '@heroui/react';
import { FiSearch, FiLayers, FiPlay, FiBarChart2 } from '@/components/icons/FeatherIcons';

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
    return (
        <div className="bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/20 rounded-xl p-4 mb-7 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-xs">
                    <Input
                        className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] border-[color:var(--ai-card-border)]/30 rounded-lg"
                        placeholder="Search your courses"
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
                            Filtering
                        </div>
                    )}
                </div>

                <div className="inline-flex gap-2 ml-auto p-1 bg-[color:var(--ai-card-bg)]/80 rounded-lg border border-[color:var(--ai-card-border)]/20 shadow-inner">
                    <Button
                        color={filterStatus === 'all' ? 'primary' : 'default'}
                        variant={filterStatus === 'all' ? 'flat' : 'light'}
                        size="sm"
                        className={filterStatus === 'all' ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                        startContent={<FiLayers size={16} />}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </Button>
                    <Button
                        color={filterStatus === 'in-progress' ? 'primary' : 'default'}
                        variant={filterStatus === 'in-progress' ? 'flat' : 'light'}
                        size="sm"
                        className={filterStatus === 'in-progress' ? 'bg-gradient-to-r from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                        startContent={<FiPlay size={16} />}
                        onClick={() => setFilterStatus('in-progress')}
                    >
                        In Progress
                    </Button>
                    <Button
                        color={filterStatus === 'completed' ? 'success' : 'default'}
                        variant={filterStatus === 'completed' ? 'flat' : 'light'}
                        size="sm"
                        className={filterStatus === 'completed' ? 'bg-gradient-to-r from-[color:var(--ai-success)]/20 to-[color:var(--ai-secondary)]/20 shadow-sm' : ''}
                        startContent={<FiBarChart2 size={16} />}
                        onClick={() => setFilterStatus('completed')}
                    >
                        Completed
                    </Button>
                </div>
            </div>
        </div>
    );
}

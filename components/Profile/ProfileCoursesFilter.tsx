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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
                className="md:max-w-xs"
                placeholder="Search your courses"
                startContent={<FiSearch className="text-[color:var(--ai-muted)]" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="inline-flex gap-2 ml-auto">
                <Button
                    color={filterStatus === 'all' ? 'primary' : 'light'}
                    variant={filterStatus === 'all' ? 'primary' : 'light'}
                    size="sm"
                    startContent={<FiLayers />}
                    onClick={() => setFilterStatus('all')}
                >
                    All
                </Button>
                <Button
                    color={filterStatus === 'in-progress' ? 'primary' : 'light'}
                    variant={filterStatus === 'in-progress' ? 'primary' : 'light'}
                    size="sm"
                    startContent={<FiPlay />}
                    onClick={() => setFilterStatus('in-progress')}
                >
                    In Progress
                </Button>
                <Button
                    color={filterStatus === 'completed' ? 'primary' : 'light'}
                    variant={filterStatus === 'completed' ? 'primary' : 'light'}
                    size="sm"
                    startContent={<FiBarChart2 />}
                    onClick={() => setFilterStatus('completed')}
                >
                    Completed
                </Button>
            </div>
        </div>
    );
}
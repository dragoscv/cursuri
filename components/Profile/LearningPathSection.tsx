import React, { useState } from 'react';
import { Card, CardBody, Progress, Tooltip, Chip } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiTrendingUp, FiLock, FiCheck, FiPlay, FiChevronRight, FiInfo } from '@/components/icons/FeatherIcons';
import useLearningPath, { CourseNode } from './hooks/useLearningPath';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function LearningPathSection() {
    const t = useTranslations('profile.learningPathSection');
    const { currentCourse, nextCourse, currentProgress, courseNodes, loading, error } = useLearningPath();
    const [expandedView, setExpandedView] = useState(false);
    const context = React.useContext(AppContext) as AppContextProps;
    const { openModal } = context;

    if (loading) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('title')}</span>
                            </h3>
                        </div>
                        <div className="animate-pulse">
                            <div className="h-6 bg-[color:var(--ai-card-border)] rounded w-1/3 mb-3"></div>
                            <div className="h-4 bg-[color:var(--ai-card-border)] rounded w-1/2 mb-4"></div>
                            <div className="h-2 bg-[color:var(--ai-card-border)] rounded w-full mb-4"></div>
                            <div className="h-6 bg-[color:var(--ai-card-border)] rounded w-1/4 mt-6"></div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('title')}</span>
                            </h3>
                        </div>
                        <div className="text-[color:var(--ai-error)]">
                            {t('loadingError')}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // No courses to display
    if (courseNodes.length === 0) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('title')}</span>
                            </h3>
                        </div>
                        <div className="text-[color:var(--ai-muted)] text-center py-6">
                            <p className="mb-3">{t('noCoursesYet')}</p>
                            <Button
                                color="primary"
                                variant="solid"
                                onClick={() => window.location.href = '/courses'}
                            >
                                {t('browseCourses')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Standard view with current and next course
    if (!expandedView) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                    <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                    <span>{t('title')}</span>
                                </h3>
                                <Button
                                    color="primary"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedView(true)}
                                >
                                    {t('viewFullPath')}
                                </Button>
                            </div>
                        </div>

                        {currentCourse ? (
                            <div className="mb-4">
                                <div className="text-sm text-[color:var(--ai-muted)] mb-1">{t('currentCourse')}</div>
                                <div className="font-medium text-[color:var(--ai-foreground)] mb-2">{currentCourse}</div>                            <Progress
                                    value={currentProgress}
                                    aria-label="Current course progress"
                                    classNames={{
                                        track: 'h-2 rounded-full',
                                        indicator: 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full'
                                    }}
                                />
                                <div className="text-xs text-[color:var(--ai-muted)] mt-1">{currentProgress}% {t('completed')}</div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <div className="text-sm text-[color:var(--ai-muted)] mb-2">{t('noCourseInProgress')}</div>
                            </div>
                        )}

                        {nextCourse && (
                            <div>
                                <div className="text-sm text-[color:var(--ai-muted)] mb-1">{t('nextUp')}</div>
                                <div className="font-medium text-[color:var(--ai-primary)]">{nextCourse}</div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    // Function to get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <FiCheck className="text-[color:var(--ai-success)]" />;
            case 'in-progress':
                return <FiPlay className="text-[color:var(--ai-primary)]" />;
            case 'locked':
                return <FiLock className="text-[color:var(--ai-muted)]" />;
            default:
                return <FiChevronRight className="text-[color:var(--ai-secondary)]" />;
        }
    };

    // Function to get status chip color
    const getChipColor = (status: string): any => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in-progress':
                return 'primary';
            case 'locked':
                return 'default';
            default:
                return 'secondary';
        }
    };

    // Expanded view with all courses in learning path
    return (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiTrendingUp className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('title')}</span>
                            </h3>
                            <Button
                                color="primary"
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedView(false)}
                            >
                                {t('collapseView')}
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Path lines connecting courses */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] z-0"></div>

                        {/* Course nodes */}
                        <div className="space-y-4 relative z-10">
                            {courseNodes.map((node, index) => (
                                <motion.div
                                    key={node.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                        <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 
                                        ${node.status === 'completed' ? 'border-[color:var(--ai-success)] bg-[color:var(--ai-success)]/10' :
                                                node.status === 'in-progress' ? 'border-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10' :
                                                    node.status === 'locked' ? 'border-[color:var(--ai-muted)] bg-[color:var(--ai-muted)]/10' :
                                                        'border-[color:var(--ai-secondary)] bg-[color:var(--ai-secondary)]/10'}`}
                                        >
                                            {getStatusIcon(node.status)}
                                        </div>
                                    </div>

                                    <div className="flex-grow p-3 border border-[color:var(--ai-card-border)] rounded-lg hover:shadow-md transition-shadow bg-[color:var(--ai-card-bg)]/70">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-[color:var(--ai-foreground)]">{node.name}</div>
                                            <Chip size="sm" color={getChipColor(node.status)} variant="flat">
                                                {node.status === 'in-progress' ? t('inProgress') :
                                                    node.status === 'completed' ? t('completed') :
                                                        node.status === 'locked' ? t('locked') : t('upcoming')}
                                            </Chip>
                                        </div>

                                        {/* Only show progress for in-progress courses */}
                                        {node.status === 'in-progress' && (
                                            <div className="mt-2 mb-1">                                            <Progress
                                                size="sm"
                                                value={node.progress}
                                                aria-label={`${node.name} course progress`}
                                                classNames={{
                                                    track: 'h-1.5 rounded-full',
                                                    indicator: 'bg-[color:var(--ai-primary)] rounded-full'
                                                }}
                                            />
                                                <div className="text-xs text-[color:var(--ai-muted)] mt-1">{node.progress}% {t('completedPercentage')}</div>
                                            </div>
                                        )}

                                        {/* Prerequisites section */}
                                        {node.prerequisites && node.prerequisites.length > 0 && (
                                            <div className="mt-2 flex items-center">
                                                <Tooltip content={t('prerequisitesRequired')}>
                                                    <div className="text-xs flex items-center mr-2 text-[color:var(--ai-muted)]">
                                                        <FiInfo className="mr-1" /> {t('prerequisites')}:
                                                    </div>
                                                </Tooltip>
                                                <div className="flex flex-wrap gap-1">
                                                    {node.prerequisites.map(prereqId => {
                                                        const prereq = courseNodes.find(c => c.id === prereqId);
                                                        return prereq ? (
                                                            <Chip
                                                                key={prereqId}
                                                                size="sm"
                                                                color={prereq.status === 'completed' ? 'success' : 'default'}
                                                                variant="flat"
                                                            >
                                                                {prereq.name}
                                                            </Chip>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action button */}
                                        <div className="mt-3">
                                            <Button
                                                size="sm"
                                                color={node.status === 'locked' ? 'default' : 'primary'}
                                                variant={node.status === 'locked' ? 'flat' : 'solid'}
                                                isDisabled={node.status === 'locked'}
                                                onClick={() => window.location.href = `/courses/${node.id}`}
                                            >
                                                {node.status === 'completed' ? t('reviewCourse') :
                                                    node.status === 'in-progress' ? t('continueLearning') :
                                                        node.status === 'locked' ? t('prerequisitesRequired') : t('startLearning')}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
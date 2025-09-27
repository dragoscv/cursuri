import React, { useState } from 'react';
import { Card, CardBody, Progress, Tooltip, Chip, Button } from '@heroui/react';
import { FiTrendingUp, FiLock, FiCheck, FiPlay, FiChevronRight, FiInfo } from '@/components/icons/FeatherIcons';
import useLearningPath, { CourseNode } from './hooks/useLearningPath';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { motion } from 'framer-motion';

export default function LearningPathSection() {
    const { currentCourse, nextCourse, currentProgress, courseNodes, loading, error } = useLearningPath();
    const [expandedView, setExpandedView] = useState(false);
    const context = React.useContext(AppContext) as AppContextProps;
    const { openModal } = context;

    if (loading) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-primary)]/10">
                            <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                        </span>
                        Learning Path
                    </h2>
                    <div className="animate-pulse">
                        <div className="h-6 bg-[color:var(--ai-card-border)] rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-[color:var(--ai-card-border)] rounded w-1/2 mb-4"></div>
                        <div className="h-2 bg-[color:var(--ai-card-border)] rounded w-full mb-4"></div>
                        <div className="h-6 bg-[color:var(--ai-card-border)] rounded w-1/4 mt-6"></div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-error)] to-[color:var(--ai-error-dark)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-error)]/10">
                            <FiTrendingUp className="text-[color:var(--ai-error)]" />
                        </span>
                        Learning Path
                    </h2>
                    <div className="text-[color:var(--ai-error)]">
                        Failed to load learning path data. Please try again later.
                    </div>
                </CardBody>
            </Card>
        );
    }

    // No courses to display
    if (courseNodes.length === 0) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-primary)]/10">
                            <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                        </span>
                        Learning Path
                    </h2>
                    <div className="text-[color:var(--ai-muted)] text-center py-6">
                        <p className="mb-3">You haven't enrolled in any courses yet.</p>
                        <Button
                            color="primary"
                            variant="solid"
                            onClick={() => window.location.href = '/courses'}
                        >
                            Browse Courses
                        </Button>
                    </div>
                </CardBody>
            </Card>
        );
    }

    // Standard view with current and next course
    if (!expandedView) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"></div>
                <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <span className="p-1.5 rounded-full bg-[color:var(--ai-primary)]/10">
                                <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                            </span>
                            Learning Path
                        </h2>
                        <Button
                            color="primary"
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedView(true)}
                        >
                            View Full Path
                        </Button>
                    </div>

                    {currentCourse ? (
                        <div className="mb-4">
                            <div className="text-sm text-[color:var(--ai-muted)] mb-1">Current Course</div>
                            <div className="font-medium text-[color:var(--ai-foreground)] mb-2">{currentCourse}</div>                            <Progress
                                value={currentProgress}
                                aria-label="Current course progress"
                                classNames={{
                                    track: 'h-2 rounded-full',
                                    indicator: 'bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full'
                                }}
                            />
                            <div className="text-xs text-[color:var(--ai-muted)] mt-1">{currentProgress}% completed</div>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="text-sm text-[color:var(--ai-muted)] mb-2">No course in progress</div>
                        </div>
                    )}

                    {nextCourse && (
                        <div>
                            <div className="text-sm text-[color:var(--ai-muted)] mb-1">Next Up</div>
                            <div className="font-medium text-[color:var(--ai-primary)]">{nextCourse}</div>
                        </div>
                    )}
                </CardBody>
            </Card>
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
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-accent)] to-[color:var(--ai-secondary)]"></div>
            <CardBody className="p-6">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-primary)]/10">
                            <FiTrendingUp className="text-[color:var(--ai-primary)]" />
                        </span>
                        Learning Path Visualization
                    </h2>
                    <Button
                        color="primary"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedView(false)}
                    >
                        Collapse View
                    </Button>
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
                                            {node.status === 'in-progress' ? 'In Progress' :
                                                node.status === 'completed' ? 'Completed' :
                                                    node.status === 'locked' ? 'Locked' : 'Upcoming'}
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
                                            <div className="text-xs text-[color:var(--ai-muted)] mt-1">{node.progress}% completed</div>
                                        </div>
                                    )}

                                    {/* Prerequisites section */}
                                    {node.prerequisites && node.prerequisites.length > 0 && (
                                        <div className="mt-2 flex items-center">
                                            <Tooltip content="Prerequisites required before starting this course">
                                                <div className="text-xs flex items-center mr-2 text-[color:var(--ai-muted)]">
                                                    <FiInfo className="mr-1" /> Prerequisites:
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
                                            {node.status === 'completed' ? 'Review Course' :
                                                node.status === 'in-progress' ? 'Continue Learning' :
                                                    node.status === 'locked' ? 'Prerequisites Required' : 'Start Learning'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

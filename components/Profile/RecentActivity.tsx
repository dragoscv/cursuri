import React from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { FiCalendar, FiBook, FiChevronRight } from '@/components/icons/FeatherIcons';
import Link from 'next/link';

interface ActivityItem {
    type: string;
    courseId: string;
    lessonId?: string;
    courseName: string;
    lessonName?: string;
    date: Date;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="border border-[color:var(--ai-card-border)]">
            <CardBody>
                <h2 className="text-lg font-semibold mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                    <FiCalendar className="text-[color:var(--ai-primary)]" />
                    Recent Activity
                </h2>

                {activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="rounded-full bg-[color:var(--ai-primary)]/10 p-2 flex-shrink-0">
                                    <FiBook className="h-5 w-5 text-[color:var(--ai-primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[color:var(--ai-foreground)]">
                                        {activity.lessonName ? `Continued "${activity.lessonName}"` : `Accessed "${activity.courseName}"`}
                                    </p>
                                    <p className="text-xs text-[color:var(--ai-muted)] truncate">
                                        Course: {activity.courseName}
                                    </p>
                                    <p className="text-xs text-[color:var(--ai-muted)]">
                                        {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
                                    </p>
                                </div>
                                <Link href={`/courses/${activity.courseId}${activity.lessonId ? `/lessons/${activity.lessonId}` : ''}`}>
                                    <Button size="sm" variant="flat" isIconOnly>
                                        <FiChevronRight />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-6 text-[color:var(--ai-muted)]">
                        No recent activity yet. Start learning!
                    </p>
                )}
            </CardBody>
        </Card>
    );
}
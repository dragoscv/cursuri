import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { AdminAnalytics } from '@/types';

interface AdminAnalyticsSectionProps {
    analytics: AdminAnalytics | null;
}

export default function AdminAnalyticsSection({ analytics }: AdminAnalyticsSectionProps) {
    if (!analytics) return null;
    return (
        <Card className="shadow-md mb-8">
            <CardBody>
                <h2 className="text-xl font-semibold mb-4">Popular Courses</h2>
                {analytics.popularCourses && analytics.popularCourses.length > 0 ? (
                    <div className="space-y-3">
                        {analytics.popularCourses.map((course, index) => (
                            <div key={course.courseId} className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold mr-3">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-medium text-[color:var(--ai-foreground)]">
                                        {course.courseName}
                                    </h3>
                                </div>
                                <div className="font-medium">
                                    {course.enrollments} enrollments
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted-foreground)] text-center py-4">
                        No enrollment data available yet
                    </p>
                )}
            </CardBody>
        </Card>
    );
}

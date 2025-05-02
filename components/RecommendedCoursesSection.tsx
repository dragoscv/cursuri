"use client";
import React, { useContext, useMemo } from 'react';
import { AppContext } from './AppContext';
import { Course } from '@/types';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FiLink } from './icons/FeatherIcons/FiLink';

export default function RecommendedCoursesSection() {
    const context = useContext(AppContext);
    const router = useRouter();
    const user = context?.user;
    const courses = context?.courses || {};
    const userPaidProducts = context?.userPaidProducts || [];

    // Get IDs of courses the user is already enrolled in
    const enrolledCourseIds = useMemo(() =>
        userPaidProducts.map((p) => p.metadata?.courseId),
        [userPaidProducts]
    );

    // Collect tags/categories from enrolled courses as user interests
    const userInterests = useMemo(() => {
        if (!enrolledCourseIds.length) return [];
        const tags = new Set<string>();
        enrolledCourseIds.forEach((id) => {
            const course = courses[id];
            if (course?.tags) course.tags.forEach((tag: string) => tags.add(tag));
        });
        return Array.from(tags);
    }, [enrolledCourseIds, courses]);

    // Recommend courses not enrolled, sorted by tag/category match, fallback to popular
    const recommendedCourses = useMemo(() => {
        const allCourses = Object.values(courses) as Course[];
        // Exclude already enrolled
        const notEnrolled = allCourses.filter((c) => !enrolledCourseIds.includes(c.id));
        if (userInterests.length) {
            // Sort by number of matching tags
            return notEnrolled
                .map((course) => ({
                    course,
                    match: course.tags ? course.tags.filter((t) => userInterests.includes(t)).length : 0,
                }))
                .sort((a, b) => b.match - a.match)
                .slice(0, 3)
                .map((x) => x.course);
        }
        // Fallback: top 3 by reviews count
        return notEnrolled
            .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
            .slice(0, 3);
    }, [courses, enrolledCourseIds, userInterests]);

    // Social share handler
    const handleShare = (course: Course) => {
        const shareUrl = `${window.location.origin}/courses/${course.id}`;
        const shareText = `Check out the course "${course.name}" on Cursuri!`;
        if (navigator.share) {
            navigator.share({
                title: course.name,
                text: shareText,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Course link copied to clipboard!');
        }
    };

    if (!recommendedCourses.length) return null;

    return (
        <section className="w-full py-16 bg-gradient-to-b from-[color:var(--ai-secondary)]/5 to-transparent">
            <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-8 text-[color:var(--ai-foreground)]">
                    Recommended For You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex flex-col rounded-xl bg-white dark:bg-[color:var(--ai-card-bg)] shadow-lg border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 transition-all duration-300 overflow-hidden"
                        >
                            <div
                                className="relative h-44 w-full cursor-pointer overflow-hidden"
                                onClick={() => router.push(`/courses/${course.id}`)}
                            >
                                <img
                                    src={course.imageUrl || '/placeholder-course.svg'}
                                    alt={course.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                    onError={e => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.src.includes('placeholder-course.svg')) {
                                            target.src = '/placeholder-course.svg';
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="mb-2 text-xl font-bold text-[color:var(--ai-foreground)] cursor-pointer hover:text-[color:var(--ai-primary)] transition-colors" onClick={() => router.push(`/courses/${course.id}`)}>
                                    {course.name}
                                </h3>
                                <p className="mb-4 flex-1 text-sm text-[color:var(--ai-muted)] line-clamp-2">
                                    {course.description || ''}
                                </p>
                                {course.tags && course.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {course.tags.slice(0, 3).map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-auto flex items-center justify-between gap-2">
                                    <div className="text-xl font-bold text-[color:var(--ai-foreground)]">
                                        {course.isFree ? (
                                            <span className="text-green-600 dark:text-green-400">Free</span>
                                        ) : (
                                            <span>{course.price ? `${course.price} RON` : 'Paid'}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        {/* Facebook */}
                                        <button
                                            type="button"
                                            aria-label="Share on Facebook"
                                            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/courses/' + course.id)}`, '_blank')}
                                        >
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
                                        </button>
                                        {/* Twitter */}
                                        <button
                                            type="button"
                                            aria-label="Share on Twitter"
                                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/courses/' + course.id)}&text=${encodeURIComponent('Check out this course: ' + course.name)}`, '_blank')}
                                        >
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.142 0 14.307-7.721 13.995-14.646A9.936 9.936 0 0 0 24 4.557z" /></svg>
                                        </button>
                                        {/* LinkedIn */}
                                        <button
                                            type="button"
                                            aria-label="Share on LinkedIn"
                                            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/courses/' + course.id)}`, '_blank')}
                                        >
                                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" /></svg>
                                        </button>
                                        {/* Copy Link / Native Share */}
                                        <button
                                            type="button"
                                            aria-label="Copy course link"
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/40 transition"
                                            onClick={() => handleShare(course)}
                                        >
                                            <FiLink size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

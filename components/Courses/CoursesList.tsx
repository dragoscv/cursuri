import React, { useContext, useCallback, memo, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { Button, Chip, Progress } from '@heroui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LoadingButton from '../Buttons/LoadingButton';
import { createCheckoutSession } from "firewand";
import { stripePayments } from "@/utils/firebase/stripe";
import { firebaseApp } from "@/utils/firebase/firebase.config";
import Login from "../Login";
import { Course } from '@/types';
import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';
import { FiLink } from '../icons/FeatherIcons/FiLink';
import { useTranslations } from 'next-intl';

interface CoursesListProps {
    filter?: string;
    category?: string;
}

export const CoursesList: React.FC<CoursesListProps> = memo(function CoursesList({ filter, category }) {
    const t = useTranslations('common');
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('CoursesList must be used within an AppContextProvider');
    } const { courses, products, openModal, closeModal, userPaidProducts, user, lessonProgress, lessons } = context;
    const [loadingPayment, setLoadingPayment] = React.useState(false);
    const [loadingCourseId, setLoadingCourseId] = React.useState<string | null>(null);

    // Memoize hover animation props
    const cardHoverProps = useMemo(() => ({
        y: -5,
        transition: { duration: 0.3, ease: "easeOut" }
    }), []);

    // Filter courses based on filter and category props
    const filteredCourses = React.useMemo(() => {
        let result = Object.values(courses || {});

        if (filter) {
            const lowercaseFilter = filter.toLowerCase();
            result = result.filter(
                (course: any) =>
                    course.name.toLowerCase().includes(lowercaseFilter) ||
                    (course.description && course.description.toLowerCase().includes(lowercaseFilter))
            );
        }

        if (category && category !== 'all') {
            result = result.filter(
                (course: any) => course.tags && course.tags.includes(category)
            );
        }

        return result;
    }, [courses, filter, category]);

    const buyCourse = useCallback(async (priceId: string, courseId: string) => {
        if (!user) {
            openModal({
                id: 'login',
                isOpen: true,
                hideCloseButton: false,
                backdrop: 'blur',
                size: 'full',
                scrollBehavior: 'inside',
                isDismissable: true,
                modalHeader: 'Autentificare',
                modalBody: <Login onClose={() => closeModal('login')} />,
                headerDisabled: true,
                footerDisabled: true,
                noReplaceURL: true,
                onClose: () => closeModal('login'),
            });
            return;
        }

        setLoadingPayment(true);
        setLoadingCourseId(courseId);

        const payments = stripePayments(firebaseApp);
        try {
            const session = await createCheckoutSession(payments, {
                price: priceId,
                allow_promotion_codes: true,
                mode: 'payment',
                metadata: {
                    courseId: courseId
                }
            });
            window.location.assign(session.url);
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setLoadingPayment(false);
            setLoadingCourseId(null);
        }
    }, [closeModal, openModal, user]);

    const handleCourseClick = useCallback((course: any) => {
        router.push(`/courses/${course.id}`);
    }, [router]);

    // Use unified pricing logic
    const getCoursePrice = useCallback((course: any) => {
        const priceInfo = getUnifiedCoursePrice(course, products);
        return {
            amount: priceInfo.amount,
            currency: priceInfo.currency,
            priceId: priceInfo.priceId
        };
    }, [products]); const isPurchased = useCallback((courseId: string) => {
        return userPaidProducts?.find((userPaidProduct: any) =>
            userPaidProduct.metadata?.courseId === courseId
        );
    }, [userPaidProducts]);

    // Calculate course completion percentage
    const getCourseCompletion = useCallback((courseId: string) => {
        if (!lessonProgress || !lessons || !lessons[courseId]) return { completed: 0, total: 0, percentage: 0 };

        const courseLessons = lessons[courseId] || {};
        const totalLessons = Object.keys(courseLessons).length;
        if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

        const courseProgress = lessonProgress[courseId] || {};
        const completedLessons = Object.values(courseProgress).filter(
            (progress: any) => progress.isCompleted
        ).length;

        const percentage = Math.round((completedLessons / totalLessons) * 100);

        return {
            completed: completedLessons,
            total: totalLessons,
            percentage: percentage
        };
    }, [lessonProgress, lessons]);

    // Animation variants
    const courseVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    // Social share handler
    const handleShare = (course: any) => {
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
            // Optionally show a toast/alert
            alert('Course link copied to clipboard!');
        }
    };

    if (filteredCourses.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-medium text-[color:var(--ai-foreground)]">
                    No courses found matching your criteria.
                </h3>
                <p className="mt-2 text-[color:var(--ai-muted)]">
                    Try adjusting your search or filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any, idx: number) => {
                const { amount, currency, priceId } = getCoursePrice(course);
                const purchased = isPurchased(course.id);
                const isLoading = loadingPayment && loadingCourseId === course.id;

                // Mark top 3 as most popular
                const showPopularBadge = idx < 3;

                return (
                    <motion.div
                        key={course.id}
                        id={course.id}
                        className="group flex flex-col overflow-hidden rounded-xl bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] shadow-md border border-[color:var(--ai-card-border)] hover:border-[color:var(--ai-primary)]/50 hover:shadow-lg transition-all duration-300"
                        variants={courseVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={cardHoverProps}
                    >
                        <div className="relative overflow-hidden">
                            {/* Difficulty badge */}
                            <div className="absolute top-4 left-4 z-20">
                                <Chip
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                    className="text-xs font-medium backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20"
                                >
                                    {course.difficulty || 'Intermediate'}
                                </Chip>
                            </div>
                            {/* Most Popular badge */}
                            {showPopularBadge && (
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/90 text-xs font-semibold text-yellow-900 shadow">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                                        {t('status.mostPopular')}
                                    </span>
                                </div>
                            )}

                            {/* Purchased badge */}
                            {purchased && (
                                <div className="absolute bottom-4 right-4 z-20">
                                    <Chip
                                        variant="solid"
                                        color="success"
                                        size="sm"
                                        className="text-xs font-medium shadow-lg flex items-center gap-1"
                                        startContent={
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        }
                                    >
                                        {t('status.enrolled')}
                                    </Chip>
                                </div>
                            )}

                            {/* Course image */}
                            <div
                                className="relative h-48 w-full cursor-pointer overflow-hidden"
                                onClick={() => handleCourseClick(course)}
                            >
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>                                {/* Course image with fallback handling */}
                                <img
                                    src={products?.find((product: any) => product.id === course.priceProduct?.id)?.images?.[0] || '/placeholder-course.svg'}
                                    alt={course.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.src.includes('placeholder-course.svg')) {
                                            target.src = '/placeholder-course.svg';
                                        }
                                    }}
                                />

                                {/* Course info overlays */}
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs flex items-center">
                                        <svg className="w-3.5 h-3.5 mr-1.5 text-[color:var(--ai-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>                                        <span>{course.duration || ''}</span>
                                    </div>

                                    {course.lessonsCount !== undefined && (
                                        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs flex items-center">
                                            <svg className="w-3.5 h-3.5 mr-1.5 text-[color:var(--ai-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span>{course.lessonsCount} lessons</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                            {/* Course title */}
                            <h3
                                className="mb-2 text-xl font-bold text-[color:var(--ai-foreground)] cursor-pointer hover:text-[color:var(--ai-primary)] transition-colors"
                                onClick={() => handleCourseClick(course)}
                            >
                                {course.name}
                            </h3>

                            {/* Course description */}
                            <p className="mb-4 flex-1 text-sm text-[color:var(--ai-muted)] line-clamp-2"
                                onClick={() => handleCourseClick(course)}
                            >
                                {course.description || ''}
                            </p>

                            {/* Tags */}
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

                            {/* Divider */}
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-[color:var(--ai-card-border)] to-transparent mb-4"></div>

                            <div className="mt-auto flex items-center justify-between gap-2">
                                {/* Price */}
                                <div className="text-xl font-bold text-[color:var(--ai-foreground)]">
                                    {course.isFree ?
                                        <span className="text-green-600 dark:text-green-400">{t('status.free')}</span> :
                                        <span>{amount} {currency}</span>
                                    }
                                </div>

                                {/* Action button */}
                                {purchased ? (
                                    <Button
                                        color="success"
                                        onClick={() => handleCourseClick(course)}
                                        className="rounded-full px-4"
                                        endContent={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        }
                                    >
                                        {t('courseActions.continue')}
                                    </Button>
                                ) : (
                                    isLoading ? (
                                        <LoadingButton />
                                    ) : (
                                        <Button
                                            color="primary"
                                            onClick={() => buyCourse(priceId, course.id)}
                                            className="rounded-full px-4"
                                        >
                                            {course.isFree ? t('courseActions.enroll') : t('courseActions.buyNow')}
                                        </Button>
                                    )
                                )}

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
                                        className="p-2 rounded-full hover:bg-[color:var(--ai-card-bg)] dark:hover:bg-[color:var(--ai-card-border)]/40 transition"
                                        onClick={() => handleShare(course)}
                                    >
                                        <FiLink size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
});

export default CoursesList;

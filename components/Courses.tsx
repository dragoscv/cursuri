'use client';
import { useContext, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import {
    useAuth,
    useCourses,
    useTheme,
    useModal,
    useAdmin,
    useLessons,
    useReviews,
    useUserData,
} from '@/components/contexts/modules';
import { Course as CourseType, UserPaidProduct } from '@/types';
import { StripeProduct } from '@/types/stripe';
import { useTranslations } from 'next-intl';
// Note: The Products context is dynamically imported in the component to support backward compatibility
import { createCheckoutSession } from 'firewand';
import { stripePayments } from '@/utils/firebase/stripe';
import { firebaseApp } from '@/utils/firebase/firebase.config';
import LoadingButton from './Buttons/LoadingButton';
import Login from './Login';
import { Chip, Spinner } from '@heroui/react';
import Button from '@/components/ui/Button';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiClock, FiUsers, FiStar, FiAlertCircle } from './icons/FeatherIcons';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

import { getCoursePrice as getUnifiedCoursePrice } from '@/utils/pricing';

export default function Courses() {
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null); // For animation
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });
    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [controls, isInView]);
    const router = useRouter();
    const t = useTranslations('courses');
    const tNotif = useTranslations('common.notifications');
    const tCommon = useTranslations('common');
    // Use modular contexts
    const { user } = useAuth();
    const { state: coursesState } = useCourses();
    const { courses } = coursesState;
    const { openModal, closeModal } = useModal();
    const toast = useToast();

    // State for products
    const [products] = useState<StripeProduct[]>([]);
    const [userPaidProducts] = useState<UserPaidProduct[]>([]);

    // Use loading states from courses context
    const { courseLoadingStates } = coursesState; // This effect is no longer needed since courseLoadingStates comes from the courses context
    // The courses context handles loading states internally

    const buyCourse = useCallback(
        async (priceId: string, courseId: string) => {
            if (!user) {
                openModal({
                    id: 'login',
                    isOpen: true,
                    hideCloseButton: false,
                    backdrop: 'blur',
                    size: 'full',
                    scrollBehavior: 'inside',
                    isDismissable: true,
                    modalHeader: tCommon('buttons.login'),
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
                        courseId: courseId,
                    },
                });
                toast.showToast({
                    type: 'success',
                    title: tNotif('success.redirectingToPayment'),
                    message: tNotif('success.redirectingToPaymentMessage'),
                    duration: 4000,
                });
                window.location.assign(session.url);
            } catch (error) {
                console.error('Payment error:', error);
                toast.showToast({
                    type: 'error',
                    title: tNotif('error.paymentError'),
                    message: tNotif('error.paymentErrorMessage'),
                    duration: 6000,
                });
            } finally {
                setLoadingPayment(false);
                setLoadingCourseId(null);
            }
        },
        [closeModal, openModal, user, toast]
    );
    const handleCourseClick = useCallback(
        (course: CourseType) => {
            // Navigate to the course page using Next.js client-side navigation
            router.push(`/courses/${course.id}`);
        },
        [router]
    ); // Use unified pricing logic
    const getCoursePrice = useCallback(
        (course: CourseType) => {
            const priceInfo = getUnifiedCoursePrice(course, products);
            return {
                amount: priceInfo.amount,
                currency: priceInfo.currency,
                priceId: priceInfo.priceId,
            };
        },
        [products]
    );
    const isPurchased = useCallback(
        (courseId: string) => {
            return userPaidProducts?.find(
                (userPaidProduct: UserPaidProduct) => userPaidProduct.metadata.courseId === courseId
            );
        },
        [userPaidProducts]
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const courseVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                damping: 12,
                stiffness: 100,
            },
        },
    };    // AI course topics for badges
    const aiTopics = [
        'Neural Networks',
        'Transformers',
        'Computer Vision',
        'NLP',
        'Reinforcement Learning',
        'Deep Learning',
    ];

    // Generate deterministic binary patterns
    const binaryPatterns = useMemo(() => {
        // Create deterministic binary patterns based on index
        const generateBinaryPattern = (index: number) => {
            // Use a formula based on index to get reproducible values
            return Array.from({ length: 20 })
                .map((_, i) => Math.round(Math.abs(Math.sin(index * 0.5 + i * 0.3)) % 2))
                .join('');
        };

        // Pre-generate binary patterns
        return [...Array(30)].map((_, i) => generateBinaryPattern(i));
    }, []);

    return (
        <div id="courses-section" className="w-full py-16 relative" ref={ref}>
            {/* AI-themed background elements */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute left-0 right-0 bg-gradient-to-b from-[color:var(--ai-primary)]/5 to-transparent h-40 -top-10 backdrop-blur-[1px]"></div>

                {/* Binary data streams */}
                <div className="absolute right-0 top-1/4 w-40 h-[500px] opacity-10 overflow-hidden select-none pointer-events-none hidden lg:block">
                    <div className="absolute inset-0 flex flex-col items-end gap-1 text-[10px] font-mono text-[color:var(--ai-primary)] animate-flow-down overflow-hidden whitespace-nowrap">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={`animate-flow-left delay-${i}`}>
                                {binaryPatterns[i]}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute left-0 bottom-1/4 w-40 h-[500px] opacity-10 overflow-hidden select-none pointer-events-none hidden lg:block">
                    <div className="absolute inset-0 flex flex-col items-start gap-1 text-[10px] font-mono text-[color:var(--ai-primary)] animate-flow-up overflow-hidden whitespace-nowrap">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={`animate-flow-right delay-${i}`}>
                                {binaryPatterns[29 - i]}
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
          @keyframes flow-down {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
          @keyframes flow-up {
            0% {
              transform: translateY(100%);
            }
            100% {
              transform: translateY(-100%);
            }
          }
          @keyframes flow-left {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          @keyframes flow-right {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(0%);
            }
          }
          .animate-flow-down {
            animation: flow-down 20s linear infinite;
          }
          .animate-flow-up {
            animation: flow-up 20s linear infinite;
          }
          .animate-flow-left {
            animation: flow-left 15s linear infinite;
          }
          .animate-flow-right {
            animation: flow-right 15s linear infinite;
          }

          /* Animation delay classes */
          .delay-0 {
            animation-delay: 0s;
          }
          .delay-01 {
            animation-delay: 0.1s;
          }
          .delay-02 {
            animation-delay: 0.2s;
          }
          .delay-03 {
            animation-delay: 0.3s;
          }
          .delay-04 {
            animation-delay: 0.4s;
          }
          .delay-05 {
            animation-delay: 0.5s;
          }
          .delay-06 {
            animation-delay: 0.6s;
          }
          .delay-07 {
            animation-delay: 0.7s;
          }
          .delay-08 {
            animation-delay: 0.8s;
          }
          .delay-09 {
            animation-delay: 0.9s;
          }
          .delay-1 {
            animation-delay: 1s;
          }
          .delay-11 {
            animation-delay: 1.1s;
          }
          .delay-12 {
            animation-delay: 1.2s;
          }
          .delay-13 {
            animation-delay: 1.3s;
          }
          .delay-14 {
            animation-delay: 1.4s;
          }
          .delay-15 {
            animation-delay: 1.5s;
          }
          .delay-16 {
            animation-delay: 1.6s;
          }
          .delay-17 {
            animation-delay: 1.7s;
          }
          .delay-18 {
            animation-delay: 1.8s;
          }
          .delay-19 {
            animation-delay: 1.9s;
          }
          .delay-2 {
            animation-delay: 2s;
          }
          .delay-21 {
            animation-delay: 2.1s;
          }
          .delay-22 {
            animation-delay: 2.2s;
          }
          .delay-23 {
            animation-delay: 2.3s;
          }
          .delay-24 {
            animation-delay: 2.4s;
          }
          .delay-25 {
            animation-delay: 2.5s;
          }
          .delay-26 {
            animation-delay: 2.6s;
          }
          .delay-27 {
            animation-delay: 2.7s;
          }
          .delay-28 {
            animation-delay: 2.8s;
          }
          .delay-29 {
            animation-delay: 2.9s;
          }
        `}</style>
            </div>

            {/* Section header */}
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 },
                }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center">
                    <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]/90 border border-[color:var(--ai-secondary)]/30 mb-4">
                        {t('header.badge')}
                    </span>
                    <h2 className="text-3xl font-bold text-[color:var(--ai-foreground)] mb-4 sm:text-4xl">
                        {t('header.title')}
                    </h2>{' '}
                    <p className="max-w-2xl mx-auto text-lg text-[color:var(--ai-muted)]">
                        {t('header.subtitle')}
                    </p>
                </div>
                {/* Filter chips - decorative */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {aiTopics.map((topic) => (
                        <div
                            key={topic}
                            className="py-1.5 px-3 rounded-full text-sm bg-white/10 dark:bg-white/5 text-[color:var(--ai-primary)] dark:text-[color:var(--ai-primary)]/80 border border-[color:var(--ai-card-border)] backdrop-blur-sm cursor-pointer hover:bg-[color:var(--ai-primary)]/10 transition-colors"
                        >
                            {topic}
                        </div>
                    ))}
                </div>{' '}
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate={controls}
            >
                {/* Loading state when courses are being fetched */}
                {courseLoadingStates && courseLoadingStates['all'] === 'loading' && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16">
                        <Spinner size="lg" color="primary" className="mb-4" />
                        <p className="text-[color:var(--ai-muted)] text-lg">{t('loading.loadingCourses')}</p>
                    </div>
                )}
                {/* Error state when courses failed to load */}
                {courseLoadingStates && courseLoadingStates['all'] === 'error' && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <FiAlertCircle className="w-12 h-12 text-[color:var(--ai-danger)] mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{t('loading.failedToLoad')}</h3>
                        <p className="text-[color:var(--ai-muted)] mb-6">{t('loading.errorMessage')}</p>
                        <Button color="primary" onClick={() => window.location.reload()}>
                            {t('loading.refreshPage')}
                        </Button>
                    </div>
                )}{' '}
                {/* Display courses when loaded successfully */}
                {courseLoadingStates &&
                    courseLoadingStates['all'] === 'success' &&
                    courses &&
                    Object.keys(courses).length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-[color:var(--ai-muted)] text-lg">{t('loading.noCourses')}</p>
                        </div>
                    )}{' '}
                {courseLoadingStates &&
                    courseLoadingStates['all'] === 'success' &&
                    courses &&
                    Object.keys(courses).map((key: string) => {
                        const courseData = courses[key];
                        if (!courseData) return null;
                        // Map the course context type to the main Course type
                        const course = {
                            ...courseData,
                            name: courseData.title || courseData.id,
                            title: courseData.title,
                            id: courseData.id,
                            description: courseData.description,
                            imageUrl: courseData.imageUrl,
                            price: courseData.price,
                            priceId: courseData.priceId,
                            status: courseData.status,
                            createdAt: new Date(courseData.createdAt),
                            updatedAt: new Date(courseData.updatedAt),
                            difficulty: courseData.level || 'advanced',
                            duration: `${courseData.duration || 600} minutes`,
                        } as unknown as CourseType;

                        const { amount, currency, priceId } = getCoursePrice(course);
                        const purchased = isPurchased(course.id);
                        const isLoading = loadingPayment && loadingCourseId === course.id;

                        // Assign a random AI topic for demonstration
                        const courseTopic = aiTopics[Math.floor(Math.random() * aiTopics.length)];

                        return (
                            <motion.div
                                key={course.id}
                                id={course.id}
                                className="group flex flex-col overflow-hidden rounded-xl bg-[color:var(--ai-card-bg)] backdrop-blur-sm shadow-lg hover:shadow-xl relative"
                                variants={courseVariants}
                                whileHover={{
                                    y: -10,
                                    transition: { duration: 0.3 },
                                }}
                            >
                                {' '}
                                {/* Decorative gradient border */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-accent)] opacity-0 group-hover:opacity-100 -z-10 blur transition-opacity duration-300 -translate-x-0.5 -translate-y-0.5" />
                                <div className="relative overflow-hidden">
                                    {/* Course difficulty badge */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <Chip
                                            variant="flat"
                                            color="primary"
                                            size="sm"
                                            className="text-xs font-medium backdrop-blur-sm bg-black/20"
                                        >
                                            {course.difficulty
                                                ? t(`card.${course.difficulty.toLowerCase()}`)
                                                : t('card.advanced')}
                                        </Chip>
                                    </div>

                                    {/* Course topic */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <Chip
                                            variant="flat"
                                            color="secondary"
                                            size="sm"
                                            className="text-xs font-medium backdrop-blur-sm bg-black/20"
                                        >
                                            {courseTopic}
                                        </Chip>
                                    </div>

                                    {/* Purchased badge */}
                                    {purchased && (
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <Chip
                                                variant="solid"
                                                color="success"
                                                size="sm"
                                                className="text-xs font-medium"
                                            >
                                                {t('card.enrolled')}
                                            </Chip>
                                        </div>
                                    )}

                                    {/* Course image with futuristic overlay */}
                                    <div
                                        className="relative h-52 w-full cursor-pointer overflow-hidden"
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                                        {/* Tech circuit pattern overlay */}
                                        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-cover mix-blend-overlay opacity-40 z-10"></div>
                                        {/* Interactive hover effect */}
                                        <div className="absolute inset-0 bg-[color:var(--ai-primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                                        {/* Animated glow */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 z-[5]"></div>{' '}
                                        <Image
                                            src={course.imageUrl || '/placeholder-course.svg'}
                                            alt={course.name || 'Course Image'}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            width={400}
                                            height={225}
                                            priority={key === Object.keys(courses)[0]}
                                        />
                                        {/* Futuristic HUD elements */}
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs flex items-center">
                                                <FiClock className="w-3.5 h-3.5 mr-1" />
                                                {course.duration || '10 weeks'}
                                            </div>

                                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs flex items-center">
                                                <FiUsers className="w-3.5 h-3.5 mr-1" />
                                                {t('card.enrolledCount', { count: Math.floor(Math.random() * 200) + 100 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    {/* Course title */}
                                    <h3
                                        className="mb-3 text-xl font-semibold tracking-tight text-[color:var(--ai-foreground)] cursor-pointer group-hover:text-[color:var(--ai-primary)] transition-colors duration-300"
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        {course.name}
                                    </h3>
                                    {/* Course description */}{' '}
                                    <p
                                        className="mb-4 flex-1 text-sm text-[color:var(--ai-muted)] line-clamp-2"
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        {course.description || ''}
                                    </p>
                                    {/* Rating */}
                                    <div
                                        className="mt-auto mb-4 flex items-center"
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <FiStar
                                                    key={rating}
                                                    className={`w-4 h-4 ${rating <= 4 ? 'text-[color:var(--ai-accent)]' : 'text-[color:var(--ai-muted)]/30'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-[color:var(--ai-muted)]">
                                            4.8 (42 reviews)
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        {/* Price with futuristic styling */}
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-300"></div>
                                            <div className="relative text-2xl font-bold text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)]/80 px-3 py-1 rounded-full">
                                                {amount} {currency}
                                            </div>
                                        </div>
                                        {/* Buy button */}
                                        {purchased ? (
                                            <Button
                                                color="success"
                                                variant="shadow"
                                                onClick={() => handleCourseClick(course)}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 transform group-hover:scale-105 transition-all duration-300"
                                            >
                                                {t('continueLearning')}
                                            </Button>
                                        ) : isLoading ? (
                                            <LoadingButton />
                                        ) : (
                                            <Button
                                                color="primary"
                                                onClick={() => buyCourse(priceId, course.id)}
                                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] hover:shadow-lg hover:shadow-[color:var(--ai-primary)]/30 transform group-hover:scale-105 transition-all duration-300"
                                            >
                                                {t('enrollNow')}
                                            </Button>
                                        )}{' '}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
            </motion.div>
        </div>
    );
}

import React, { useContext, useCallback } from 'react';
import { AppContext } from '../AppContext';
import { Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LoadingButton from '../Buttons/LoadingButton';
import { createCheckoutSession } from "firewand";
import { stripePayments } from "@/utils/firebase/stripe";
import { firebaseApp } from "firewand";
import Login from "../Login";
import { Course } from '@/types';

interface CoursesListProps {
    filter?: string;
    category?: string;
}

export const CoursesList: React.FC<CoursesListProps> = ({ filter, category }) => {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('CoursesList must be used within an AppContextProvider');
    }

    const { courses, products, openModal, closeModal, userPaidProducts, user } = context;
    const [loadingPayment, setLoadingPayment] = React.useState(false);
    const [loadingCourseId, setLoadingCourseId] = React.useState<string | null>(null);

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

    const getCoursePrice = useCallback((course: any) => {
        const product = products?.find((product: any) => product.id === course.priceProduct?.id);
        const price = product?.prices?.find((price: any) => price.id === course.price);
        return {
            amount: price?.unit_amount ? price.unit_amount / 100 : course.price || 0,
            currency: price?.currency?.toUpperCase() || 'RON',
            priceId: price?.id
        };
    }, [products]);

    const isPurchased = useCallback((courseId: string) => {
        return userPaidProducts?.find((userPaidProduct: any) =>
            userPaidProduct.metadata?.courseId === courseId
        );
    }, [userPaidProducts]);

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

    if (filteredCourses.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
                    No courses found matching your criteria.
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => {
                const { amount, currency, priceId } = getCoursePrice(course);
                const purchased = isPurchased(course.id);
                const isLoading = loadingPayment && loadingCourseId === course.id;

                return (
                    <motion.div
                        key={course.id}
                        id={course.id}
                        className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300"
                        variants={courseVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
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
                                        Enrolled
                                    </Chip>
                                </div>
                            )}

                            {/* Course image */}
                            <div
                                className="relative h-48 w-full cursor-pointer overflow-hidden"
                                onClick={() => handleCourseClick(course)}
                            >
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>

                                {/* Course image */}
                                <img
                                    src={products?.find((product: any) => product.id === course.priceProduct?.id)?.images?.[0] || '/placeholder-course.jpg'}
                                    alt={course.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Course info overlays */}
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs flex items-center">
                                        <svg className="w-3.5 h-3.5 mr-1.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{course.duration || '8 hours'}</span>
                                    </div>

                                    {course.lessonsCount && (
                                        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs flex items-center">
                                            <svg className="w-3.5 h-3.5 mr-1.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                                className="mb-2 text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                onClick={() => handleCourseClick(course)}
                            >
                                {course.name}
                            </h3>

                            {/* Course description */}
                            <p
                                className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                                onClick={() => handleCourseClick(course)}
                            >
                                {course.description || 'Learn professional skills with this comprehensive course.'}
                            </p>

                            {/* Tags */}
                            {course.tags && course.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {course.tags.slice(0, 3).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4"></div>

                            <div className="mt-auto flex items-center justify-between">
                                {/* Price */}
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {course.isFree ?
                                        <span className="text-green-600 dark:text-green-400">Free</span> :
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
                                        Continue
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
                                            {course.isFree ? 'Enroll' : 'Buy Now'}
                                        </Button>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default CoursesList;

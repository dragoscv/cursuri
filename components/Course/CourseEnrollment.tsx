import React, { useState, useContext } from 'react';
import { Course, ModalProps } from '../../types';
import { AppContext } from '../AppContext';
import { Button, Progress, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck, FiLock, FiClock, FiBook, FiPlayCircle } from '../icons/FeatherIcons';
import { createCheckoutSession } from "firewand";
import { stripePayments } from "@/utils/firebase/stripe";
import { firebaseApp } from "@/utils/firebase/firebase.config";
import Login from "../Login";
import LoadingButton from '../Buttons/LoadingButton';

interface CourseEnrollmentProps {
    course: Course;
    isPurchased: boolean;
}

export const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({ course, isPurchased }) => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('CourseEnrollment must be used within an AppContextProvider');
    }

    const { user, openModal } = context;
    const [isLoading, setIsLoading] = useState(false);

    const handleEnrollClick = async () => {
        setIsLoading(true);

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
                modalBody: <Login onClose={() => {
                    setIsLoading(false);
                    context.closeModal('login');
                }} />,
                headerDisabled: true,
                footerDisabled: true,
                noReplaceURL: true,
                onClose: () => {
                    setIsLoading(false);
                    context.closeModal('login');
                }
            });
            return;
        }

        // For paid courses
        if (!course.isFree) {
            try {
                const priceId = course.priceProduct?.prices?.[0]?.id || '';

                if (!priceId) {
                    console.error("Price ID not found for course:", course.id);
                    setIsLoading(false);
                    return;
                }

                const payments = stripePayments(firebaseApp);
                const session = await createCheckoutSession(payments, {
                    price: priceId,
                    allow_promotion_codes: true,
                    mode: 'payment',
                    metadata: {
                        courseId: course.id
                    }
                });
                window.location.assign(session.url);
            } catch (error) {
                console.error("Payment error:", error);
                setIsLoading(false);
            }
        } else {
            // For free courses - direct enrollment logic
            // Logic for enrolling in free courses would go here
            setIsLoading(false);
        }
    };

    // Format price for display
    const displayPrice = () => {
        if (course.isFree) return 'Free';

        if (course.priceProduct?.prices?.[0]?.unit_amount) {
            const amount = course.priceProduct.prices[0].unit_amount / 100;
            const currency = course.priceProduct.prices[0].currency || 'RON';

            return new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: currency
            }).format(amount);
        }

        return course.price || '$49.99';
    };

    // Calculate discount if there's an original price
    const discountPercentage = course.originalPrice ?
        Math.round(((course.originalPrice - (course.price || 0)) / course.originalPrice) * 100) : 0;

    // If user is already enrolled, show a simplified enrolled view
    if (isPurchased) {
        return (
            <div className="border border-[color:var(--ai-card-border)] rounded-xl p-6 bg-[color:var(--ai-card-bg)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-[color:var(--ai-foreground)]">
                        You're Enrolled
                    </h3>
                    <Chip color="success" variant="flat">
                        Active
                    </Chip>
                </div>

                <p className="text-[color:var(--ai-muted)] mb-6">
                    Continue your learning journey with this course. You have full access to all content and features.
                </p>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <Button
                        color="success"
                        className="w-full bg-gradient-to-r from-[color:var(--ai-success)] to-[color:var(--ai-success-light)] py-6 shadow-md hover:shadow-lg transition-all duration-300"
                        size="lg"
                        href={`/courses/${course.id}/lessons`}
                        startContent={<FiPlayCircle className="text-xl" />}
                    >
                        Continue Learning
                    </Button>
                </motion.div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                        <FiBook className="text-[color:var(--ai-primary)] flex-shrink-0" />
                        <span>{course.lessonsCount || '10+'} lessons available</span>
                    </div>

                    <div className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                        <FiClock className="text-[color:var(--ai-primary)] flex-shrink-0" />
                        <span>Full lifetime access</span>
                    </div>

                    {course.certificate && (
                        <div className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                            <svg className="w-5 h-5 text-[color:var(--ai-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Certificate upon completion</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Regular view for users who are not enrolled yet
    return (
        <div>
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2 items-center">
                        <span className="text-3xl font-bold text-[color:var(--ai-foreground)]">{displayPrice()}</span>

                        {course.originalPrice && (
                            <div className="flex items-center gap-2">
                                <span className="text-[color:var(--ai-muted)] text-lg line-through">
                                    {course.originalPrice}
                                </span>
                                <Chip color="danger" size="sm" variant="flat">
                                    {discountPercentage}% off
                                </Chip>
                            </div>
                        )}
                    </div>

                    {course.limitedOffer && (
                        <div className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
                            <FiClock />
                            <span>Limited time offer</span>
                        </div>
                    )}
                </div>

                {!isPurchased && (
                    <div className="text-sm text-[color:var(--ai-muted)] mb-3">
                        {course.moneyBackGuarantee ?
                            '30-day money-back guarantee' :
                            'This purchase is non-refundable'}
                    </div>
                )}
            </div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
            >
                {isLoading ? (
                    <LoadingButton
                        className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] mb-4 py-6 shadow-md hover:shadow-lg transition-all duration-300"
                        size="lg"
                        loadingText="Processing payment..."
                    />
                ) : (
                    <div className="relative mb-4 overflow-hidden rounded-xl">
                        {/* Decorative corner highlights */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[color:var(--ai-primary)]/30 rounded-tl-lg opacity-70"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[color:var(--ai-secondary)]/30 rounded-br-lg opacity-70"></div>

                        {/* Shimmer effect overlay */}
                        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                            <div className="shimmer-effect"></div>
                        </div>

                        {/* Main button */}
                        <Button
                            color="primary"
                            className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] py-6 font-medium text-white transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-[color:var(--ai-primary)]/20 group relative overflow-hidden"
                            size="lg"
                            onPress={handleEnrollClick}
                            startContent={course.isFree ? <FiCheck className="text-xl" /> : <FiShoppingCart className="text-xl transition-transform duration-500 group-hover:rotate-12" />}
                        >
                            <span className="relative z-10 tracking-wide font-semibold text-white flex items-center gap-2 transition-all duration-300 group-hover:tracking-wider">
                                {course.isFree ? 'Enroll Now - Free' : 'Buy Now'}

                                {/* Arrow that moves on hover */}
                                {!course.isFree && (
                                    <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </span>

                            {/* Background gradient overlay that changes on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ai-primary)]/50 via-[color:var(--ai-secondary)]/50 to-[color:var(--ai-accent)]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                        </Button>
                    </div>
                )}
            </motion.div>

            <div className="space-y-4 mt-6">
                <h4 className="font-bold text-[color:var(--ai-foreground)]">This course includes:</h4>

                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                        <FiBook className="text-[color:var(--ai-primary)] flex-shrink-0" />
                        <span>{course.lessonsCount || '10+'} lessons</span>
                    </li>

                    <li className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                        <FiClock className="text-[color:var(--ai-primary)] flex-shrink-0" />
                        <span>{course.duration || '5 hours'} of content</span>
                    </li>

                    <li className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                        <FiPlayCircle className="text-[color:var(--ai-primary)] flex-shrink-0" />
                        <span>Full lifetime access</span>
                    </li>

                    {course.certificate && (
                        <li className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                            <svg className="w-5 h-5 text-[color:var(--ai-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Certificate of completion</span>
                        </li>
                    )}

                    {course.downloadableResources && (
                        <li className="flex items-center gap-3 text-[color:var(--ai-muted)]">
                            <svg className="w-5 h-5 text-[color:var(--ai-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Downloadable resources</span>
                        </li>
                    )}
                </ul>
            </div>

            {!isPurchased && !user && (
                <div className="mt-6 border-t border-[color:var(--ai-card-border)] pt-4">
                    <Button
                        color="default"
                        variant="flat"
                        className="w-full"
                        onPress={() => {
                            openModal({
                                id: 'login',
                                isOpen: true,
                                modalBody: 'login',
                                modalHeader: 'Login',
                                headerDisabled: true,
                                footerDisabled: true
                            });
                        }}
                    >
                        Sign in to purchase
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CourseEnrollment;

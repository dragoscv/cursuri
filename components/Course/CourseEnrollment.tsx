import React, { useState, useContext } from 'react';
import { Course, ModalProps } from '../../types';
import { AppContext } from '../AppContext';
import { Button, Progress, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck, FiLock, FiClock, FiBook, FiPlayCircle } from '../icons/FeatherIcons';

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

    const handleEnrollClick = () => {
        setIsLoading(true);

        if (!user) {
            openModal({
                id: 'login',
                isOpen: true,
                modalBody: 'login',
                modalHeader: 'Login',
                headerDisabled: true,
                footerDisabled: true,
                onClose: () => {
                    setIsLoading(false);
                }
            });
            return;
        }

        // For paid courses
        if (!course.isFree) {
            openModal({
                id: 'checkout',
                isOpen: true,
                modalBody: React.createElement('div', {}, 'Checkout Component for ' + course.name),
                modalHeader: 'Checkout',
                onClose: () => {
                    setIsLoading(false);
                }
            });
        } else {
            // For free courses - direct enrollment logic
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

    return (
        <div>
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2 items-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{displayPrice()}</span>

                        {course.originalPrice && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-400 text-lg line-through">
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
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {course.moneyBackGuarantee ?
                            '30-day money-back guarantee' :
                            'This purchase is non-refundable'}
                    </div>
                )}
            </div>

            <motion.div
                whileHover={!isPurchased ? { scale: 1.02 } : {}}
                transition={{ duration: 0.2 }}
            >
                {isPurchased ? (
                    <Button
                        color="success"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4 py-6"
                        size="lg"
                        href={`/courses/${course.id}/lessons`}
                        startContent={<FiPlayCircle className="text-xl" />}
                    >
                        Continue Learning
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 py-6"
                        size="lg"
                        onClick={handleEnrollClick}
                        isLoading={isLoading}
                        startContent={course.isFree ? <FiCheck className="text-xl" /> : <FiShoppingCart className="text-xl" />}
                    >
                        {course.isFree ? 'Enroll Now - Free' : 'Buy Now'}
                    </Button>
                )}
            </motion.div>

            <div className="space-y-4 mt-6">
                <h4 className="font-bold text-gray-900 dark:text-white">This course includes:</h4>

                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <FiBook className="text-primary-500 flex-shrink-0" />
                        <span>{course.lessonsCount || '10+'} lessons</span>
                    </li>

                    <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <FiClock className="text-primary-500 flex-shrink-0" />
                        <span>{course.duration || '5 hours'} of content</span>
                    </li>

                    <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <FiPlayCircle className="text-primary-500 flex-shrink-0" />
                        <span>Full lifetime access</span>
                    </li>

                    {course.certificate && (
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-primary-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Certificate of completion</span>
                        </li>
                    )}

                    {course.downloadableResources && (
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-primary-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                        color="default"
                        variant="flat"
                        className="w-full"
                        onClick={() => {
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

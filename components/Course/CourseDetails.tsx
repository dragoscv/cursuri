import React, { useEffect } from 'react';
import { Course, Lesson } from '../../types';
import { Tabs, Tab, Card, Divider } from "@heroui/react";
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiLayers, FiTarget, FiCalendar, FiBookOpen } from '../icons/FeatherIcons';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedLessonsList from '../../components/Lessons/EnhancedLessonsList';

interface CourseDetailsProps {
    course: Course;
    lessons?: Lesson[];
    courseId?: string;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ course, lessons = [], courseId }) => {
    // For handling tab selection in URL
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [selectedTab, setSelectedTab] = React.useState(tabParam || "overview");

    // Update URL when tab changes
    const handleTabChange = (key: React.Key) => {
        setSelectedTab(key as string);
        if (courseId) {
            router.push(`/courses/${courseId}?tab=${key}`, { scroll: false });
        }
    };

    // Update tab state when URL param changes
    useEffect(() => {
        if (tabParam) {
            setSelectedTab(tabParam);
        }
    }, [tabParam]);

    // Sample benefits if not provided
    const benefits = course.benefits || [
        "Learn key concepts and best practices",
        "Build real-world projects",
        "Understand modern development techniques",
        "Gain practical skills employers are looking for"
    ];

    // Sample requirements if not provided
    const requirements = course.requirements || [
        "Basic understanding of programming concepts",
        "Computer with internet connection",
        "Willingness to learn and practice"
    ];

    // Animation variants
    const tabContentVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <Card className="shadow-lg border rounded-2xl border-[color:var(--ai-card-border)] overflow-hidden backdrop-blur-sm">
            <Tabs
                selectedKey={selectedTab}
                onSelectionChange={handleTabChange}
                fullWidth
                size="md"
                color="primary"
                aria-label="Course details tabs"
                disableAnimation={false}
                classNames={{
                    base: "overflow-hidden",
                    tabList: "bg-gradient-to-r from-[color:var(--ai-card-bg)]/80 to-[color:var(--ai-card-bg)]/80 p-2 rounded-t-xl shadow-sm flex justify-center",
                    cursor: "bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 backdrop-blur-sm shadow-sm",
                    tab: "text-sm data-[selected=true]:text-[color:var(--ai-primary)] font-medium relative overflow-visible transition-all px-3 py-2.5 flex-col gap-1 min-w-16",
                    tabContent: "py-5 sm:py-6 px-4 sm:px-6"
                }}
            >
                <Tab
                    key="overview"
                    title={
                        <div className="flex flex-col items-center gap-1">
                            <FiLayers className="text-[color:var(--ai-primary)] flex-shrink-0 w-5 h-5" />
                            <span className="text-xs">Overview</span>
                            {selectedTab === "overview" && (
                                <motion.span
                                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                />
                            )}
                        </div>
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="overview-content"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="space-y-6"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[color:var(--ai-foreground)] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Course Overview</h3>

                            <p className="text-[color:var(--ai-muted)] leading-relaxed">
                                {course.fullDescription || course.description}
                            </p>

                            <div className="relative">
                                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"></div>
                                <div className="pl-4 sm:pl-6">
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                                        <FiTarget className="text-[color:var(--ai-primary)]" />
                                        <span>What You'll Learn</span>
                                    </h3>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ staggerChildren: 0.1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3"
                                    >
                                        {benefits.map((benefit, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white dark:bg-[color:var(--ai-card-bg)]/60 hover:bg-[color:var(--ai-primary)]/10 transition-colors border border-[color:var(--ai-card-border)] shadow-sm"
                                            >
                                                <FiCheckCircle className="text-[color:var(--ai-primary)] mt-0.5 flex-shrink-0" />
                                                <span className="text-sm sm:text-base text-[color:var(--ai-foreground)]">{benefit}</span>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>

                            <Divider className="my-5 sm:my-8 opacity-50" />

                            <div className="relative">
                                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] rounded-full"></div>
                                <div className="pl-4 sm:pl-6">
                                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[color:var(--ai-foreground)] flex items-center gap-2">
                                        <FiCalendar className="text-[color:var(--ai-primary)]" />
                                        <span>Requirements</span>
                                    </h3>

                                    <ul className="space-y-2 sm:space-y-3 pl-1 sm:pl-2">
                                        {requirements.map((requirement, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="text-sm sm:text-base text-[color:var(--ai-muted)] flex items-center gap-2 sm:gap-3 py-1 px-2"
                                            >
                                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex-shrink-0"></span>
                                                {requirement}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Tab>

                <Tab
                    key="content"
                    title={
                        <div className="flex flex-col items-center gap-1">
                            <FiBookOpen className="text-[color:var(--ai-primary)] flex-shrink-0 w-5 h-5" />
                            <span className="text-xs">Content</span>
                            {selectedTab === "content" && (
                                <motion.span
                                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                />
                            )}
                        </div>
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content-content"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[color:var(--ai-foreground)] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Course Content</h3>

                            {courseId && (
                                <div className="bg-white dark:bg-[color:var(--ai-card-bg)]/30 rounded-xl p-1 shadow-inner">
                                    <EnhancedLessonsList
                                        lessons={lessons || []}
                                        course={course}
                                        courseId={courseId}
                                        completedLessons={[]}
                                        userHasAccess={true}
                                    />
                                </div>
                            )}

                            {!courseId && course.modules && course.modules.length > 0 && (
                                <div className="space-y-3 sm:space-y-4">
                                    {course.modules.map((module, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border border-[color:var(--ai-card-border)] rounded-lg overflow-hidden bg-white dark:bg-[color:var(--ai-card-bg)]/60 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="bg-gradient-to-r from-[color:var(--ai-card-bg)]/50 to-[color:var(--ai-card-bg)]/80 p-3 sm:p-4 font-medium border-l-4 border-[color:var(--ai-primary)]">
                                                {module.title || `Module ${index + 1}`}
                                            </div>
                                            <div className="p-3 sm:p-4">
                                                <p className="text-sm sm:text-base text-[color:var(--ai-muted)] mb-2">
                                                    {module.description || "This module covers essential concepts and practical applications."}
                                                </p>
                                                <div className="text-xs sm:text-sm text-[color:var(--ai-muted)] flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M3 6C3 4.34315 4.34315 3 6 3H8C9.65685 3 11 4.34315 11 6V8C11 9.65685 9.65685 11 8 11H6C4.34315 11 3 9.65685 3 8V6Z" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M13 6C13 4.34315 14.3431 3 16 3H18C19.6569 3 21 4.34315 21 6V8C21 9.65685 19.6569 11 18 11H16C14.3431 11 13 9.65685 13 8V6Z" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M3 16C3 14.3431 4.34315 13 6 13H8C9.65685 13 11 14.3431 11 16V18C11 19.6569 9.65685 21 8 21H6C4.34315 21 3 19.6569 3 18V16Z" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M13 16C13 14.3431 14.3431 13 16 13H18C19.6569 13 21 14.3431 21 16V18C21 19.6569 19.6569 21 18 21H16C14.3431 21 13 19.6569 13 18V16Z" stroke="currentColor" strokeWidth="2" />
                                                        </svg>
                                                        {module.lessonCount || "Multiple"} lessons
                                                    </div>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                                            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        {module.duration || "Various"} duration
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {!courseId && (!course.modules || course.modules.length === 0) && lessons.length === 0 && (
                                <div className="bg-[color:var(--ai-card-bg)]/30 rounded-xl p-4 sm:p-6 text-center border border-[color:var(--ai-card-border)]/50 shadow-inner">
                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[color:var(--ai-muted)] mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    <p className="text-sm sm:text-base text-[color:var(--ai-muted)]">
                                        No lessons available yet. Check back later for content updates.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Tab>

                <Tab
                    key="reviews"
                    title={
                        <div className="flex flex-col items-center gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-[color:var(--ai-primary)] flex-shrink-0 w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span className="text-xs">Reviews</span>
                            {selectedTab === "reviews" && (
                                <motion.span
                                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                />
                            )}
                        </div>
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="reviews-content"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[color:var(--ai-foreground)] bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Student Reviews</h3>

                            {course.reviews && course.reviews.length > 0 ? (
                                <div className="space-y-4 sm:space-y-6">
                                    {course.reviews.map((review, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white dark:bg-[color:var(--ai-card-bg)]/60 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-[color:var(--ai-card-border)]"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center text-white font-medium text-base sm:text-lg shadow-md">
                                                    {review.userName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[color:var(--ai-foreground)]">{review.userName || "Anonymous User"}</div>
                                                    <div className="text-xs sm:text-sm text-[color:var(--ai-muted)]">{review.date || "Recently"}</div>
                                                </div>
                                                <div className="ml-auto flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium mr-1">{review.rating || 5}</span>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41393 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="relative pl-3">
                                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[color:var(--ai-primary)]/30 to-[color:var(--ai-secondary)]/30 rounded-full opacity-50"></div>
                                                <p className="text-sm sm:text-base text-[color:var(--ai-muted)] leading-relaxed">
                                                    {review.comment || "This course exceeded my expectations. The content is well-structured and the instructor explains complex concepts clearly."}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[color:var(--ai-card-bg)]/30 rounded-xl p-5 sm:p-8 text-center border border-[color:var(--ai-card-border)]/50 shadow-inner">
                                    <svg className="w-10 h-10 sm:w-16 sm:h-16 text-[color:var(--ai-muted)] mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <p className="text-sm sm:text-base text-[color:var(--ai-muted)]">
                                        No reviews yet. Be the first to review this course after enrollment!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Tab>
            </Tabs>
        </Card>
    );
};

export default CourseDetails;

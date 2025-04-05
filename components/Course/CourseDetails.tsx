import React, { useEffect } from 'react';
import { Course, Lesson } from '../../types';
import { Tabs, Tab, Card, Divider } from "@heroui/react";
import { motion } from 'framer-motion';
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

    return (
        <Card className="shadow-md border border-gray-200 dark:border-gray-700">
            <Tabs
                selectedKey={selectedTab}
                onSelectionChange={handleTabChange}
                fullWidth
                size="lg"
                color="primary"
                classNames={{
                    tabList: "bg-gray-100 dark:bg-gray-800/50",
                    cursor: "bg-gradient-to-r from-indigo-500 to-purple-500",
                    tab: "data-[selected=true]:text-primary-600 dark:data-[selected=true]:text-primary-400"
                }}
            >
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center gap-2">
                            <FiLayers />
                            <span>Overview</span>
                        </div>
                    }
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Course Overview</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {course.fullDescription || course.description}
                        </p>

                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            <FiTarget className="text-primary-500" />
                            <span>What You'll Learn</span>
                        </h3>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"
                        >
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <Divider className="my-6" />

                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                            <FiCalendar className="text-primary-500" />
                            <span>Requirements</span>
                        </h3>

                        <ul className="space-y-2 mb-6">
                            {requirements.map((requirement, index) => (
                                <li key={index} className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
                                    {requirement}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Tab>
                <Tab
                    key="content"
                    title={
                        <div className="flex items-center gap-2">
                            <FiBookOpen />
                            <span>Content</span>
                        </div>
                    }
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Course Content</h3>

                        {courseId && (
                            <EnhancedLessonsList
                                lessons={lessons || []}
                                course={course}
                                courseId={courseId}
                                completedLessons={[]}
                            />
                        )}

                        {!courseId && course.modules && course.modules.length > 0 && (
                            <div className="space-y-4">
                                {course.modules.map((module, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 font-medium">
                                            {module.title || `Module ${index + 1}`}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                {module.description || "This module covers essential concepts and practical applications."}
                                            </p>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {module.lessonCount || "Multiple"} lessons • {module.duration || "Various"} duration
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!courseId && (!course.modules || course.modules.length === 0) && lessons.length === 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    No lessons available yet. Check back later for content updates.
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>
                <Tab
                    key="reviews"
                    title={
                        <div className="flex items-center gap-2">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41393 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Reviews</span>
                        </div>
                    }
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Student Reviews</h3>

                        {course.reviews && course.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {course.reviews.map((review, index) => (
                                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                                                {review.userName?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div className="font-medium">{review.userName || "Anonymous User"}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{review.date || "Recently"}</div>
                                            </div>
                                            <div className="ml-auto flex items-center">
                                                <span className="text-amber-500 mr-1">{review.rating || 5}</span>
                                                <svg width="16px" height="16px" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41393 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {review.comment || "This course exceeded my expectations. The content is well-structured and the instructor explains complex concepts clearly."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    No reviews yet. Be the first to review this course after enrollment!
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>
        </Card>
    );
};

export default CourseDetails;

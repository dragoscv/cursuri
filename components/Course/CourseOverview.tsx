import React from 'react';
import { motion } from 'framer-motion';
import { Course } from '@/types';
import { FiCheckCircle, FiTarget, FiCalendar, FiBookOpen } from '../icons/FeatherIcons';

interface CourseOverviewProps {
    course: Course;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
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
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Course Description */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/5 rounded-xl p-4 border border-[color:var(--ai-card-border)]/50 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                            <FiBookOpen className="text-[color:var(--ai-primary)]" />
                            Course Description
                        </h3>
                    </div>
                </div>
                <p className="text-[color:var(--ai-muted)] leading-relaxed mt-2">
                    {course.fullDescription || course.description}
                </p>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                >
                    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                        <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                            <FiTarget className="mr-2 text-[color:var(--ai-primary)]" />
                            <span>What You'll Learn</span>
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-[color:var(--ai-primary)]/5 transition-colors"
                                >
                                    <FiCheckCircle className="text-[color:var(--ai-primary)] mt-1 flex-shrink-0" />
                                    <span className="text-sm text-[color:var(--ai-muted)]">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Requirements */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                >
                    <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                        <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                            <FiCalendar className="mr-2 text-[color:var(--ai-primary)]" />
                            <span>Requirements</span>
                        </h3>
                    </div>
                    <div className="p-4">
                        <ul className="space-y-3">
                            {requirements.map((requirement, index) => (
                                <motion.li
                                    key={index}
                                    variants={itemVariants}
                                    className="flex items-center gap-3 text-sm text-[color:var(--ai-muted)]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--ai-primary)] flex-shrink-0"></div>
                                    {requirement}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </motion.div>

            {/* Additional Course Info if available */}
            {course.additionalInfo && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={itemVariants}
                        className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
                    >
                        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[color:var(--ai-primary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Additional Information</span>
                            </h3>
                        </div>
                        <div className="p-4">
                            <p className="text-[color:var(--ai-muted)] leading-relaxed">
                                {course.additionalInfo}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default CourseOverview;
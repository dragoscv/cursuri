import React from 'react';
import { motion } from 'framer-motion';
import { Course } from '@/types';
import { FiCheckCircle, FiTarget, FiCalendar, FiBookOpen, FiFileText, FiAward } from '../icons/FeatherIcons';

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
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 15
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
                className="bg-gradient-to-r from-[color:var(--ai-primary)]/5 via-[color:var(--ai-secondary)]/5 to-[color:var(--ai-accent)]/5 backdrop-blur-sm rounded-xl p-5 border border-[color:var(--ai-card-border)]/50 shadow-sm"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <FiBookOpen className="text-[color:var(--ai-primary)]" />
                        Course Description
                    </h3>

                    {course.level && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)]">
                            <FiAward className="mr-1 h-3.5 w-3.5" />
                            {course.level}
                        </span>
                    )}
                </div>

                <p className="text-[color:var(--ai-muted)] leading-relaxed">
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
                                <FiFileText className="mr-2 text-[color:var(--ai-primary)]" />
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

            {/* Course Instructor */}
            {course.instructor && (
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
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>Instructor</span>
                            </h3>
                        </div>

                        <div className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center text-white font-bold text-xl">
                                    {course.instructor.photoUrl ? (
                                        <img
                                            src={course.instructor.photoUrl}
                                            alt={course.instructor.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        course.instructor.name?.charAt(0) || "I"
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-[color:var(--ai-foreground)] font-medium">
                                        {course.instructor.name}
                                    </h4>
                                    {course.instructor.title && (
                                        <p className="text-sm text-[color:var(--ai-muted)]">
                                            {course.instructor.title}
                                        </p>
                                    )}
                                    {course.instructor.bio && (
                                        <p className="text-sm text-[color:var(--ai-muted)] mt-2 leading-relaxed">
                                            {course.instructor.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default CourseOverview;
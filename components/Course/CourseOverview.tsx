import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Course } from '@/types';
import { useTranslations } from 'next-intl';
import { FiCheckCircle, FiTarget, FiCalendar, FiBookOpen, FiFileText, FiAward, FiUser, FiLink } from '../icons/FeatherIcons';
import { AppContext } from '../AppContext';

// ...existing code...
import { CourseOverviewProps } from "@/types";
// ...existing code...


const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
    const context = useContext(AppContext);
    const t = useTranslations('courses.overview');

    // Sample benefits if not provided or empty
    const benefits = (course.benefits && course.benefits.length > 0)
        ? course.benefits
        : [
            t('sampleBenefits.keyConceptsAndBestPractices'),
            t('sampleBenefits.buildRealWorldProjects'),
            t('sampleBenefits.modernDevelopmentTechniques'),
            t('sampleBenefits.practicalSkills')
        ];

    // Sample requirements if not provided or empty
    const requirements = (course.requirements && course.requirements.length > 0)
        ? course.requirements
        : [
            t('sampleRequirements.basicProgramming'),
            t('sampleRequirements.computerAndInternet'),
            t('sampleRequirements.willingnessToLearn')
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
                type: "spring" as const,
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
                        {t('courseDescription')}
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
                            <span>{t('whatYouWillLearn')}</span>
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
                            <span>{t('requirements')}</span>
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

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
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
                                <FiLink className="mr-2 text-[color:var(--ai-primary)]" />
                                <span>{t('prerequisites')}</span>
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">                                {course.prerequisites.map((prerequisiteId, index) => {
                                // Look up the prerequisite course from context
                                const prerequisiteCourse = context?.courses?.[prerequisiteId];

                                return (
                                    <motion.div
                                        key={prerequisiteId}
                                        variants={itemVariants}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-md bg-[color:var(--ai-primary)]/10 flex items-center justify-center flex-shrink-0">
                                            <FiLink className="text-[color:var(--ai-primary)]" size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <a
                                                href={`/courses/${prerequisiteId}`}
                                                className="text-sm font-medium text-[color:var(--ai-foreground)] hover:text-[color:var(--ai-primary)] transition-colors"
                                            >
                                                {prerequisiteCourse ? prerequisiteCourse.name : `Course ${prerequisiteId}`}
                                            </a>
                                        </div>
                                        <a
                                            href={`/courses/${prerequisiteId}`}
                                            className="text-xs px-3 py-1 rounded-full bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/20 transition-colors"
                                        >
                                            {t('viewCourse')}
                                        </a>
                                    </motion.div>
                                );
                            })}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

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
                                <span>{t('additionalInformation')}</span>
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
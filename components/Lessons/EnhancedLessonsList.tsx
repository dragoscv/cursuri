import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiBookOpen, FiLock, FiCheckCircle, FiPlay } from '@/components/icons/FeatherIcons';
import { motion } from 'framer-motion';

export default function EnhancedLessonsList({ lessons, userHasAccess = false }: { lessons: any[]; userHasAccess?: boolean }) {
    const params = useParams();
    const courseId = params.courseId;

    if (!lessons || lessons.length === 0) {
        return (
            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 border border-[color:var(--ai-card-border)]/50 shadow-xl text-center py-12">
                <FiBookOpen className="mx-auto text-4xl text-[color:var(--ai-primary)] mb-4" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">No lessons available yet</h3>
                <p className="text-[color:var(--ai-muted)] mt-2">
                    This course is still being developed. Check back soon for new content!
                </p>
            </div>
        );
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Sort lessons by their order property
    const sortedLessons = [...lessons].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
    });

    return (
        <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-[color:var(--ai-accent)]/10 backdrop-blur-sm rounded-2xl p-6 border border-[color:var(--ai-card-border)]/50 shadow-xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] bg-clip-text text-transparent">Course Content</h2>
                <p className="text-[color:var(--ai-muted)]">{lessons.length} lessons • {Math.ceil(lessons.reduce((total, lesson) => total + (lesson.duration || 30), 0) / 60)} hours total</p>
            </div>

            <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {sortedLessons.map((lesson, index) => (
                    <motion.div
                        key={lesson.id}
                        variants={itemVariants}
                        className={`relative rounded-xl p-4 transition-all duration-300 group ${userHasAccess
                            ? 'bg-[color:var(--ai-card-bg)]/80 hover:bg-[color:var(--ai-card-bg)] cursor-pointer shadow hover:shadow-md border border-[color:var(--ai-card-border)]'
                            : 'bg-[color:var(--ai-card-bg)]/50 cursor-not-allowed border border-[color:var(--ai-card-border)]/50'
                            }`}
                    >
                        {/* Lesson Index Circle */}
                        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[color:var(--ai-primary)] text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                        </div>

                        {userHasAccess ? (
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`} className="block">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-md bg-[color:var(--ai-primary)]/10 p-2 mt-1">
                                            <FiPlay className="h-4 w-4 text-[color:var(--ai-primary)]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium group-hover:text-[color:var(--ai-primary)] transition-colors duration-300">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-[color:var(--ai-muted)] line-clamp-2 mt-1">
                                                {lesson.description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-[color:var(--ai-muted)]">{lesson.duration || 30} min</span>
                                        <FiCheckCircle className="h-5 w-5 text-[color:var(--ai-success)]" />
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-md bg-[color:var(--ai-primary)]/5 p-2 mt-1">
                                        <FiLock className="h-4 w-4 text-[color:var(--ai-muted)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[color:var(--ai-muted)]">
                                            {lesson.title}
                                        </h3>
                                        <p className="text-sm text-[color:var(--ai-muted)]/70 line-clamp-2 mt-1">
                                            {lesson.description || 'No description available'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-[color:var(--ai-muted)]/70">{lesson.duration || 30} min</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

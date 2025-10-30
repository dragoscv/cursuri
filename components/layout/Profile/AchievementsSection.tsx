import React, { useEffect } from 'react';
import { Card, CardBody, Chip, Tooltip, Spinner } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiAward, FiLock } from '@/components/icons/FeatherIcons';
import useAchievements from './hooks/useAchievements';
import AchievementBadge from './AchievementBadge';
import { motion } from 'framer-motion';

export default function AchievementsSection() {
    const { achievements, loading, error, syncAchievements } = useAchievements();

    // Sync achievements on first load
    useEffect(() => {
        if (!loading && !error) {
            syncAchievements();
        }
    }, [loading]);

    if (loading) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-accent)] via-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-accent)]/10">
                            <FiAward className="text-[color:var(--ai-accent)]" />
                        </span>
                        Achievements & Badges
                    </h2>
                    <div className="flex justify-center py-8">
                        <Spinner color="primary" />
                    </div>
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
                <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-error)] to-[color:var(--ai-error-dark)]"></div>
                <CardBody className="p-6">
                    <h2 className="text-lg font-semibold mb-5 text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-accent)]/10">
                            <FiAward className="text-[color:var(--ai-accent)]" />
                        </span>
                        Achievements & Badges
                    </h2>
                    <div className="text-[color:var(--ai-error)]">
                        Failed to load achievements. Please try again later.
                    </div>
                    <Button
                        color="primary"
                        variant="flat"
                        className="mt-4"
                        onClick={() => syncAchievements()}
                    >
                        Retry
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // Split achievements into unlocked and locked
    const unlockedAchievements = achievements.filter(ach => ach.isUnlocked);
    const lockedAchievements = achievements.filter(ach => !ach.isUnlocked);

    return (
        <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-md overflow-hidden mb-8">
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--ai-accent)] via-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"></div>
            <CardBody className="p-6">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center gap-2">
                        <span className="p-1.5 rounded-full bg-[color:var(--ai-accent)]/10">
                            <FiAward className="text-[color:var(--ai-accent)]" />
                        </span>
                        Achievements & Badges
                    </h2>
                    <Button
                        color="primary"
                        variant="ghost"
                        size="sm"
                        onClick={() => syncAchievements()}
                    >
                        Check for New
                    </Button>
                </div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 ? (
                    <div className="mb-6">
                        <h3 className="text-md font-medium mb-3 text-[color:var(--ai-foreground)]">
                            Your Achievements ({unlockedAchievements.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {unlockedAchievements.map((ach, index) => (
                                <motion.div
                                    key={ach.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col items-center bg-[color:var(--ai-card-bg)]/50 p-4 rounded-lg border border-[color:var(--ai-card-border)]/40 hover:shadow-md transition-all"
                                >                                <div className="w-16 h-16 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center mb-3">
                                        {ach.id ? (
                                            <AchievementBadge id={ach.id} size={48} />
                                        ) : (
                                            <FiAward className="w-8 h-8 text-[color:var(--ai-accent)]" />
                                        )}
                                    </div>
                                    <Chip color={ach.badgeColor as any || 'primary'} variant="solid" className="mb-2">
                                        {ach.title}
                                    </Chip>
                                    <div className="text-sm text-[color:var(--ai-foreground)] font-medium mb-1 text-center">{ach.description}</div>
                                    <div className="text-xs text-[color:var(--ai-muted)]">
                                        {ach.date instanceof Date
                                            ? ach.date.toLocaleDateString()
                                            : typeof ach.date === 'string'
                                                ? new Date(ach.date).toLocaleDateString()
                                                : ach.date?.toDate()?.toLocaleDateString() || 'Unknown date'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center mb-3 mx-auto">
                            <FiAward className="w-8 h-8 text-[color:var(--ai-accent)]" />
                        </div>
                        <p className="text-[color:var(--ai-muted)] mb-3">You haven't earned any achievements yet.</p>
                        <p className="text-sm text-[color:var(--ai-muted)]">Complete courses and lessons to unlock achievements!</p>
                    </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <div>
                        <h3 className="text-md font-medium mb-3 text-[color:var(--ai-foreground)]">
                            Achievements to Unlock ({lockedAchievements.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {lockedAchievements.map((ach, index) => (
                                <motion.div
                                    key={ach.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className="flex flex-col items-center bg-[color:var(--ai-card-bg)]/30 p-4 rounded-lg border border-dashed border-[color:var(--ai-card-border)]/30"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[color:var(--ai-muted)]/10 flex items-center justify-center mb-3 relative">
                                        <div className="absolute inset-0 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <FiLock className="w-6 h-6 text-[color:var(--ai-muted)]" />
                                        </div>
                                        {ach.imageUrl ? (
                                            <img
                                                src={ach.imageUrl}
                                                alt={ach.title}
                                                className="w-12 h-12 opacity-30"
                                            />
                                        ) : (
                                            <FiAward className="w-8 h-8 text-[color:var(--ai-muted)] opacity-30" />
                                        )}
                                    </div>
                                    <Tooltip content="Achievement locked - keep learning to unlock!">
                                        <Chip color="default" variant="flat" className="mb-2">
                                            {ach.title}
                                        </Chip>
                                    </Tooltip>
                                    <div className="text-sm text-[color:var(--ai-muted)] mb-1 text-center">{ach.description}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

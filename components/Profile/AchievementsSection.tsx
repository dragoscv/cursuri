import React, { useContext, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardBody, Chip, Tooltip, Spinner } from '@heroui/react';
import Button from '@/components/ui/Button';
import { FiAward, FiLock } from '@/components/icons/FeatherIcons';
import useAchievements from './hooks/useAchievements';
import AchievementBadge from './AchievementBadge';
import { motion } from 'framer-motion';

export default function AchievementsSection() {
    const t = useTranslations('profile.achievements');
    const { achievements, loading, error, syncAchievements } = useAchievements();

    // Sync achievements on first load
    useEffect(() => {
        if (!loading && !error) {
            syncAchievements();
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-accent)]/10 via-[color:var(--ai-accent)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiAward className="mr-2 text-[color:var(--ai-accent)]" />
                                <span>{t('title')}</span>
                            </h3>
                        </div>
                        <div className="flex justify-center py-8">
                            <Spinner color="primary" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="bg-gradient-to-r from-[color:var(--ai-accent)]/10 via-[color:var(--ai-accent)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiAward className="mr-2 text-[color:var(--ai-accent)]" />
                                <span>{t('title')}</span>
                            </h3>
                        </div>
                        <div className="text-[color:var(--ai-error)]">
                            {t('loadError')}
                        </div>
                        <Button
                            color="primary"
                            variant="flat"
                            className="mt-4"
                            onClick={() => syncAchievements()}
                        >
                            {t('retry')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Split achievements into unlocked and locked
    const unlockedAchievements = achievements.filter(ach => ach.isUnlocked);
    const lockedAchievements = achievements.filter(ach => !ach.isUnlocked);

    return (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                <div className="p-5">
                    <div className="bg-gradient-to-r from-[color:var(--ai-accent)]/10 via-[color:var(--ai-accent)]/5 to-transparent py-3 px-4 -m-5 mb-4 border-b border-[color:var(--ai-card-border)]">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                                <FiAward className="mr-2 text-[color:var(--ai-accent)]" />
                                <span>{t('title')}</span>
                            </h3>
                            <Button
                                color="primary"
                                variant="ghost"
                                size="sm"
                                onClick={() => syncAchievements()}
                            >
                                {t('checkForNew')}
                            </Button>
                        </div>
                    </div>

                    {/* Unlocked Achievements */}
                    {unlockedAchievements.length > 0 ? (
                        <div className="mb-6">
                            <h3 className="text-md font-medium mb-3 text-[color:var(--ai-foreground)]">
                                {t('yourAchievements')} ({unlockedAchievements.length})
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
                            <p className="text-[color:var(--ai-muted)] mb-3">{t('noAchievements')}</p>
                            <p className="text-sm text-[color:var(--ai-muted)]">{t('unlockMessage')}</p>
                        </div>
                    )}

                    {/* Locked Achievements */}
                    {lockedAchievements.length > 0 && (
                        <div>
                            <h3 className="text-md font-medium mb-3 text-[color:var(--ai-foreground)]">
                                {t('achievementsToUnlock')} ({lockedAchievements.length})
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
                                        <Tooltip content={t('achievementLocked')}>
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
                </div>
            </Card>
        </div>
    );
}

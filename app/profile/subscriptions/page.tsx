'use client';

import React, { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@heroui/react';
import { FiCreditCard } from '@/components/icons/FeatherIcons';
import SubscriptionManagement from '@/components/Profile/SubscriptionManagement';
import { AppContext } from '@/components/AppContext';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
    const t = useTranslations('profile.subscriptionPage');
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        throw new Error('AppContext not found');
    }

    const { user } = context;

    // Redirect if not logged in
    React.useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[color:var(--ai-background)]">
            <div className="container mx-auto px-4 py-6">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ai-foreground)] mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-[color:var(--ai-muted)]">{t('description')}</p>
                </motion.div>

                {/* Subscription Management Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden">
                        <CardBody className="p-6">
                            <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-primary)]/5 to-transparent py-3 px-4 -mx-6 -mt-6 mb-6 border-b border-[color:var(--ai-card-border)]">
                                <h2 className="text-lg font-semibold text-[color:var(--ai-foreground)] flex items-center">
                                    <FiCreditCard className="mr-2 text-[color:var(--ai-primary)]" />
                                    <span>{t('manageSubscription')}</span>
                                </h2>
                            </div>

                            <SubscriptionManagement />
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-6"
                >
                    <Card className="border border-[color:var(--ai-card-border)] bg-[color:var(--ai-card-bg)]/50 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)] mb-2">
                                {t('help.title')}
                            </h3>
                            <p className="text-sm text-[color:var(--ai-muted)]">
                                {t('help.description')}
                            </p>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

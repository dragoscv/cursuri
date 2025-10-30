'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';
import { Progress } from '@heroui/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsent: React.FC = () => {
    const [accepted, setAccepted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const timeoutDuration = 60; // 60 seconds

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("Missing AppContext");
    }

    // Check if cookies were already accepted
    useEffect(() => {
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');

        if (cookiesAccepted) {
            setAccepted(true);
        } else {
            setVisible(true);

            // Start progress timer for auto-accept
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsedSeconds = (Date.now() - startTime) / 1000;
                const newProgress = Math.min((elapsedSeconds / timeoutDuration) * 100, 100);
                setProgress(newProgress);

                if (elapsedSeconds >= timeoutDuration) {
                    handleAccept();
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        }

        // Return undefined for the case where cookies are already accepted
        return undefined;
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setAccepted(true);
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookiesAccepted', 'minimal');
        setAccepted(true);
        setVisible(false);
    };

    if (accepted || !visible) {
        return null;
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50"
                >
                    <div className="bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] rounded-xl shadow-xl border border-[color:var(--ai-card-border)] p-4 backdrop-blur-md backdrop-saturate-150">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[color:var(--ai-foreground)]">Cookie Consent</h3>
                                <div className="text-xs text-[color:var(--ai-muted)]">
                                    Auto-accept in {Math.max(Math.ceil(timeoutDuration - (progress / 100 * timeoutDuration)), 0)}s
                                </div>
                            </div>

                            <Progress
                                aria-label="Auto-accept countdown"
                                value={progress}
                                className="h-1"
                                color="primary"
                            />

                            <p className="text-sm text-[color:var(--ai-muted)]">
                                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies, our{' '}
                                <Link href="/privacy-policy" className="text-[color:var(--ai-primary)] hover:underline">
                                    Privacy Policy
                                </Link>,{' '}
                                <Link href="/terms-conditions" className="text-[color:var(--ai-primary)] hover:underline">
                                    Terms and Conditions
                                </Link>, and our{' '}
                                <Link href="/gdpr" className="text-[color:var(--ai-primary)] hover:underline">
                                    GDPR Policy
                                </Link>.
                            </p>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="light"
                                    color="default"
                                    size="sm"
                                    onClick={handleDecline}
                                >
                                    Decline
                                </Button>
                                <Button
                                    color="primary"
                                    size="sm"
                                    onClick={handleAccept}
                                    className="bg-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/90"
                                >
                                    Accept All
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
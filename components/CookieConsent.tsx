'use client'

import { useState, useEffect, useContext } from 'react'
import { AppContext } from './AppContext'
import { Button, Progress } from '@heroui/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const CookieConsent = () => {
    const [accepted, setAccepted] = useState(false)
    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const timeoutDuration = 60 // 60 seconds (changed from 10 seconds)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("Missing AppContext")
    }

    // Check if cookies were already accepted
    useEffect(() => {
        const cookiesAccepted = localStorage.getItem('cookiesAccepted')
        if (cookiesAccepted) {
            setAccepted(true)
        } else {
            setVisible(true)

            // Start progress timer for auto-accept
            const startTime = Date.now()
            const interval = setInterval(() => {
                const elapsedSeconds = (Date.now() - startTime) / 1000
                const newProgress = Math.min((elapsedSeconds / timeoutDuration) * 100, 100)
                setProgress(newProgress)

                if (elapsedSeconds >= timeoutDuration) {
                    handleAccept()
                    clearInterval(interval)
                }
            }, 100)

            return () => clearInterval(interval)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookiesAccepted', 'true')
        setAccepted(true)
        setVisible(false)
    }

    const handleDecline = () => {
        // Still set as accepted for UX purposes, but could implement 
        // different behavior for declined cookies if needed
        localStorage.setItem('cookiesAccepted', 'minimal')
        setAccepted(true)
        setVisible(false)
    }

    if (accepted || !visible) return null

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 backdrop-blur-md backdrop-saturate-150">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cookie Consent</h3>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Auto-accept in {Math.max(Math.ceil(timeoutDuration - (progress / 100 * timeoutDuration)), 0)}s
                                </div>
                            </div>

                            <Progress
                                aria-label="Auto-accept countdown"
                                value={progress}
                                className="h-1"
                                color="primary"
                            />

                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies, our{' '}
                                <Link href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Privacy Policy
                                </Link>,{' '}
                                <Link href="/terms-conditions" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Terms and Conditions
                                </Link>, and our{' '}
                                <Link href="/gdpr" className="text-indigo-600 dark:text-indigo-400 hover:underline">
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
                                >
                                    Accept All
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CookieConsent
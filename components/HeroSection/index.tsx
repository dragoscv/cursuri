'use client'

import React from 'react'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth, useModal } from '@/components/contexts/hooks'
import Login from '@/components/Login'
import ParticlesAnimation from './ParticlesAnimation'
import TechIcons from './TechIcons'
import { useHeroStats } from './hooks/useHeroStats'

export default function HeroSection() {
    const router = useRouter()
    const { user } = useAuth()
    const { openModal, closeModal } = useModal()
    const stats = useHeroStats()

    const handleGetStarted = () => {
        if (!user) {
            openModal({
                id: 'login',
                isOpen: true,
                hideCloseButton: false,
                backdrop: 'blur',
                size: 'full',
                scrollBehavior: 'inside',
                isDismissable: true,
                modalHeader: 'Autentificare',
                modalBody: <Login onClose={() => closeModal('login')} />,
                headerDisabled: true,
                footerDisabled: true,
                noReplaceURL: true,
                onClose: () => closeModal('login'),
            })
        } else {
            // Smooth scroll to courses section
            const coursesSection = document.getElementById('courses-section')
            coursesSection?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="relative w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 overflow-hidden">
            {/* Particle animation */}
            <ParticlesAnimation />

            {/* Tech stack icons */}
            <TechIcons technologies={stats.topTechnologies} />

            {/* Circuit pattern overlay */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    <pattern id="circuit-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="20" height="20" fill="none" />
                        <path d="M10,0 L10,10 M0,10 L20,10" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="10" cy="10" r="2" fill="currentColor" />
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
                </svg>
            </div>

            {/* Hero content */}
            <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center min-h-[80vh] relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Dezvoltă-ți cariera în
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            {' '}programare
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                        Cursuri practice de programare pentru dezvoltatori care vor să își accelereze cariera.
                        Învață tehnologii moderne direct de la experți în domeniu.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                        <Button
                            onClick={handleGetStarted}
                            size="lg"
                            color="primary"
                            variant="solid"
                            className="px-8 py-6"
                        >
                            Începe acum
                        </Button>

                        <Button
                            onClick={() => {
                                const techStackSection = document.getElementById('tech-stack-section')
                                techStackSection?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            size="lg"
                            color="secondary"
                            variant="ghost"
                            className="px-8 py-6 border border-gray-300 text-white"
                        >
                            Explorează tehnologiile
                        </Button>
                    </div>

                    {/* Stats display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
                        <div className="bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalCourses}+</div>
                            <div className="text-gray-300 text-sm">Cursuri</div>
                        </div>

                        <div className="bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalStudents}+</div>
                            <div className="text-gray-300 text-sm">Studenți</div>
                        </div>

                        <div className="bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalReviews}+</div>
                            <div className="text-gray-300 text-sm">Recenzii</div>
                        </div>

                        <div className="bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-30 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl md:text-4xl font-bold text-white">{stats.avgRating}</div>
                            <div className="text-gray-300 text-sm">Rating mediu</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

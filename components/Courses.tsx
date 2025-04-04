'use client'
import { useContext, useEffect, useCallback, useState, useRef, useMemo } from "react"
import { AppContext } from "@/components/AppContext"
import Course from "@/components/Course/Course"
import { createCheckoutSession } from "@invertase/firestore-stripe-payments";
import { stripePayments } from "@/utils/firebase/stripe";
import { firebaseApp } from "@/utils/firebase/firebase.config";
import LoadingButton from "./Buttons/LoadingButton";
import Login from "./Login";
import { Button, Badge, Chip } from "@heroui/react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRouter } from "next/navigation";  // Import Next.js router
import { ModalProps } from "@/types";

export default function Courses() {
    const router = useRouter();  // Initialize the router
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)

    // For animation
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: false, amount: 0.2 })

    useEffect(() => {
        if (isInView) {
            controls.start('visible')
        }
    }, [controls, isInView])

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, products, openModal, closeModal, userPaidProducts, user } = context

    const buyCourse = useCallback(async (priceId: string, courseId: string) => {
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
            return
        }
        setLoadingPayment(true)
        setLoadingCourseId(courseId)

        const payments = stripePayments(firebaseApp);
        try {
            const session = await createCheckoutSession(payments, {
                price: priceId,
                allow_promotion_codes: true,
                mode: 'payment',
                metadata: {
                    courseId: courseId
                }
            })
            window.location.assign(session.url);
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setLoadingPayment(false)
            setLoadingCourseId(null)
        }

    }, [closeModal, openModal, user]);

    const handleCourseClick = useCallback((course: any) => {
        // Navigate to the dedicated course page instead of opening a modal
        router.push(`/courses/${course.id}`);
    }, [router]);

    const getCoursePrice = useCallback((course: any) => {
        const product = products?.find((product: any) => product.id === course.priceProduct.id);
        const price = product?.prices.find((price: any) => price.id === course.price);
        return {
            amount: price?.unit_amount / 100,
            currency: price?.currency.toUpperCase(),
            priceId: price?.id
        };
    }, [products]);

    const isPurchased = useCallback((courseId: string) => {
        return userPaidProducts?.find((userPaidProduct: any) => userPaidProduct.metadata.courseId === courseId);
    }, [userPaidProducts]);

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

    const courseVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };

    // AI course topics for badges
    const aiTopics = [
        "Neural Networks",
        "Transformers",
        "Computer Vision",
        "NLP",
        "Reinforcement Learning",
        "Deep Learning"
    ];

    // Generate deterministic binary patterns
    const binaryPatterns = useMemo(() => {
        // Create deterministic binary patterns based on index
        const generateBinaryPattern = (index: number) => {
            // Use a formula based on index to get reproducible values
            return Array.from({ length: 20 }).map((_, i) =>
                Math.round(Math.abs(Math.sin(index * 0.5 + i * 0.3)) % 2)
            ).join('');
        };

        // Pre-generate binary patterns
        return [...Array(30)].map((_, i) => generateBinaryPattern(i));
    }, []);

    return (
        <div id="courses-section" className="w-full py-16 relative" ref={ref}>
            {/* AI-themed background elements */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute left-0 right-0 bg-gradient-to-b from-indigo-900/5 to-transparent h-40 -top-10 backdrop-blur-[1px]"></div>

                {/* Binary data streams */}
                <div className="absolute right-0 top-1/4 w-40 h-[500px] opacity-10 overflow-hidden select-none pointer-events-none hidden lg:block">
                    <div className="absolute inset-0 flex flex-col items-end gap-1 text-[10px] font-mono text-indigo-600 animate-flow-down overflow-hidden whitespace-nowrap">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={`animate-flow-left delay-${i}`}>
                                {binaryPatterns[i]}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute left-0 bottom-1/4 w-40 h-[500px] opacity-10 overflow-hidden select-none pointer-events-none hidden lg:block">
                    <div className="absolute inset-0 flex flex-col items-start gap-1 text-[10px] font-mono text-indigo-600 animate-flow-up overflow-hidden whitespace-nowrap">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={`animate-flow-right delay-${i}`}>
                                {binaryPatterns[29 - i]}
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes flow-down {
                      0% { transform: translateY(-100%); }
                      100% { transform: translateY(100%); }
                    }
                    @keyframes flow-up {
                      0% { transform: translateY(100%); }
                      100% { transform: translateY(-100%); }
                    }
                    @keyframes flow-left {
                      0% { transform: translateX(0%); }
                      100% { transform: translateX(-100%); }
                    }
                    @keyframes flow-right {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(0%); }
                    }
                    .animate-flow-down {
                      animation: flow-down 20s linear infinite;
                    }
                    .animate-flow-up {
                      animation: flow-up 20s linear infinite;
                    }
                    .animate-flow-left {
                      animation: flow-left 15s linear infinite;
                    }
                    .animate-flow-right {
                      animation: flow-right 15s linear infinite;
                    }
                    
                    /* Animation delay classes */
                    .delay-0 { animation-delay: 0s; }
                    .delay-01 { animation-delay: 0.1s; }
                    .delay-02 { animation-delay: 0.2s; }
                    .delay-03 { animation-delay: 0.3s; }
                    .delay-04 { animation-delay: 0.4s; }
                    .delay-05 { animation-delay: 0.5s; }
                    .delay-06 { animation-delay: 0.6s; }
                    .delay-07 { animation-delay: 0.7s; }
                    .delay-08 { animation-delay: 0.8s; }
                    .delay-09 { animation-delay: 0.9s; }
                    .delay-1 { animation-delay: 1s; }
                    .delay-11 { animation-delay: 1.1s; }
                    .delay-12 { animation-delay: 1.2s; }
                    .delay-13 { animation-delay: 1.3s; }
                    .delay-14 { animation-delay: 1.4s; }
                    .delay-15 { animation-delay: 1.5s; }
                    .delay-16 { animation-delay: 1.6s; }
                    .delay-17 { animation-delay: 1.7s; }
                    .delay-18 { animation-delay: 1.8s; }
                    .delay-19 { animation-delay: 1.9s; }
                    .delay-2 { animation-delay: 2s; }
                    .delay-21 { animation-delay: 2.1s; }
                    .delay-22 { animation-delay: 2.2s; }
                    .delay-23 { animation-delay: 2.3s; }
                    .delay-24 { animation-delay: 2.4s; }
                    .delay-25 { animation-delay: 2.5s; }
                    .delay-26 { animation-delay: 2.6s; }
                    .delay-27 { animation-delay: 2.7s; }
                    .delay-28 { animation-delay: 2.8s; }
                    .delay-29 { animation-delay: 2.9s; }
                `}</style>
            </div>

            {/* Section header */}
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center">
                    <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-indigo-100/10 text-indigo-300 border border-indigo-400/30 mb-4">
                        AI Curriculum
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:text-4xl">
                        Cutting-Edge AI Courses
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                        Master the technologies shaping our future with courses designed by AI experts for tomorrow's innovators.
                    </p>
                </div>

                {/* Filter chips - decorative */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {aiTopics.map((topic, index) => (
                        <div
                            key={topic}
                            className="py-1.5 px-3 rounded-full text-sm bg-white/10 dark:bg-white/5 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/30 backdrop-blur-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            {topic}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate={controls}
            >
                {Object.keys(courses).map((key: any) => {
                    const course = courses[key];
                    const { amount, currency, priceId } = getCoursePrice(course);
                    const purchased = isPurchased(course.id);
                    const isLoading = loadingPayment && loadingCourseId === course.id;

                    // Assign a random AI topic for demonstration
                    const courseTopic = aiTopics[Math.floor(Math.random() * aiTopics.length)];

                    return (
                        <motion.div
                            key={course.id}
                            id={course.id}
                            className="group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800/80 backdrop-blur-sm shadow-md border border-transparent dark:border-gray-700/30 hover:border-indigo-300/50 dark:hover:border-indigo-500/30 transition-all duration-300"
                            variants={courseVariants}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.3, ease: "easeOut" }
                            }}
                        >
                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 z-10 transition-opacity duration-700">
                                <div className="absolute inset-[-100%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                            </div>

                            {/* 3D card effect with layered shadows */}
                            <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-indigo-500/70 via-purple-500/70 to-pink-500/70 opacity-0 group-hover:opacity-100 blur-[2px] transition-all duration-300 -z-10"></div>
                            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 -z-10"></div>

                            <div className="relative overflow-hidden">
                                {/* Floating badges with glass effect */}
                                <div className="absolute top-4 left-4 z-20">
                                    <Chip
                                        variant="flat"
                                        color="primary"
                                        size="sm"
                                        className="text-xs font-medium backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 shadow-lg"
                                    >
                                        {course.difficulty || 'Advanced'}
                                    </Chip>
                                </div>

                                {/* Course topic with improved styling */}
                                <div className="absolute top-4 right-4 z-20">
                                    <Chip
                                        variant="flat"
                                        color="secondary"
                                        size="sm"
                                        className="text-xs font-medium backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 shadow-lg"
                                    >
                                        {courseTopic}
                                    </Chip>
                                </div>

                                {/* Enhanced purchased badge */}
                                {purchased && (
                                    <div className="absolute bottom-4 right-4 z-20">
                                        <Chip
                                            variant="solid"
                                            color="success"
                                            size="sm"
                                            className="text-xs font-medium shadow-lg shadow-green-500/20 flex items-center gap-1"
                                            startContent={
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            }
                                        >
                                            Enrolled
                                        </Chip>
                                    </div>
                                )}

                                {/* Course image with improved overlay effects */}
                                <div
                                    className="relative h-56 w-full cursor-pointer overflow-hidden"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    {/* Enhanced gradient overlay with better visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>

                                    {/* Tech circuit pattern overlay with reduced opacity for subtlety */}
                                    <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] bg-cover mix-blend-overlay opacity-30 z-10"></div>

                                    {/* Improved interactive hover effect with smoother transition */}
                                    <div className="absolute inset-0 bg-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                                    {/* Enhanced glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/50 to-purple-600/50 opacity-0 group-hover:opacity-40 blur-md transition-all duration-500 z-[5] scale-105 group-hover:scale-110"></div>

                                    {/* Image with enhanced zoom effect */}
                                    <img
                                        src={products?.find((product: any) => product.id === course.priceProduct.id)?.images[0]}
                                        alt={course.name}
                                        className="h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 transform-gpu"
                                    />

                                    {/* Enhanced futuristic HUD elements with better spacing and readability */}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                                        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center shadow-lg">
                                            <svg className="w-3.5 h-3.5 mr-1.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{course.duration || '10 weeks'}</span>
                                        </div>

                                        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center shadow-lg">
                                            <svg className="w-3.5 h-3.5 mr-1.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="font-medium">{Math.floor(Math.random() * 200) + 100} enrolled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                                {/* Course title with improved typography and hover effect */}
                                <h3
                                    className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    {course.name}
                                </h3>

                                {/* Course description with improved readability */}
                                <p
                                    className="mb-5 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    {course.description || 'Master cutting-edge AI techniques and practical implementations to power the future of technology in our interconnected world.'}
                                </p>

                                {/* Enhanced rating with animated stars */}
                                <div
                                    className="mt-auto mb-5 flex items-center"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <svg
                                                key={rating}
                                                className={`w-4 h-4 ${rating <= 4 ? 'text-yellow-400 group-hover:animate-pulse' : 'text-gray-300 dark:text-gray-600'}`}
                                                style={{ animationDelay: `${rating * 0.1}s` }}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">4.8 <span className="text-xs opacity-75">(42 reviews)</span></span>
                                </div>

                                {/* Divider with gradient effect */}
                                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-5"></div>

                                <div className="mt-auto flex items-center justify-between">
                                    {/* Price with enhanced styling and micro-interactions */}
                                    <div className="relative group-hover:scale-105 transition-transform duration-300">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-full opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-300"></div>
                                        <div className="relative text-2xl font-extrabold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-sm">
                                            <span className="bg-gradient-to-br from-indigo-600 to-purple-600 text-transparent bg-clip-text">{amount} {currency}</span>
                                        </div>
                                    </div>

                                    {/* Enhanced buttons with better visual feedback */}
                                    {purchased ? (
                                        <Button
                                            color="success"
                                            variant="shadow"
                                            onClick={() => handleCourseClick(course)}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-xl hover:shadow-emerald-500/30 transform group-hover:scale-105 transition-all duration-300 rounded-full px-4"
                                            endContent={
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            }
                                        >
                                            Continue Learning
                                        </Button>
                                    ) : (
                                        isLoading ? (
                                            <LoadingButton />
                                        ) : (
                                            <Button
                                                color="primary"
                                                onClick={() => buyCourse(priceId, course.id)}
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/30 transform group-hover:scale-105 transition-all duration-300 rounded-full px-4"
                                                endContent={
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                }
                                            >
                                                Enroll Now
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}
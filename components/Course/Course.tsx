'use client'
import React from 'react';
import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/components/AppContext"
import AddLesson from "./AddLesson"
import Reviews from "./Reviews"
import CourseContent from "./CourseContent"
import CourseOverview from "./CourseOverview"
import CourseEnrollment from "./CourseEnrollment"
import { Button, Divider, Card, Chip } from "@/components/ui"
import Tabs, { Tab } from "@/components/ui/Tabs"
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"
import { AppContextProps, Course as CourseType, Lesson, Resource, UserPaidProduct } from "@/types"
import { FiBookOpen, FiLayers, FiStar } from '../icons/FeatherIcons'
import { createCheckoutSession } from "firewand"
import { stripePayments } from "@/utils/firebase/stripe"
import { firebaseApp } from "@/utils/firebase/firebase.config"
import Login from "../Login"
import LoadingButton from '../Buttons/LoadingButton'

interface CourseProps {
    courseId: string;
}

export default function Course({ courseId }: CourseProps) {
    const [selectedTab, setSelectedTab] = useState("content")
    const [lessonCount, setLessonCount] = useState(0)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const router = useRouter()

    const context = useContext(AppContext) as AppContextProps
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, isAdmin, openModal, closeModal, lessons, getCourseLessons, userPaidProducts, getCourseReviews, lessonProgress, products, user } = context;
    const course = courses[courseId]
    const hasAccess = userPaidProducts?.find((userPaidProduct: UserPaidProduct) =>
        userPaidProduct.metadata.courseId === courseId
    )

    useEffect(() => {
        // We need to get course reviews and ensure lessons are loaded
        getCourseReviews(courseId);

        // Debug what courses and lessons we have in the context
        console.log('Current AppContext state:', {
            courseId,
            course,
            hasCourseLessons: !!lessons[courseId],
            lessonKeys: lessons[courseId] ? Object.keys(lessons[courseId]) : [],
            allLessonKeys: Object.keys(lessons)
        });

        // Always fetch lessons when the component mounts to ensure fresh data
        getCourseLessons(courseId);
    }, [courseId, getCourseReviews, getCourseLessons, course, lessons]);

    useEffect(() => {
        if (lessons[courseId]) {
            setLessonCount(Object.keys(lessons[courseId]).length)
        }
    }, [lessons, courseId])

    // Handle lesson click with support for free lessons
    const handleLessonClick = (lesson: Lesson) => {
        // Allow access if user is enrolled, is admin, or the lesson is free
        if (hasAccess || isAdmin || lesson.isFree) {
            router.push(`/courses/${courseId}/lessons/${lesson.id}`)
        }
    };

    const sortedLessons = (): Lesson[] => {
        // More robust validation and initialization logic
        if (!lessons || !courseId) {
            console.warn(`Cannot get lessons: Missing lessons object or courseId`, { lessons, courseId });
            return [];
        }

        // If lessons[courseId] is undefined or null, return empty array and log it
        if (!lessons[courseId]) {
            console.warn(`No lessons found for courseId: ${courseId}. This could be because they're still loading.`, { lessons });
            return [];
        }

        // Debug the data structure
        console.log(`Lessons data structure for course ${courseId}:`,
            {
                isArray: Array.isArray(lessons[courseId]),
                isObject: typeof lessons[courseId] === 'object',
                isNull: lessons[courseId] === null,
                keys: Object.keys(lessons[courseId])
            }
        );

        // Handle both possible data structures: object with lesson IDs as keys or array of lessons
        let lessonsArray: Lesson[];

        if (Array.isArray(lessons[courseId])) {
            lessonsArray = [...lessons[courseId]];
        } else if (typeof lessons[courseId] === 'object' && lessons[courseId] !== null) {
            // Only try to get values if it's a non-null object
            lessonsArray = Object.values(lessons[courseId]);
            console.log(`Converted object to array with ${lessonsArray.length} lessons`);
        } else {
            // If it's neither an array nor an object, return an empty array
            console.warn('Lessons data has unexpected format', { lessons: lessons[courseId], courseId });
            return [];
        }

        // Validate that we have lessons before sorting
        if (!lessonsArray || lessonsArray.length === 0) {
            console.warn('No lessons array after conversion', { lessons, courseId });
            return [];
        }

        // Filter out any null/undefined lessons
        lessonsArray = lessonsArray.filter(lesson => lesson != null);

        console.log(`Found ${lessonsArray.length} lessons for course ${courseId}`);

        return lessonsArray.sort((a: Lesson, b: Lesson) => {
            const orderA = a?.order || 0;
            const orderB = b?.order || 0;
            return orderA - orderB;
        });
    }

    // Check if a lesson is marked as completed
    const isLessonCompleted = (lessonId: string) => {
        return lessonProgress &&
            lessonProgress[courseId] &&
            lessonProgress[courseId][lessonId] &&
            lessonProgress[courseId][lessonId].isCompleted;
    }

    // Calculate course completion percentage
    const calculateCourseProgress = () => {
        if (!lessons[courseId] || !lessonProgress || !lessonProgress[courseId]) return 0;

        // Get the total number of lessons, handling both array and object formats
        let totalLessons;
        if (Array.isArray(lessons[courseId])) {
            totalLessons = lessons[courseId].length;
        } else {
            totalLessons = Object.keys(lessons[courseId]).length;
        }

        if (totalLessons === 0) return 0;

        // Get the lesson IDs based on data structure
        const lessonIds = Array.isArray(lessons[courseId])
            ? lessons[courseId].map(lesson => lesson.id)
            : Object.keys(lessons[courseId]);

        // Count completed lessons
        const completedLessons = lessonIds.filter(lessonId =>
            isLessonCompleted(lessonId)
        ).length;

        return Math.round((completedLessons / totalLessons) * 100);
    }

    const courseProgress = calculateCourseProgress();

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
            {/* Course Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--ai-foreground)] mb-2">
                            {course?.name}
                        </h1>
                        <p className="text-[color:var(--ai-muted)] mb-4">
                            {course?.description || 'A comprehensive course to help you master new skills.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Chip color="primary" variant="flat" size="sm">
                                {course?.difficulty || 'Beginner'}
                            </Chip>
                            <Chip color="default" variant="flat" size="sm">
                                {lessonCount} lessons
                            </Chip>
                            <Chip color="default" variant="flat" size="sm">
                                {course?.duration || '10 hours'}
                            </Chip>
                            {hasAccess && (
                                <Chip color="success" variant="solid" size="sm">
                                    Enrolled
                                </Chip>
                            )}
                            <Chip color="primary" variant="flat" size="sm">
                                {courseProgress}% completed
                            </Chip>
                        </div>
                    </div>

                    {isAdmin && (
                        <Button
                            color="primary"
                            onClick={() => openModal({
                                id: 'addLesson',
                                isOpen: true,
                                hideCloseButton: false,
                                backdrop: 'blur',
                                size: 'full',
                                scrollBehavior: 'inside',
                                isDismissable: true,
                                modalHeader: `Add Lesson ${courseId}`,
                                modalBody: <AddLesson courseId={courseId} onClose={() => closeModal('addLesson')} />,
                                footerDisabled: true,
                                noReplaceURL: true,
                                onClose: () => closeModal('addLesson'),
                            })}
                            startContent={(
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        >
                            Add Lesson
                        </Button>
                    )}

                    {/* Always show enrollment component, but with different status based on user access */}
                    <div className="w-full md:w-auto min-w-[280px]">
                        <CourseEnrollment
                            course={course}
                            isPurchased={!!hasAccess || isAdmin}
                        />
                    </div>
                </div>

                <Divider className="my-6" />
            </div>

            {/* Tabs Navigation */}            <Tabs
                aria-label="Course tabs"
                selectedKey={selectedTab}
                onSelectionChange={(key: string) => setSelectedTab(key)}
                className="mb-8"
                classNames={{
                    tabList: "relative border-b border-[color:var(--ai-card-border)]/50 gap-4 mb-4",
                    tab: "px-4 py-3 text-[color:var(--ai-muted)] data-[selected=true]:text-[color:var(--ai-primary)] font-medium transition-colors duration-200 relative",
                    cursor: "opacity-0",
                    panel: "pt-2",
                    base: "group relative",
                    tabContent: "z-10 relative" // Ensure content is above any highlights
                }}
                disableAnimation={true} // Disable default animations
            >
                <Tab
                    key="content"
                    title={
                        <div className="flex items-center gap-2 relative">
                            <FiBookOpen size={18} className={selectedTab === "content" ? "text-[color:var(--ai-primary)]" : ""} />
                            <span>Content</span>
                            {selectedTab === "content" && (
                                <motion.span
                                    className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                    initial={{ width: "0%", opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                            )}
                        </div>
                    }
                />
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center gap-2 relative">
                            <FiLayers size={18} className={selectedTab === "overview" ? "text-[color:var(--ai-primary)]" : ""} />
                            <span>Overview</span>
                            {selectedTab === "overview" && (
                                <motion.span
                                    className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                    initial={{ width: "0%", opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                            )}
                        </div>
                    }
                />
                <Tab
                    key="reviews"
                    title={
                        <div className="flex items-center gap-2 relative">
                            <FiStar size={18} className={selectedTab === "reviews" ? "text-[color:var(--ai-primary)]" : ""} />
                            <span>Reviews</span>
                            {selectedTab === "reviews" && (
                                <motion.span
                                    className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                    layoutId="tab-indicator"
                                    initial={{ width: "0%", opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                            )}
                        </div>
                    }
                />
                {course?.resources && (
                    <Tab
                        key="resources"
                        title={
                            <div className="flex items-center gap-2 relative">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={selectedTab === "resources" ? "text-[color:var(--ai-primary)]" : ""}
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span>Resources</span>
                                {selectedTab === "resources" && (
                                    <motion.span
                                        className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
                                        layoutId="tab-indicator"
                                        initial={{ width: "0%", opacity: 0 }}
                                        animate={{ width: "100%", opacity: 1 }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                )}
                            </div>
                        }
                    />
                )}
            </Tabs>

            {/* Tab Content */}
            <div className="mt-4">
                {/* Content Tab */}
                {selectedTab === "content" && (
                    <CourseContent
                        course={course}
                        lessons={sortedLessons()}
                        hasAccess={!!hasAccess}
                        isAdmin={isAdmin}
                        completedLessons={lessonProgress && lessonProgress[courseId] ?
                            Object.keys(lessonProgress[courseId]).reduce((acc, lessonId) => {
                                acc[lessonId] = lessonProgress[courseId][lessonId].isCompleted;
                                return acc;
                            }, {} as Record<string, boolean>) :
                            {}
                        }
                        handleLessonClick={handleLessonClick}
                    />
                )}

                {/* Overview Tab */}
                {selectedTab === "overview" && (
                    <CourseOverview course={course} />
                )}

                {/* Reviews Tab */}
                {selectedTab === "reviews" && (
                    <Reviews courseId={courseId} />
                )}

                {/* Resources Tab */}
                {selectedTab === "resources" && course?.resources && (
                    <div className="p-4">
                        <h3 className="font-medium text-lg mb-4">Course Resources</h3>
                        <div className="space-y-3">
                            {course.resources.map((resource: Resource, index: number) => (
                                <div key={index} className="flex items-center p-3 border rounded-lg">
                                    <svg className="w-5 h-5 mr-3 text-[color:var(--ai-primary)]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[color:var(--ai-primary)] hover:underline"
                                    >
                                        {resource.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>            {/* Certificate Download Button */}
            {hasAccess && courseProgress === 100 && user && (
                <div className="my-6">
                    <Card className="border border-[color:var(--ai-primary)]/20 bg-gradient-to-r from-[color:var(--ai-primary)]/5 to-[color:var(--ai-card-bg)] shadow-md">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-[color:var(--ai-primary)]/10 flex items-center justify-center text-[color:var(--ai-primary)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="8" r="7"></circle>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Course Completed!</h3>
                                    <p className="text-[color:var(--ai-muted)]">Congratulations on finishing this course</p>
                                </div>
                            </div>
                            <Button
                                color="primary"
                                size="lg"
                                onClick={async () => {
                                    try {
                                        const token = await user.getIdToken();
                                        const res = await fetch('/api/certificate', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ courseId }),
                                        });
                                        if (!res.ok) throw new Error('Failed to generate certificate');
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `certificate-${courseId}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        alert('Could not download certificate. Please try again.');
                                    }
                                }}
                                startContent={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                }
                            >
                                Download Certificate
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

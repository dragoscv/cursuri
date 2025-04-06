'use client'
import React from 'react';
import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/components/AppContext"
import AddLesson from "./AddLesson"
import Reviews from "./Reviews"
import CourseContent from "./CourseContent"
import CourseOverview from "./CourseOverview"
import CourseEnrollment from "./CourseEnrollment"
import { Button, Tabs, Tab, Divider, Card, Chip } from "@heroui/react"
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
    const { courses, isAdmin, openModal, closeModal, lessons, getCourseLessons, userPaidProducts, getCourseReviews, lessonProgress, products, user } = context

    const course = courses[courseId]
    const hasAccess = userPaidProducts?.find((userPaidProduct: UserPaidProduct) =>
        userPaidProduct.metadata.courseId === courseId
    )

    useEffect(() => {
        // We only need to get course reviews, as lessons are already available in the context
        getCourseReviews(courseId)
    }, [courseId, getCourseReviews]);

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
    }

    const sortedLessons = (): Lesson[] => {
        if (!lessons[courseId]) return []

        // Handle both possible data structures: object with lesson IDs as keys or array of lessons
        let lessonsArray: Lesson[];
        if (Array.isArray(lessons[courseId])) {
            lessonsArray = lessons[courseId];
        } else {
            lessonsArray = Object.values(lessons[courseId]);
        }

        return lessonsArray.sort((a: Lesson, b: Lesson) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
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

            {/* Tabs Navigation */}
            <Tabs
                aria-label="Course tabs"
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                className="mb-8"
            >
                <Tab
                    key="content"
                    title={
                        <div className="flex items-center gap-2">
                            <FiBookOpen size={18} />
                            <span>Content</span>
                        </div>
                    }
                />
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center gap-2">
                            <FiLayers size={18} />
                            <span>Overview</span>
                        </div>
                    }
                />
                <Tab
                    key="reviews"
                    title={
                        <div className="flex items-center gap-2">
                            <FiStar size={18} />
                            <span>Reviews</span>
                        </div>
                    }
                />
                {course?.resources && <Tab key="resources" title="Resources" />}
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
            </div>
        </div>
    )
}

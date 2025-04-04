'use client'
import { useContext, useEffect, useState } from "react"
import { AppContext } from "@/components/AppContext"
import AddLesson from "./AddLesson"
import Reviews from "./Reviews"
import { Button, Tabs, Tab, Divider, Card, Chip } from "@heroui/react"
import { useRouter } from "next/navigation"
import { AppContextProps, Course as CourseType, Lesson, Resource, UserPaidProduct } from "@/types"

interface CourseProps {
    courseId: string;
}

export default function Course({ courseId }: CourseProps) {
    const [selectedTab, setSelectedTab] = useState("lessons")
    const [lessonCount, setLessonCount] = useState(0)
    const router = useRouter()

    const context = useContext(AppContext) as AppContextProps
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { courses, isAdmin, openModal, closeModal, lessons, getCourseLessons, userPaidProducts, getCourseReviews, lessonProgress } = context

    const course = courses[courseId]
    const hasAccess = userPaidProducts?.find((userPaidProduct: UserPaidProduct) =>
        userPaidProduct.metadata.courseId === courseId
    )

    useEffect(() => {
        getCourseLessons(courseId)
        getCourseReviews(courseId)
    }, [courseId, getCourseLessons, getCourseReviews]);

    useEffect(() => {
        if (lessons[courseId]) {
            setLessonCount(Object.keys(lessons[courseId]).length)
        }
    }, [lessons, courseId])

    const handleLessonClick = (lesson: Lesson) => {
        if (hasAccess || isAdmin) {
            // Navigate to the lesson page instead of opening a modal
            router.push(`/courses/${courseId}/lessons/${lesson.id}`)
        }
    }

    const sortedLessons = (): Lesson[] => {
        if (!lessons[courseId]) return []

        return Object.values(lessons[courseId])
            .sort((a: Lesson, b: Lesson) => {
                const orderA = a.order || 0
                const orderB = b.order || 0
                return orderA - orderB
            })
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

        const totalLessons = Object.keys(lessons[courseId]).length;
        if (totalLessons === 0) return 0;

        const completedLessons = Object.keys(lessons[courseId]).filter(lessonId =>
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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {course?.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
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
                            <Chip color="info" variant="flat" size="sm">
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
                <Tab key="lessons" title="Lessons" />
                <Tab key="reviews" title="Reviews" />
                {course?.resources && <Tab key="resources" title="Resources" />}
            </Tabs>

            {/* Tab Content */}
            <div className="mt-4">
                {/* Lessons Tab */}
                {selectedTab === "lessons" && (
                    <div className="space-y-4">
                        {!hasAccess && !isAdmin && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Enrollment Required</h3>
                                        <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                            <p>You need to enroll in this course to access the lessons. Purchase this course to continue.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {sortedLessons().map((lesson: Lesson, index: number) => (
                                <Card
                                    key={lesson.id}
                                    className={`
                                        ${hasAccess || isAdmin ? 'cursor-pointer hover:shadow-md transition-shadow' : 'opacity-70'} 
                                        border border-gray-200 dark:border-gray-700
                                    `}
                                    isPressable={!!hasAccess || isAdmin}
                                    onPress={() => handleLessonClick(lesson)}
                                >
                                    <div className="flex items-center p-4">
                                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 font-semibold mr-4">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                {lesson.name}
                                            </h3>
                                            {lesson.description && (
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {lesson.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-shrink-0 flex items-center">
                                            {lesson.duration && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {lesson.duration}
                                                </span>
                                            )}
                                            {isLessonCompleted(lesson.id) && (
                                                <svg className="w-5 h-5 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {!isLessonCompleted(lesson.id) && !hasAccess && !isAdmin && (
                                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {(hasAccess || isAdmin) && !isLessonCompleted(lesson.id) && (
                                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {sortedLessons().length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium">No lessons available</h3>
                                    <p className="mt-1 text-sm">No lessons have been added to this course yet.</p>
                                    {isAdmin && (
                                        <div className="mt-6">
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
                                            >
                                                Add First Lesson
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
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
                                    <svg className="w-5 h-5 mr-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
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

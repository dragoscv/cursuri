'use client'

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "@/components/AppContext";
import { Tabs, Tab, Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { Lesson, CourseWithPriceProduct } from "@/types";

// Import Admin Components
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/AdminUsers";
import EnhancedUserManagement from "./Admin/EnhancedUserManagement";
import AdminAnalytics from "./Admin/AdminAnalytics";
import CourseEngagement from "./Admin/CourseEngagement";
import BatchOperations from "./Admin/BatchOperations";
import AdminSettings from "./Admin/AdminSettings";
import AdminHeader from "./Admin/AdminHeader";
import AdminRoleManagement from "./Admin/AdminRoleManagement";

// Add global type for the tab change function
declare global {
    interface Window {
        changeAdminTab?: (tab: string) => void;
    }
}

export default function Admin() {
    const [selectedTab, setSelectedTab] = useState<string>("dashboard"); // Changed default to dashboard
    const [selectedView, setSelectedView] = useState<"grid" | "list">("grid"); const [selectedCourse, setSelectedCourse] = useState<CourseWithPriceProduct | null>(null);

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.");
    }
    const { courses, lessons, isAdmin, getCourseLessons, user, userProfile } = context;

    const router = useRouter();    // Add a console log to debug admin status
    useEffect(() => {
        console.log("Current user:", user?.email);
        console.log("Is admin:", isAdmin);
        console.log("User profile:", userProfile);
    }, [user, isAdmin, userProfile]);

    // Make the tab change function available globally for the dashboard
    useEffect(() => {
        window.changeAdminTab = (tab: string) => {
            setSelectedTab(tab);
        };

        // Clean up on component unmount
        return () => {
            delete window.changeAdminTab;
        };
    }, []);

    // Redirect if not admin
    useEffect(() => {
        // Only redirect if we know for sure the user is not an admin
        // This prevents redirection before the admin status is loaded
        if (user && !isAdmin) {
            router.push("/");
        }
    }, [isAdmin, user, router]);

    // Fetch lessons for a course when selected
    useEffect(() => {
        if (selectedCourse) {
            getCourseLessons(selectedCourse.id);
        }
    }, [selectedCourse, getCourseLessons]);

    const handleAddCourse = (): void => {
        router.push('/admin/courses/add');
    };

    const handleEditCourse = (course: CourseWithPriceProduct): void => {
        router.push(`/admin/courses/${course.id}/edit`);
    };

    const handleViewCourse = (course: CourseWithPriceProduct): void => {
        router.push(`/admin/courses/${course.id}`);
    };

    const handleAddLesson = (courseId: string): void => {
        router.push(`/admin/courses/${courseId}/lessons/add`);
    };

    const handleEditLesson = (lesson: Lesson): void => {
        if (!lesson.courseId) {
            console.error("Lesson is missing courseId:", lesson);
            return;
        }
        router.push(`/admin/courses/${lesson.courseId}/lessons/${lesson.id}/edit`);
    };

    // Helper function to safely format price
    const formatPrice = (course: CourseWithPriceProduct): string => {
        if (course.priceProduct?.prices?.[0]?.unit_amount !== undefined) {
            const amount = course.priceProduct.prices[0].unit_amount / 100;
            const currency = course.priceProduct.prices[0].currency || 'RON';
            return amount.toLocaleString('ro-RO', {
                style: 'currency',
                currency: currency,
            });
        }
        return 'Price not available';
    };

    // Helper function to safely get lesson count
    const getLessonCount = (courseId: string): number => {
        if (!lessons[courseId]) return 0;
        return Object.keys(lessons[courseId]).length;
    };

    return (
        <>
            <AdminHeader
                onTabChange={setSelectedTab}
                activeTab={selectedTab}
            />
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* The page heading is now in AdminHeader, so we can remove the duplicate */}                <Tabs
                    aria-label="Admin tabs"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    className="mb-8"
                >                    <Tab key="dashboard" title="Dashboard" />
                    <Tab key="courses" title="Courses" />
                    {selectedCourse && <Tab key="courseDetails" title={`Editing: ${selectedCourse.name}`} />}
                    <Tab key="batchOperations" title="Batch Operations" />
                    <Tab key="users" title="Users" />
                    <Tab key="enhancedUsers" title="Enhanced Users" />
                    <Tab key="roleManagement" title="Role Management" />
                    <Tab key="analytics" title="Analytics" />
                    <Tab key="courseEngagement" title="Course Engagement" />
                    <Tab key="settings" title="Settings" />
                </Tabs>

                {/* Dashboard Tab */}
                {selectedTab === "dashboard" && (
                    <AdminDashboard />
                )}

                {/* Courses Tab */}
                {selectedTab === "courses" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">                                <Button
                                color={selectedView === "grid" ? "primary" : "default"}
                                variant={selectedView === "grid" ? "solid" : "light"}
                                onPress={() => setSelectedView("grid")}
                                size="sm"
                                className={selectedView === "grid"
                                    ? "bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] font-medium shadow-sm"
                                    : "text-[color:var(--ai-foreground)] font-medium hover:bg-[color:var(--ai-card-border)]/20"
                                }
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="ml-2">Grid</span>
                            </Button>                                <Button
                                color={selectedView === "list" ? "primary" : "default"}
                                variant={selectedView === "list" ? "solid" : "light"}
                                onPress={() => setSelectedView("list")}
                                size="sm"
                                className={selectedView === "list"
                                    ? "bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] font-medium shadow-sm"
                                    : "text-[color:var(--ai-foreground)] font-medium hover:bg-[color:var(--ai-card-border)]/20"
                                }
                            >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-2">List</span>
                                </Button>
                            </div>                            <Button
                                color="primary"
                                onPress={handleAddCourse}
                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                                startContent={(
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            >
                                Add Course
                            </Button>
                        </div>

                        {/* Course list components remain unchanged */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.keys(courses).map((key) => {
                                const course = courses[key] as CourseWithPriceProduct;
                                return (
                                    <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                                        <CardBody onClick={() => handleViewCourse(course)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{course.name}</h3>
                                                <Chip
                                                    color={course.status === "active" ? "success" : "warning"}
                                                    size="sm"
                                                >
                                                    {course.status}
                                                </Chip>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                                {course.description || 'No description available'}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatPrice(course)}
                                                </div>                                                <div className="flex gap-2">                                                    <Button size="sm" color="danger" variant="flat" onPress={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    // Delete course logic
                                                    e.preventDefault?.();
                                                    e.stopPropagation?.();
                                                    console.log("Delete course:", course.id);
                                                    // TODO: Implement delete functionality
                                                }}
                                                    className="font-medium text-[color:var(--ai-danger)] bg-[color:var(--ai-danger)]/10 hover:bg-[color:var(--ai-danger)]/20">
                                                    Delete
                                                </Button>
                                                    <Button size="sm" color="primary" variant="flat" onPress={(e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                                        e.preventDefault?.();
                                                        e.stopPropagation?.();
                                                        handleEditCourse(course);
                                                    }}
                                                        className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20">
                                                        Edit Course
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Course Details Tab - shown when a course is selected */}
                {selectedTab === "courseDetails" && selectedCourse && (
                    <div>
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCourse.name}</h2>
                                <div className="flex gap-2">                                    <Button
                                    color="primary"
                                    onPress={() => handleAddLesson(selectedCourse.id)}
                                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                                    startContent={(
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                >
                                    Add Lesson
                                </Button>                                    <Button
                                    color="default"
                                    variant="light"
                                    onPress={() => {
                                        setSelectedCourse(null);
                                        setSelectedTab("courses");
                                    }}
                                    className="font-medium text-[color:var(--ai-foreground)] hover:bg-[color:var(--ai-card-border)]/20"
                                >
                                        Back to Courses
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="lg:col-span-2">
                                    <Card className="p-4">
                                        <h3 className="text-xl font-semibold mb-4">Course Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Course Name
                                                </label>
                                                <input
                                                    title="Course Name"
                                                    aria-label="Course Name"
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    value={selectedCourse.name}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    title="Course Description"
                                                    aria-label="Course Description"
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    value={selectedCourse.description || ''}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Status
                                                </label>
                                                <div className="flex items-center">
                                                    <Chip
                                                        color={selectedCourse.status === "active" ? "success" : "warning"}
                                                        size="sm"
                                                    >
                                                        {selectedCourse.status}
                                                    </Chip>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Price
                                                </label>
                                                <div className="text-lg font-medium">
                                                    {formatPrice(selectedCourse)}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <div>
                                    <Card className="p-4">
                                        <h3 className="text-xl font-semibold mb-4">Course Statistics</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400">
                                                    Number of Lessons
                                                </label>
                                                <p className="text-2xl font-bold">
                                                    {getLessonCount(selectedCourse.id)}
                                                </p>
                                            </div>
                                            <Divider />
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400">
                                                    Enrolled Students
                                                </label>
                                                <p className="text-2xl font-bold">
                                                    {/* This would be fetched from a students collection */}
                                                    0
                                                </p>
                                            </div>
                                            <Divider />
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400">
                                                    Average Rating
                                                </label>
                                                <div className="flex items-center">
                                                    <span className="text-2xl font-bold mr-2">0</span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                                key={star}
                                                                className="w-5 h-5 text-gray-300"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <Card className="p-4">
                                <h3 className="text-xl font-semibold mb-4">Lessons</h3>
                                <div className="overflow-hidden">
                                    {lessons[selectedCourse.id] && Object.keys(lessons[selectedCourse.id]).length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        #
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Lesson Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {Object.values(lessons[selectedCourse.id])
                                                    .sort((a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0))
                                                    .map((lesson: Lesson, index: number) => (
                                                        <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{lesson.name}</div>
                                                                {lesson.description && (
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                        {lesson.description}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <Chip
                                                                    color={lesson.status === "active" ? "success" : "warning"}
                                                                    size="sm"
                                                                >
                                                                    {lesson.status}
                                                                </Chip>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                <div className="flex gap-2">                                                                    <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    onPress={() => handleEditLesson(lesson)}
                                                                    className="font-medium text-[color:var(--ai-primary)] bg-[color:var(--ai-primary)]/10 hover:bg-[color:var(--ai-primary)]/20"
                                                                >
                                                                    Edit Lesson
                                                                </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400 mb-4">No lessons found for this course</p>                                            <Button
                                                color="primary"
                                                onPress={() => handleAddLesson(selectedCourse.id)}
                                                size="sm"
                                                className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white font-medium shadow-sm hover:shadow-md hover:shadow-[color:var(--ai-primary)]/20 transition-all"
                                            >
                                                Add First Lesson
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}                {/* Users Tab */}
                {selectedTab === "users" && (
                    <AdminUsers />
                )}                {/* Enhanced Users Management Tab */}
                {selectedTab === "enhancedUsers" && (
                    <EnhancedUserManagement />
                )}

                {/* Role Management Tab */}
                {selectedTab === "roleManagement" && (
                    <AdminRoleManagement />
                )}

                {/* Batch Operations Tab */}
                {selectedTab === "batchOperations" && (
                    <BatchOperations />
                )}

                {/* Analytics Tab */}
                {selectedTab === "analytics" && (
                    <AdminAnalytics />
                )}

                {/* Course Engagement Tab */}
                {selectedTab === "courseEngagement" && (
                    <CourseEngagement />
                )}

                {/* Settings Tab */}
                {selectedTab === "settings" && (
                    <AdminSettings />
                )}
            </div>
        </>
    );
}
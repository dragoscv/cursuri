import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { Course, AppContextProps } from '@/types';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';

export interface CourseNode {
    id: string;
    name: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'upcoming' | 'locked';
    prerequisites: string[];
    imageUrl?: string;
}

export interface LearningPathData {
    currentCourse: string;
    nextCourse: string;
    currentProgress: number;
    courseNodes: CourseNode[];
    loading: boolean;
    error: string | null;
}

export default function useLearningPath(): LearningPathData {
    const { user, userPaidProducts = [], courses = {}, lessonProgress = {}, lessons = {} } = useContext(AppContext) as AppContextProps;

    const [pathData, setPathData] = useState<LearningPathData>({
        currentCourse: '',
        nextCourse: '',
        currentProgress: 0,
        courseNodes: [],
        loading: true,
        error: null
    });

    useEffect(() => {
        async function fetchLearningPath() {
            if (!user) {
                setPathData(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                // 1. Get all courses the user has purchased (remove duplicates)
                const purchasedCourseIds = Array.from(new Set(
                    userPaidProducts
                        .filter(product => product.metadata?.courseId)
                        .map(product => product.metadata.courseId)
                ));

                if (purchasedCourseIds.length === 0) {
                    setPathData({
                        currentCourse: '',
                        nextCourse: '',
                        currentProgress: 0,
                        courseNodes: [],
                        loading: false,
                        error: null
                    });
                    return;
                }

                // 2. Calculate progress for each course
                const courseNodes: CourseNode[] = [];
                let currentCourseId = '';
                let nextCourseId = '';
                let currentCourseProgress = 0;

                // Create a map of all prerequisites relationships
                const prerequisitesMap: Record<string, string[]> = {};

                // Fetch prerequisites for all courses
                for (const courseId of Object.keys(courses)) {
                    const course = courses[courseId];

                    if (course.prerequisites && course.prerequisites.length > 0) {
                        prerequisitesMap[courseId] = course.prerequisites;
                    } else {
                        prerequisitesMap[courseId] = [];
                    }
                }

                // Build the learning path graph
                for (const courseId of purchasedCourseIds) {
                    const course = courses[courseId];
                    if (!course) continue;

                    // Get all lessons for this course from the lessons collection
                    const courseLessons = lessons[courseId] || {};
                    const totalCourseLessons = Object.keys(courseLessons).length;

                    // Calculate course progress from lessonProgress
                    const courseLessonsProgress = lessonProgress[courseId] || {};
                    const completedLessons = Object.values(courseLessonsProgress)
                        .filter(progress => progress.isCompleted).length;

                    const progress = totalCourseLessons > 0
                        ? Math.round((completedLessons / totalCourseLessons) * 100)
                        : 0;

                    // Determine course status
                    let status: 'completed' | 'in-progress' | 'upcoming' | 'locked' = 'upcoming';

                    if (progress === 100) {
                        status = 'completed';
                    } else if (progress > 0) {
                        status = 'in-progress';
                        if (!currentCourseId) {
                            currentCourseId = courseId;
                            currentCourseProgress = progress;
                        }
                    } else {
                        // Check if prerequisites are met
                        const prereqs = prerequisitesMap[courseId] || [];
                        const allPrereqsMet = prereqs.every(prereqId => {
                            const prereqNode = courseNodes.find(node => node.id === prereqId);
                            return prereqNode && prereqNode.status === 'completed';
                        });

                        status = allPrereqsMet ? 'upcoming' : 'locked';
                    }

                    courseNodes.push({
                        id: courseId,
                        name: course.name,
                        progress,
                        status,
                        prerequisites: prerequisitesMap[courseId] || [],
                        imageUrl: course.imageUrl
                    });
                }

                // Sort nodes by status priority
                const statusPriority = {
                    'in-progress': 0,
                    'completed': 1,
                    'upcoming': 2,
                    'locked': 3
                };

                courseNodes.sort((a, b) =>
                    statusPriority[a.status] - statusPriority[b.status]
                );

                // Determine next course
                if (currentCourseId) {
                    // If we have a current course, find the next upcoming course
                    const upcomingCourse = courseNodes.find(node => node.status === 'upcoming');
                    if (upcomingCourse) {
                        nextCourseId = upcomingCourse.id;
                    }
                } else {
                    // If no course is in progress, find the first available course to start
                    const firstAvailableCourse = courseNodes.find(node =>
                        node.status === 'upcoming' || node.status === 'locked'
                    );
                    if (firstAvailableCourse) {
                        // Set this as both current and next (since nothing is in progress)
                        currentCourseId = firstAvailableCourse.id;
                        currentCourseProgress = 0;
                    }
                }

                setPathData({
                    currentCourse: currentCourseId ? courses[currentCourseId]?.name || '' : '',
                    nextCourse: nextCourseId ? courses[nextCourseId]?.name || '' : '',
                    currentProgress: currentCourseProgress,
                    courseNodes,
                    loading: false,
                    error: null
                });

            } catch (error) {
                console.error("Error fetching learning path:", error);
                setPathData(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load learning path data'
                }));
            }
        }

        fetchLearningPath();
    }, [user, userPaidProducts, courses, lessonProgress, lessons]);

    return pathData;
}

import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string | Date | Timestamp;
    badgeColor?: string;
    imageUrl?: string;
    criteria?: {
        type: 'course_complete' | 'lessons_complete' | 'login_streak' | 'first_course' | 'first_review' | 'multiple_courses';
        count?: number;
        courseId?: string;
    };
    isUnlocked: boolean;
}

export interface AchievementsData {
    achievements: Achievement[];
    loading: boolean;
    error: string | null;
    syncAchievements: () => Promise<void>;
}

// Define all possible achievements
const achievementDefinitions: Omit<Achievement, 'date' | 'isUnlocked'>[] = [
    {
        id: 'first_course',
        title: 'First Course Completed',
        description: 'Completed your first course on Cursuri!',
        badgeColor: 'success',
        imageUrl: '/badges/first-course.svg',
        criteria: {
            type: 'first_course'
        }
    },
    {
        id: 'five_lessons',
        title: 'Learning Enthusiast',
        description: 'Completed 5 lessons on Cursuri',
        badgeColor: 'primary',
        imageUrl: '/badges/five-lessons.svg',
        criteria: {
            type: 'lessons_complete',
            count: 5
        }
    },
    {
        id: 'ten_lessons',
        title: 'Knowledge Seeker',
        description: 'Completed 10 lessons on Cursuri',
        badgeColor: 'secondary',
        imageUrl: '/badges/ten-lessons.svg',
        criteria: {
            type: 'lessons_complete',
            count: 10
        }
    },
    {
        id: 'three_courses',
        title: 'Learning Maestro',
        description: 'Completed 3 courses on Cursuri',
        badgeColor: 'success',
        imageUrl: '/badges/three-courses.svg',
        criteria: {
            type: 'multiple_courses',
            count: 3
        }
    },
    {
        id: 'five_courses',
        title: 'Education Expert',
        description: 'Completed 5 courses on Cursuri',
        badgeColor: 'warning',
        imageUrl: '/badges/five-courses.svg',
        criteria: {
            type: 'multiple_courses',
            count: 5
        }
    },
    {
        id: 'first_review',
        title: 'Thoughtful Reviewer',
        description: 'Left your first course review',
        badgeColor: 'accent',
        imageUrl: '/badges/first-review.svg',
        criteria: {
            type: 'first_review'
        }
    },
    {
        id: 'login_streak_7',
        title: 'Weekly Scholar',
        description: 'Logged in and learned for 7 days in a row',
        badgeColor: 'info',
        imageUrl: '/badges/login-streak-7.svg',
        criteria: {
            type: 'login_streak',
            count: 7
        }
    },
    {
        id: 'login_streak_30',
        title: 'Dedicated Learner',
        description: 'Logged in and learned for 30 days in a row',
        badgeColor: 'warning',
        imageUrl: '/badges/login-streak-30.svg',
        criteria: {
            type: 'login_streak',
            count: 30
        }
    }
];

export default function useAchievements(): AchievementsData {
    const { user, courses = {}, lessonProgress = {}, reviews = {} } = useContext(AppContext) as AppContextProps;

    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserAchievements = async () => {
        if (!user) {
            setAchievements([]);
            setLoading(false);
            return;
        }

        try {
            // Get user's achievements from Firestore
            const achievementsRef = collection(firestoreDB, `users/${user.uid}/achievements`);
            const achievementsSnap = await getDocs(achievementsRef);

            // Create a map of existing achievements
            const existingAchievements = new Map<string, Achievement>();
            achievementsSnap.forEach(doc => {
                existingAchievements.set(doc.id, doc.data() as Achievement);
            });

            // Combine all achievements (both unlocked and locked)
            const allAchievements = achievementDefinitions.map(definition => {
                const existing = existingAchievements.get(definition.id);

                return {
                    ...definition,
                    isUnlocked: !!existing,
                    date: existing?.date || null,
                } as Achievement;
            });

            // Sort achievements: unlocked first (by date), then locked
            allAchievements.sort((a, b) => {
                if (a.isUnlocked && !b.isUnlocked) return -1;
                if (!a.isUnlocked && b.isUnlocked) return 1;
                if (a.isUnlocked && b.isUnlocked) {
                    // Both unlocked, sort by date (newest first)
                    const dateA = a.date ? new Date(a.date as any).getTime() : 0;
                    const dateB = b.date ? new Date(b.date as any).getTime() : 0;
                    return dateB - dateA;
                }
                return 0;
            });

            setAchievements(allAchievements);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching achievements:", err);
            setError("Failed to load achievements");
            setLoading(false);
        }
    };

    // Function to check achievements and update if necessary
    const syncAchievements = async () => {
        if (!user) return;

        try {
            // Get user's current stats
            const completedLessonsCount = Object.values(lessonProgress)
                .flatMap(courseLessons => Object.values(courseLessons))
                .filter(progress => progress.isCompleted)
                .length;

            // Find courses with 100% completion
            const completedCourses = Object.entries(courses).filter(([courseId, course]) => {
                const courseLessonsProgress = lessonProgress[courseId] || {};
                const totalCourseLessons = Object.keys(courseLessonsProgress).length;
                const completedCourseLessons = Object.values(courseLessonsProgress)
                    .filter(progress => progress.isCompleted)
                    .length;

                return totalCourseLessons > 0 && completedCourseLessons === totalCourseLessons;
            });

            const completedCoursesCount = completedCourses.length;

            // Check if user has written any reviews
            const hasReviews = Object.values(reviews)
                .some(courseReviews =>
                    Object.values(courseReviews)
                        .some(review => review.userId === user.uid)
                );

            // Get user's login streak
            const userProfileRef = doc(firestoreDB, `users/${user.uid}/profile/stats`);
            const userProfileSnap = await getDoc(userProfileRef);
            let loginStreak = 0;

            if (userProfileSnap.exists()) {
                loginStreak = userProfileSnap.data().loginStreak || 0;
            }

            // Check each achievement
            for (const definition of achievementDefinitions) {
                const achievementId = definition.id;
                const achievementRef = doc(firestoreDB, `users/${user.uid}/achievements/${achievementId}`);
                const achievementSnap = await getDoc(achievementRef);

                // Skip if already unlocked
                if (achievementSnap.exists()) continue;

                // Check if achievement should be unlocked
                let shouldUnlock = false;

                switch (definition.criteria?.type) {
                    case 'first_course':
                        shouldUnlock = completedCoursesCount > 0;
                        break;
                    case 'lessons_complete':
                        shouldUnlock = completedLessonsCount >= (definition.criteria.count || 0);
                        break;
                    case 'multiple_courses':
                        shouldUnlock = completedCoursesCount >= (definition.criteria.count || 0);
                        break;
                    case 'first_review':
                        shouldUnlock = hasReviews;
                        break;
                    case 'login_streak':
                        shouldUnlock = loginStreak >= (definition.criteria.count || 0);
                        break;
                }

                // Unlock achievement if criteria met
                if (shouldUnlock) {
                    const newAchievement: Achievement = {
                        ...definition,
                        date: Timestamp.now(),
                        isUnlocked: true
                    };

                    await setDoc(achievementRef, newAchievement);
                }
            }

            // Refresh achievements list
            await fetchUserAchievements();

        } catch (err) {
            console.error("Error syncing achievements:", err);
            setError("Failed to sync achievements");
        }
    };

    // Initial load of achievements
    useEffect(() => {
        fetchUserAchievements();
    }, [user]);

    return {
        achievements,
        loading,
        error,
        syncAchievements
    };
}

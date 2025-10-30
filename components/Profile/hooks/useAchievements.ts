import { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { AppContextProps } from '@/types';
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useTranslations } from 'next-intl';

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

export default function useAchievements(): AchievementsData {
    const { user, courses = {}, lessonProgress = {}, reviews = {} } = useContext(AppContext) as AppContextProps;
    const t = useTranslations('profile.achievements.badges');

    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Define all possible achievements using translations
    const getAchievementDefinitions = (): Omit<Achievement, 'date' | 'isUnlocked'>[] => [
        {
            id: 'first_course',
            title: t('first_course.title'),
            description: t('first_course.description'),
            badgeColor: 'success',
            imageUrl: '/badges/first-course.svg',
            criteria: {
                type: 'first_course'
            }
        },
        {
            id: 'five_lessons',
            title: t('five_lessons.title'),
            description: t('five_lessons.description'),
            badgeColor: 'primary',
            imageUrl: '/badges/five-lessons.svg',
            criteria: {
                type: 'lessons_complete',
                count: 5
            }
        },
        {
            id: 'ten_lessons',
            title: t('ten_lessons.title'),
            description: t('ten_lessons.description'),
            badgeColor: 'secondary',
            imageUrl: '/badges/ten-lessons.svg',
            criteria: {
                type: 'lessons_complete',
                count: 10
            }
        },
        {
            id: 'three_courses',
            title: t('three_courses.title'),
            description: t('three_courses.description'),
            badgeColor: 'success',
            imageUrl: '/badges/three-courses.svg',
            criteria: {
                type: 'multiple_courses',
                count: 3
            }
        },
        {
            id: 'five_courses',
            title: t('five_courses.title'),
            description: t('five_courses.description'),
            badgeColor: 'warning',
            imageUrl: '/badges/five-courses.svg',
            criteria: {
                type: 'multiple_courses',
                count: 5
            }
        },
        {
            id: 'first_review',
            title: t('first_review.title'),
            description: t('first_review.description'),
            badgeColor: 'accent',
            imageUrl: '/badges/first-review.svg',
            criteria: {
                type: 'first_review'
            }
        },
        {
            id: 'login_streak_7',
            title: t('login_streak_7.title'),
            description: t('login_streak_7.description'),
            badgeColor: 'info',
            imageUrl: '/badges/login-streak-7.svg',
            criteria: {
                type: 'login_streak',
                count: 7
            }
        },
        {
            id: 'login_streak_30',
            title: t('login_streak_30.title'),
            description: t('login_streak_30.description'),
            badgeColor: 'warning',
            imageUrl: '/badges/login-streak-30.svg',
            criteria: {
                type: 'login_streak',
                count: 30
            }
        }
    ];

    const fetchUserAchievements = async () => {
        if (!user) {
            setAchievements([]);
            setLoading(false);
            return;
        }

        try {
            const achievementDefinitions = getAchievementDefinitions();

            // Get user's achievements from Firestore
            const achievementsRef = collection(firestoreDB, `users/${user.uid}/achievements`);
            const achievementsSnap = await getDocs(achievementsRef);

            // Create a map of existing achievements
            const existingAchievements = new Map<string, Achievement>();
            achievementsSnap.forEach(doc => {
                existingAchievements.set(doc.id, doc.data() as Achievement);
            });

            // Combine all achievements (both unlocked and locked)
            const allAchievements = achievementDefinitions.map((definition: Omit<Achievement, 'date' | 'isUnlocked'>) => {
                const existing = existingAchievements.get(definition.id);

                return {
                    ...definition,
                    isUnlocked: !!existing,
                    date: existing?.date || null,
                } as Achievement;
            });

            // Sort achievements: unlocked first (by date), then locked
            allAchievements.sort((a: Achievement, b: Achievement) => {
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
            const achievementDefinitions = getAchievementDefinitions();

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

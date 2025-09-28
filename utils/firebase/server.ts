// Firebase server utilities for Server Components
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    DocumentData,
    CollectionReference
} from 'firebase/firestore';

// Initialize Firebase app for server components
// This ensures we don't try to initialize more than once
let firebaseApp: any;
try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    });
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Initialize Firestore
const firestoreDB = getFirestore(firebaseApp);

/**
 * Get a single course by ID
 * 
 * @param courseId - The ID of the course to retrieve
 * @returns The course data or null if not found
 */
export async function getCourseById(courseId: string): Promise<DocumentData | null> {
    if (!courseId) {
        console.error('getCourseById: courseId is required');
        return null;
    }

    try {
        const courseRef = doc(firestoreDB, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
            const courseData = {
                id: courseSnap.id,
                ...courseSnap.data()
            };
            return courseData;
        } else {
            console.log(`No course found with ID: ${courseId}`);
            return null;
        }
    } catch (error) {
        // Distinguish between expected (document not found) vs unexpected errors
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'permission-denied') {
                console.log(`Access denied for course ${courseId} - this may be expected based on security rules`);
            } else if (firebaseError.code === 'not-found') {
                console.log(`Course ${courseId} not found in database`);
            } else {
                console.error(`Firebase error getting course ${courseId}:`, firebaseError.code, firebaseError.message);
            }
        } else {
            console.error(`Unexpected error getting course ${courseId}:`, error);
        }
        return null;
    }
}

/**
 * Get all courses with active status
 * 
 * @returns Array of all active courses
 */
export async function getCourses(): Promise<DocumentData[]> {
    try {
        // Query for active courses
        const q = query(collection(firestoreDB, "courses"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);

        const courses: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
            courses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return courses;
    } catch (error) {
        console.error('Error getting courses:', error);
        return [];
    }
}

/**
 * Get a single lesson by ID
 * 
 * @param courseId - The ID of the course containing the lesson
 * @param lessonId - The ID of the lesson to retrieve
 * @returns The lesson data or null if not found
 */
export async function getLessonById(courseId: string, lessonId: string): Promise<DocumentData | null> {
    if (!courseId || !lessonId) {
        console.error(`getLessonById: Invalid parameters: courseId=${courseId}, lessonId=${lessonId}`);
        return null;
    }

    try {
        // Fetch directly from Firestore
        const lessonRef = doc(firestoreDB, 'courses', courseId, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef); if (lessonSnap.exists()) {
            // Explicitly type lessonData to include courseId
            const lessonData: {
                id: string;
                courseId?: string;
                status?: string;
                [key: string]: any;
            } = {
                id: lessonSnap.id,
                ...lessonSnap.data()
            };

            // Add courseId to lessonData if not present
            if (!lessonData.courseId) {
                lessonData.courseId = courseId;
            }

            // Set status to active if not set to ensure compatibility
            if (!lessonData.status) {
                lessonData.status = "active";
            }

            console.log(`Found lesson ${lessonId} with status: ${lessonData.status}`);
            return lessonData;
        } else {
            console.log(`No lesson found with ID: ${lessonId} in course: ${courseId}`);

            // For debugging purposes - list available lessons
            try {
                const lessonsCollection = collection(firestoreDB, 'courses', courseId, 'lessons');
                const lessonsSnapshot = await getDocs(lessonsCollection);

                if (!lessonsSnapshot.empty) {
                    console.log(`Available lessons in course ${courseId}:`);
                    lessonsSnapshot.forEach(doc => {
                        const data = doc.data();
                        console.log(`- ${doc.id}: ${data.name || 'Unnamed'} (Status: ${data.status || 'Not set'})`);
                    });
                } else {
                    console.log(`No lessons found in course ${courseId}`);
                }
            } catch (listError) {
                console.error('Error listing available lessons:', listError);
            }

            return null;
        }
    } catch (error) {
        // Distinguish between expected vs unexpected Firebase errors
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'permission-denied') {
                console.log(`Access denied for lesson ${lessonId} in course ${courseId} - this may be expected based on security rules`);
            } else if (firebaseError.code === 'not-found') {
                console.log(`Lesson ${lessonId} not found in course ${courseId}`);
            } else {
                console.error(`Firebase error getting lesson ${lessonId} in course ${courseId}:`, firebaseError.code, firebaseError.message);
            }
        } else {
            console.error(`Unexpected error getting lesson ${lessonId} in course ${courseId}:`, error);
        }
        return null;
    }
}

/**
 * Get all lessons for a specific course
 * 
 * @param courseId - The ID of the course to get lessons for
 * @returns An object mapping lesson IDs to lesson data
 */
export async function getCourseLessons(courseId: string): Promise<Record<string, DocumentData>> {
    if (!courseId) {
        console.error('getCourseLessons: courseId is required');
        return {};
    } try {
        // Fetch all lessons for this course without status filtering
        const lessonsCollection = collection(firestoreDB, 'courses', courseId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsCollection);

        const lessons: Record<string, DocumentData> = {}; lessonsSnapshot.forEach(doc => {
            // Explicitly type the lesson data to include courseId and status
            lessons[doc.id] = {
                id: doc.id,
                ...doc.data(),
                courseId, // Ensure courseId is set
                status: doc.data().status || 'active' // Default to active status if not set
            } as DocumentData;
        });

        console.log(`Fetched ${Object.keys(lessons).length} lessons for course ${courseId}`);
        return lessons;
    } catch (error) {
        // Distinguish between expected vs unexpected Firebase errors  
        if (error && typeof error === 'object' && 'code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'permission-denied') {
                console.log(`Access denied for lessons in course ${courseId} - this may be expected based on security rules`);
            } else if (firebaseError.code === 'not-found') {
                console.log(`Course ${courseId} not found when fetching lessons`);
            } else {
                console.error(`Firebase error getting lessons for course ${courseId}:`, firebaseError.code, firebaseError.message);
            }
        } else {
            console.error(`Unexpected error getting lessons for course ${courseId}:`, error);
        }
        return {};
    }
}

import { getDownloadURL, ref } from "firebase/storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestoreDB, firebaseStorage } from "../firebase/firebase.config";
import { Course, Lesson } from "@/types";

// Base interface for all storable offline content
export interface OfflineContent {
    id: string;
    type: 'lesson' | 'course';
    title: string;
    downloadDate: number; // timestamp
    expiryDate: number; // timestamp (optional, can be null if no expiry)
    size: number; // size in bytes
}

// Lesson-specific offline content
export interface OfflineLessonContent extends OfflineContent {
    type: 'lesson';
    courseId: string;
    courseName: string;
    content: string;
    videoUrl?: string;
    resources?: { url: string, data: string, type: string, name: string }[];
    thumbnailUrl?: string;
}

/**
 * Downloads a lesson and all its associated content for offline viewing
 * @param lesson The lesson to download
 * @param course The course the lesson belongs to
 * @returns Promise resolving to the downloaded lesson content
 */
export async function downloadLessonForOffline(lesson: Lesson, course: Course): Promise<OfflineLessonContent> {
    try {
        // Create base offline content object
        const offlineLesson: OfflineLessonContent = {
            id: lesson.id,
            type: 'lesson',
            title: lesson.name || lesson.title || 'Unnamed Lesson',
            courseId: lesson.courseId || course.id,
            courseName: course.name,
            downloadDate: Date.now(),
            expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
            size: 0,
            content: lesson.content || ''
        };

        // 1. Download video if available
        if (lesson.videoUrl) {
            try {
                const videoResponse = await fetch(lesson.videoUrl);
                const videoBlob = await videoResponse.blob();

                // Convert blob to data URL
                const videoDataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(videoBlob);
                });

                offlineLesson.videoUrl = videoDataUrl;
                offlineLesson.size += videoBlob.size;
            } catch (error) {
                console.error("Failed to download video for offline use:", error);
            }
        }

        // 2. Download thumbnail if available
        if (lesson.thumbnailUrl || lesson.thumbnail) {
            try {
                const thumbnailUrl = lesson.thumbnailUrl || lesson.thumbnail;
                if (thumbnailUrl) {
                    const thumbnailResponse = await fetch(thumbnailUrl);
                    const thumbnailBlob = await thumbnailResponse.blob();

                    // Convert blob to data URL
                    const thumbnailDataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(thumbnailBlob);
                    });

                    offlineLesson.thumbnailUrl = thumbnailDataUrl;
                    offlineLesson.size += thumbnailBlob.size;
                }
            } catch (error) {
                console.error("Failed to download thumbnail for offline use:", error);
            }
        }

        // 3. Download resources if available
        if (lesson.resources && lesson.resources.length > 0) {
            offlineLesson.resources = [];

            for (const resource of lesson.resources) {
                try {
                    const resourceResponse = await fetch(resource.url);
                    const resourceBlob = await resourceResponse.blob();

                    // Convert blob to data URL
                    const resourceDataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(resourceBlob);
                    });

                    offlineLesson.resources.push({
                        url: resource.url,
                        data: resourceDataUrl,
                        type: resource.type || 'unknown',
                        name: resource.name || 'Resource'
                    });

                    offlineLesson.size += resourceBlob.size;
                } catch (error) {
                    console.error(`Failed to download resource ${resource.url} for offline use:`, error);
                }
            }
        }

        // Store the offline content
        await storeOfflineContent(offlineLesson);

        return offlineLesson;
    } catch (error) {
        console.error("Error downloading lesson for offline use:", error);
        throw error;
    }
}

/**
 * Stores offline content in IndexedDB
 * @param content The offline content to store
 */
export async function storeOfflineContent(content: OfflineContent): Promise<void> {
    try {
        const db = await openOfflineDB();

        // Store in IndexedDB
        const transaction = db.transaction('offlineContent', 'readwrite');
        const store = transaction.objectStore('offlineContent');

        await new Promise<void>((resolve, reject) => {
            const request = store.put(content);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        // Update user's offline content list in Firestore if they're logged in
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.uid) {
            // Get the current list of offline content
            const userDocRef = doc(firestoreDB, `users/${user.uid}`);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const offlineContentList = userDoc.data().offlineContent || [];

                // Check if this content is already in the list
                const existingIndex = offlineContentList.findIndex((item: OfflineContent) =>
                    item.id === content.id && item.type === content.type
                );

                if (existingIndex !== -1) {
                    // Update existing entry
                    offlineContentList[existingIndex] = {
                        id: content.id,
                        type: content.type,
                        title: content.title,
                        downloadDate: content.downloadDate,
                        expiryDate: content.expiryDate,
                        size: content.size
                    };
                } else {
                    // Add new entry
                    offlineContentList.push({
                        id: content.id,
                        type: content.type,
                        title: content.title,
                        downloadDate: content.downloadDate,
                        expiryDate: content.expiryDate,
                        size: content.size
                    });
                }

                // Update Firestore
                await updateDoc(userDocRef, {
                    offlineContent: offlineContentList
                });
            }
        }
    } catch (error) {
        console.error("Error storing offline content:", error);
        throw error;
    }
}

/**
 * Retrieves offline content from IndexedDB
 * @param id The ID of the content to retrieve
 * @param type The type of content (lesson or course)
 * @returns The retrieved offline content or null if not found
 */
export async function getOfflineContent(id: string, type: 'lesson' | 'course'): Promise<OfflineContent | null> {
    try {
        const db = await openOfflineDB();

        const transaction = db.transaction('offlineContent', 'readonly');
        const store = transaction.objectStore('offlineContent');

        return new Promise<OfflineContent | null>((resolve, reject) => {
            const request = store.index('idType').get([id, type]);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error retrieving offline content:", error);
        return null;
    }
}

/**
 * Deletes offline content from IndexedDB
 * @param id The ID of the content to delete
 * @param type The type of content (lesson or course)
 */
export async function deleteOfflineContent(id: string, type: 'lesson' | 'course'): Promise<void> {
    try {
        const db = await openOfflineDB();

        const transaction = db.transaction('offlineContent', 'readwrite');
        const store = transaction.objectStore('offlineContent');

        await new Promise<void>((resolve, reject) => {
            const request = store.index('idType').openCursor(IDBKeyRange.only([id, type]));

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    resolve();
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });

        // Update user's offline content list in Firestore if they're logged in
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user?.uid) {
            // Get the current list of offline content
            const userDocRef = doc(firestoreDB, `users/${user.uid}`);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const offlineContentList = userDoc.data().offlineContent || [];

                // Remove the content from the list
                const updatedList = offlineContentList.filter((item: OfflineContent) =>
                    !(item.id === id && item.type === type)
                );

                // Update Firestore
                await updateDoc(userDocRef, {
                    offlineContent: updatedList
                });
            }
        }
    } catch (error) {
        console.error("Error deleting offline content:", error);
        throw error;
    }
}

/**
 * Gets all offline content from IndexedDB
 * @returns An array of all offline content
 */
export async function getAllOfflineContent(): Promise<OfflineContent[]> {
    try {
        const db = await openOfflineDB();

        const transaction = db.transaction('offlineContent', 'readonly');
        const store = transaction.objectStore('offlineContent');

        return new Promise<OfflineContent[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error retrieving all offline content:", error);
        return [];
    }
}

/**
 * Opens (or creates) the IndexedDB database for offline content
 * @returns Promise resolving to the opened database
 */
export function openOfflineDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CursuriOfflineContent', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object store for offline content
            const store = db.createObjectStore('offlineContent', { keyPath: 'id' });

            // Create index for faster retrieval by id and type
            store.createIndex('idType', ['id', 'type'], { unique: true });

            // Create index for faster retrieval by type only
            store.createIndex('type', 'type', { unique: false });

            // Create index for getting content by download date
            store.createIndex('downloadDate', 'downloadDate', { unique: false });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Helper function to check if a user is online
 * @returns Boolean indicating if the user is online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Calculates the size of offline content in a readable format
 * @param bytes Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

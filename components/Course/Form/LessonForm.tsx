import { useState, useContext, useCallback, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "@/components/Buttons/LoadingButton"
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

interface LessonFormProps {
    courseId: string;
    lessonId?: string;
    onSuccess?: () => void;
}

export default function LessonForm({ courseId, lessonId, onSuccess }: LessonFormProps) {
    const [lessonName, setLessonName] = useState("")
    const [lessonDescription, setLessonDescription] = useState("")
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [generatingCaptions, setGeneratingCaptions] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null)
    const [saveAction, setSaveAction] = useState<"save" | "saveAndClose">("saveAndClose")

    const router = useRouter();

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("AppContext not found. You probably forgot to put <AppProvider>.")
    }
    const { lessons } = context

    useEffect(() => {
        // If lessonId is provided, we're in edit mode
        if (lessonId && courseId && lessons[courseId] && lessons[courseId][lessonId]) {
            const lesson = lessons[courseId][lessonId]
            setLessonName(lesson.name || "")
            setLessonDescription(lesson.description || "")
            setRepoUrl(lesson.repoUrl || "")
            setCurrentFileUrl(lesson.file || null)
            setIsEditing(true)
        } else if (lessonId && courseId) {
            // If lessonId is provided but not found in context, fetch it directly
            const fetchLessonData = async () => {
                try {
                    const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
                    const lessonSnap = await getDoc(lessonRef);

                    if (lessonSnap.exists()) {
                        const lessonData = lessonSnap.data();
                        setLessonName(lessonData.name || "");
                        setLessonDescription(lessonData.description || "");
                        setRepoUrl(lessonData.repoUrl || "");
                        setCurrentFileUrl(lessonData.file || null);
                        setIsEditing(true);
                    } else {
                        // Lesson not found
                        router.push(`/admin/courses/${courseId}`);
                    }
                } catch (error) {
                    console.error("Error fetching lesson data:", error);
                    router.push(`/admin/courses/${courseId}`);
                }
            };

            fetchLessonData();
        }
    }, [lessonId, courseId, lessons, router]);

    const addLesson = useCallback(async () => {
        if (!file) {
            alert("Please select a file to upload");
            return;
        }

        setLoading(true);

        try {
            // Upload file to Firebase Storage
            const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}`);
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            // Create new lesson in Firestore
            const lessonData = {
                name: lessonName,
                description: lessonDescription,
                file: downloadURL,
                repoUrl: repoUrl,
                courseId: courseId,
                status: "active",
                createdAt: new Date()
            };

            await addDoc(collection(firestoreDB, `courses/${courseId}/lessons`), lessonData);

            setLoading(false);

            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/admin/courses/${courseId}`);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error adding lesson:", error);
        }
    }, [lessonName, lessonDescription, repoUrl, courseId, file, onSuccess, router]);

    const updateLesson = useCallback(async () => {
        if (!lessonId) return;

        setLoading(true);

        try {
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);

            let updatedData: any = {
                name: lessonName,
                description: lessonDescription,
                repoUrl: repoUrl,
                updatedAt: new Date()
            };

            if (file) {
                // Upload new file if provided
                const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}`);
                const uploadTask = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(uploadTask.ref);
                updatedData.file = downloadURL;
            }

            await updateDoc(lessonRef, updatedData);

            setLoading(false);

            if (onSuccess) {
                onSuccess();
            } else {
                // If save action is "saveAndClose", navigate back to course detail page
                // Otherwise stay on the current page
                if (saveAction === "saveAndClose") {
                    router.push(`/admin/courses/${courseId}`);
                } else {
                    // Show success message or notification
                    // You could add a toast notification here if you have that component
                    console.log("Lesson updated successfully");
                }
            }
        } catch (error) {
            setLoading(false);
            console.error("Error updating lesson:", error);
        }
    }, [lessonId, courseId, lessonName, lessonDescription, repoUrl, file, onSuccess, router, saveAction]);

    const generateCaptionsAndTranscriptions = useCallback(async () => {
        if (!lessonId) return;

        try {
            setGeneratingCaptions(true);

            // Mark the lesson as processing captions
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, { processingCaptions: true });

            // Use the Azure Speech Service utility to process the lesson
            const { processLessonForCaptions } = await import('@/utils/azure/speech');
            await processLessonForCaptions(courseId, lessonId);

            // Show success message
            alert('Captions and translations have been generated successfully!');
        } catch (error) {
            console.error('Error generating captions:', error);

            // Reset processing status in case of error
            const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);
            await updateDoc(lessonRef, { processingCaptions: false });

            alert(`Failed to generate captions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setGeneratingCaptions(false);
        }
    }, [courseId, lessonId]);

    const handleSubmit = (e: React.FormEvent, action: "save" | "saveAndClose") => {
        e.preventDefault();
        setSaveAction(action);

        if (isEditing) {
            updateLesson();
        } else {
            addLesson();
        }
    }

    return (
        <form onSubmit={(e) => handleSubmit(e, saveAction)} className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEditing ? 'Edit Lesson' : 'Add Lesson'}
            </h1>

            <div className="mb-4">
                <label htmlFor="lessonName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Lesson Name
                </label>
                <input
                    type="text"
                    id="lessonName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Lesson name"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="lessonDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Lesson Description
                </label>
                <textarea
                    rows={3}
                    id="lessonDescription"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Lesson description"
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="repoUrl" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Repository URL
                </label>
                <input
                    type="url"
                    id="repoUrl"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                />
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">
                    {isEditing ? 'Replace Video File' : 'Upload Video File'}
                </label>
                <input
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    id="file_input"
                    type="file"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                />

                {isEditing && !file && (
                    <>
                        {currentFileUrl ? (
                            <div className="mt-2">                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Current file will be kept if you don&apos;t select a new one.
                            </p>
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <a
                                        href={currentFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        Current video file
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                No file currently associated with this lesson.
                            </p>
                        )}
                    </>
                )}

                {!isEditing && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Upload a video file for this lesson.
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {loading ? (
                    <LoadingButton />
                ) : (
                    <>
                        {isEditing ? (
                            <>
                                <Button
                                    color="primary"
                                    type="button"
                                    onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "save")}
                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Save
                                </Button>
                                <Button
                                    color="primary"
                                    variant="bordered"
                                    type="button"
                                    onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "saveAndClose")}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                    Save & Close
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="primary"
                                type="button"
                                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "saveAndClose")}
                                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Add Lesson
                            </Button>
                        )}

                        <Button
                            color="default"
                            type="button"
                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            onClick={() => router.push(`/admin/courses/${courseId}`)}
                        >
                            Cancel
                        </Button>

                        {isEditing && (
                            <Button
                                color="secondary"
                                type="button"
                                className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-purple-600 rounded-lg border border-purple-600 hover:bg-purple-700 focus:z-10 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
                                onClick={generateCaptionsAndTranscriptions}
                                disabled={generatingCaptions}
                            >
                                {generatingCaptions ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
                                        </svg>
                                        Generate Captions
                                    </>
                                )}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </form>
    )
}
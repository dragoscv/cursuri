import { useState, useContext, useCallback, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "../Buttons/LoadingButton"
import { firestoreDB, firebaseStorage } from "firewand";
import { doc, addDoc, collection, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function AddLesson(props: any) {
    const { onClose, courseId, lessonId } = props

    const [lessonName, setLessonName] = useState("")
    const [lessonDescription, setLessonDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<any>(null)
    const [generatingCaptions, setGeneratingCaptions] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { products, lessons } = context

    useEffect(() => {
        // If lessonId is provided, we're in edit mode
        if (lessonId && courseId && lessons[courseId] && lessons[courseId][lessonId]) {
            const lesson = lessons[courseId][lessonId]
            setLessonName(lesson.name || "")
            setLessonDescription(lesson.description || "")
            setEditMode(true)
        }
    }, [lessonId, courseId, lessons])

    const addLesson = useCallback(() => {
        setLoading(true)

        if (!file) {
            alert("Please select a file to upload")
            setLoading(false)
            return
        }

        const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}`);
        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                const lesson = {
                    name: lessonName,
                    description: lessonDescription,
                    file: downloadURL,
                    status: "active"
                }
                addDoc(collection(firestoreDB, `courses/${courseId}/lessons`), lesson).then(() => {
                    setLoading(false)
                    onClose()
                }).catch((error) => {
                    setLoading(false)
                    console.log(error)
                })
            });
        });
    }, [lessonName, lessonDescription, onClose, courseId, file]);

    const updateLesson = useCallback(() => {
        if (!lessonId) return;

        setLoading(true);
        const lessonRef = doc(firestoreDB, `courses/${courseId}/lessons/${lessonId}`);

        const updatedData: any = {
            name: lessonName,
            description: lessonDescription,
        };

        if (file) {
            // If file was changed, upload new file first
            const storageRef = ref(firebaseStorage, `lessons/${courseId}/${file.name}`);
            uploadBytes(storageRef, file).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    updatedData.file = downloadURL;

                    // Update lesson with all data including new file URL
                    updateDoc(lessonRef, updatedData).then(() => {
                        setLoading(false);
                        onClose();
                    }).catch((error) => {
                        setLoading(false);
                        console.log(error);
                    });
                });
            });
        } else {
            // Just update lesson data without changing the file
            updateDoc(lessonRef, updatedData).then(() => {
                setLoading(false);
                onClose();
            }).catch((error) => {
                setLoading(false);
                console.log(error);
            });
        }
    }, [lessonId, courseId, lessonName, lessonDescription, file, onClose]);

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

    return (
        <>
            <main className="flex flex-col h-full items-start justify-center p-2 text-black dark:text-white gap-2 w-full max-w-md">
                <h1>{editMode ? 'Edit Lesson' : 'Add Lesson'}</h1>
                <div className="flex flex-col">
                    <label htmlFor="lessonName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Lesson Name</label>
                    <input
                        type="text"
                        id="lessonName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Lesson name"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="lessonDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Lesson Description</label>
                    <textarea
                        rows={5}
                        id="lessonDescription"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Lesson description"
                        value={lessonDescription}
                        onChange={(e) => setLessonDescription(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
                    <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"
                        onChange={(e: any) => setFile(e.target.files[0])}
                    />
                    {editMode && !file && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Leave empty to keep the current file.
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {loading ? <LoadingButton /> : (
                        <button
                            type="button"
                            className="text-white bg-[#4285F4] hover:bg-[#4285F4]/30 dark:hover:bg-[#4285F4]/30 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2"
                            onClick={editMode ? updateLesson : addLesson}
                        >
                            {editMode ? 'Update Lesson' : 'Add Lesson'}
                        </button>
                    )}

                    {editMode && (
                        generatingCaptions ? (
                            <button
                                type="button"
                                className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-purple-800 opacity-70 cursor-not-allowed"
                                disabled
                            >
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-purple-800"
                                onClick={generateCaptionsAndTranscriptions}
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
                                </svg>
                                Create Captions & Transcriptions
                            </button>
                        )
                    )}
                </div>
            </main>
        </>
    )
}
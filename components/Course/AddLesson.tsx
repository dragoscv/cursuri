
import { useState, useContext, useEffect, useCallback } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "../Buttons/LoadingButton"
import { firestoreDB, firebaseStorage } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function AddCourse(props: any) {
    const { onClose, courseId } = props

    const [lessonName, setLessonName] = useState("")
    const [lessonDescription, setLessonDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<any>(null)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { products } = context

    const addLesson = useCallback(() => {
        setLoading(true)

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

    return (
        <>
            <main className="flex flex-col h-full items-start justify-center p-2 text-black dark:text-white gap-2 w-full max-w-md">
                <h1>Add Lesson</h1>
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
                        defaultValue={file}
                        onChange={(e: any) => setFile(e.target.files[0])}
                    />
                </div>

                {loading ? <LoadingButton /> :
                    <button
                        type="button"
                        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/30 dark:hover:bg-[#4285F4]/30 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2"
                        onClick={addLesson}
                    >
                        Add Lesson
                    </button>
                }
            </main>
        </>
    )
}
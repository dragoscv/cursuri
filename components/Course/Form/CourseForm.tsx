import { useState, useContext, useCallback, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "@/components/Buttons/LoadingButton"
import { firestoreDB } from "@/utils/firebase/firebase.config";
import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection, updateDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

interface CourseFormProps {
    courseId?: string;
    onSuccess?: () => void;
}

export default function CourseForm({ courseId, onSuccess }: CourseFormProps) {
    const [courseName, setCourseName] = useState("")
    const [courseDescription, setCourseDescription] = useState("")
    const [coursePrice, setCoursePrice] = useState("")
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [saveAction, setSaveAction] = useState<"save" | "saveAndClose">("saveAndClose")

    const router = useRouter();

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("AppContext not found. You probably forgot to put <AppProvider>.")
    }
    const { products, courses } = context

    const db = getFirestore(firebaseApp);

    useEffect(() => {
        // If courseId is provided, we're in edit mode
        if (courseId && courses[courseId]) {
            const course = courses[courseId]
            setCourseName(course.name || "")
            setCourseDescription(course.description || "")
            setCoursePrice(course.price || "")
            setRepoUrl(course.repoUrl || "")
            setIsEditing(true)
        } else if (courseId) {
            // If courseId is provided but not found in context, fetch it directly
            const fetchCourseData = async () => {
                try {
                    const courseRef = doc(firestoreDB, `courses/${courseId}`);
                    const courseSnap = await getDoc(courseRef);

                    if (courseSnap.exists()) {
                        const courseData = courseSnap.data();
                        setCourseName(courseData.name || "");
                        setCourseDescription(courseData.description || "");
                        setCoursePrice(courseData.price || "");
                        setRepoUrl(courseData.repoUrl || "");
                        setIsEditing(true);
                    } else {
                        // Course not found
                        router.push('/admin/courses');
                    }
                } catch (error) {
                    console.error("Error fetching course data:", error);
                    router.push('/admin/courses');
                }
            };

            fetchCourseData();
        }
    }, [courseId, courses, router]);

    const addCourse = useCallback(async () => {
        setLoading(true);

        try {
            // Find the price product for the selected price
            const priceProduct = products.find((product: any) =>
                product.prices.find((price: any) => price.id === coursePrice)
            );

            const newCourse = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProduct: priceProduct,
                repoUrl: repoUrl,
                status: "active",
                createdAt: new Date()
            };

            // Use the explicitly created Firestore instance
            await addDoc(collection(db, "courses"), newCourse);
            setLoading(false);

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/admin/courses');
            }
        } catch (error) {
            setLoading(false);
            console.error("Error adding course:", error);
        }
    }, [courseName, courseDescription, coursePrice, repoUrl, products, onSuccess, router, db]);

    const updateCourse = useCallback(async () => {
        if (!courseId) return;

        setLoading(true);

        try {
            // Use the explicitly created Firestore instance
            const courseRef = doc(db, "courses", courseId);

            // Find the price product for the selected price
            const priceProduct = products.find((product: any) =>
                product.prices.find((price: any) => price.id === coursePrice)
            );

            const updatedData = {
                name: courseName,
                description: courseDescription,
                price: coursePrice,
                priceProduct: priceProduct,
                repoUrl: repoUrl,
                updatedAt: new Date()
            };

            await updateDoc(courseRef, updatedData);
            setLoading(false);

            if (onSuccess) {
                onSuccess();
            } else {
                // If save action is "saveAndClose", navigate back to courses list
                // Otherwise stay on the current page
                if (saveAction === "saveAndClose") {
                    router.push('/admin/courses');
                } else {
                    // Show success message or notification
                    // You could add a toast notification here if you have that component
                    console.log("Course updated successfully");
                }
            }
        } catch (error) {
            setLoading(false);
            console.error("Error updating course:", error);
        }
    }, [courseId, courseName, courseDescription, coursePrice, repoUrl, products, onSuccess, router, db, saveAction]);

    const handleSubmit = (e: React.FormEvent, action: "save" | "saveAndClose") => {
        e.preventDefault();
        setSaveAction(action);

        if (isEditing) {
            updateCourse();
        } else {
            addCourse();
        }
    }

    return (
        <form onSubmit={(e) => handleSubmit(e, saveAction)} className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {isEditing ? 'Edit Course' : 'Add Course'}
            </h1>

            <div className="mb-4">
                <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Course Name
                </label>
                <input
                    type="text"
                    id="courseName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Course name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="courseDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Course Description
                </label>
                <textarea
                    rows={5}
                    id="courseDescription"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Course description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
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
                <label htmlFor="coursePrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Course Price
                </label>
                <select
                    id="coursePrice"
                    title="Course Price"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    required
                >
                    <option value="">Select a price</option>
                    {products.map((product: any) => (
                        <optgroup key={product.id} label={product.name}>
                            {product.prices.map((price: any) => (
                                <option key={price.id} value={price.id}>
                                    {(Number(price.unit_amount) / 100).toFixed(2)} {price.currency}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className="flex gap-3">
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
                                Add Course
                            </Button>
                        )}

                        <Button
                            color="default"
                            type="button"
                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            onClick={() => router.push('/admin/courses')}
                        >
                            Cancel
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}
import { useState, useContext, useEffect, useCallback } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "../Buttons/LoadingButton"
import { firestoreDB } from "firewand";
import { doc, addDoc, collection, updateDoc } from "firebase/firestore";

export default function AddCourse(props: any) {
    const { onClose, courseId } = props

    const [courseName, setCourseName] = useState("")
    const [courseDescription, setCourseDescription] = useState("")
    const [coursePrice, setCoursePrice] = useState("")
    const [repoUrl, setRepoUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { products, courses } = context

    useEffect(() => {
        // If courseId is provided, we're in edit mode
        if (courseId && courses[courseId]) {
            const course = courses[courseId]
            setCourseName(course.name || "")
            setCourseDescription(course.description || "")
            setCoursePrice(course.price || "")
            setRepoUrl(course.repoUrl || "")
            setEditMode(true)
        }
    }, [courseId, courses])

    const addCourse = useCallback(() => {
        setLoading(true)
        const priceProduct = products.find((product: any) => product.prices.find((price: any) => price.id === coursePrice))
        const course = {
            name: courseName,
            description: courseDescription,
            price: coursePrice,
            priceProduct: priceProduct,
            repoUrl: repoUrl,
            status: "active"
        }
        addDoc(collection(firestoreDB, "courses"), course).then(() => {
            setLoading(false)
            onClose()
        }).catch((error) => {
            setLoading(false)
            console.log(error)
        })
    }, [products, courseName, courseDescription, coursePrice, repoUrl, onClose]);

    const updateCourse = useCallback(() => {
        if (!courseId) return;

        setLoading(true);
        const courseRef = doc(firestoreDB, `courses/${courseId}`);

        const priceProduct = products.find((product: any) => product.prices.find((price: any) => price.id === coursePrice));

        const updatedData = {
            name: courseName,
            description: courseDescription,
            price: coursePrice,
            priceProduct: priceProduct,
            repoUrl: repoUrl
        };

        updateDoc(courseRef, updatedData).then(() => {
            setLoading(false);
            onClose();
        }).catch((error) => {
            setLoading(false);
            console.log(error);
        });
    }, [courseId, courseName, courseDescription, coursePrice, repoUrl, products, onClose]);

    return (
        <>
            <main className="flex flex-col h-full items-start justify-center p-2 text-[color:var(--ai-foreground)] gap-2 w-full max-w-md">
                <h1 className="text-xl font-bold text-[color:var(--ai-foreground)]">{editMode ? 'Edit Course' : 'Add Course'}</h1>
                <div className="flex flex-col">
                    <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-[color:var(--ai-foreground)]">Course Name</label>
                    <input
                        type="text"
                        id="courseName"
                        className="bg-white dark:bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] text-sm rounded-lg focus:ring-[color:var(--ai-primary)] focus:border-[color:var(--ai-primary)] block w-full p-2.5"
                        placeholder="Course name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="courseDescription" className="block mb-2 text-sm font-medium text-[color:var(--ai-foreground)]">Course Description</label>
                    <textarea
                        rows={5}
                        id="courseDescription"
                        className="block p-2.5 w-full text-sm text-[color:var(--ai-foreground)] bg-white dark:bg-[color:var(--ai-card-bg)] rounded-lg border border-[color:var(--ai-card-border)] focus:ring-[color:var(--ai-primary)] focus:border-[color:var(--ai-primary)]"
                        placeholder="Course description"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="repoUrl" className="block mb-2 text-sm font-medium text-[color:var(--ai-foreground)]">Repository URL</label>
                    <input
                        type="url"
                        id="repoUrl"
                        className="bg-white dark:bg-[color:var(--ai-card-bg)] border border-[color:var(--ai-card-border)] text-[color:var(--ai-foreground)] text-sm rounded-lg focus:ring-[color:var(--ai-primary)] focus:border-[color:var(--ai-primary)] block w-full p-2.5"
                        placeholder="https://github.com/username/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="coursePrice" className="block mb-2 text-sm font-medium text-[color:var(--ai-foreground)]">Course Price</label>
                    <select
                        id="coursePrice"
                        title="Course Price"
                        className="block p-2.5 w-full text-sm text-[color:var(--ai-foreground)] bg-white dark:bg-[color:var(--ai-card-bg)] rounded-lg border border-[color:var(--ai-card-border)] focus:ring-[color:var(--ai-primary)] focus:border-[color:var(--ai-primary)]"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
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
                {loading ? <LoadingButton /> :
                    <button
                        type="button"
                        className="text-white bg-[color:var(--ai-primary)] hover:bg-[color:var(--ai-primary)]/80 focus:ring-4 focus:outline-none focus:ring-[color:var(--ai-primary)]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2"
                        onClick={editMode ? updateCourse : addCourse}
                    >
                        {editMode ? 'Update Course' : 'Add Course'}
                    </button>
                }
            </main>
        </>
    )
}
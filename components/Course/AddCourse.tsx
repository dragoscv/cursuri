
import { useState, useContext, useEffect, useCallback } from "react"
import { AppContext } from "@/components/AppContext"
import LoadingButton from "../Buttons/LoadingButton"
import { firestoreDB } from "@/utils/firebase/firebase.config";
import { doc, addDoc, collection } from "firebase/firestore";

export default function AddCourse(props: any) {
    const { onClose } = props

    const [courseName, setCourseName] = useState("")
    const [courseDescription, setCourseDescription] = useState("")
    const [coursePrice, setCoursePrice] = useState("")
    const [loading, setLoading] = useState(false)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { products } = context

    const addCourse = useCallback(() => {
        setLoading(true)
        const priceProduct = products.find((product: any) => product.prices.find((price: any) => price.id === coursePrice))
        const course = {
            name: courseName,
            description: courseDescription,
            price: coursePrice,
            priceProduct: priceProduct,
            status: "active"
        }
        addDoc(collection(firestoreDB, "courses"), course).then(() => {
            setLoading(false)
            onClose()
        }).catch((error) => {
            setLoading(false)
            console.log(error)
        })
    }, [products, courseName, courseDescription, coursePrice, onClose]);

    useEffect(() => {
        console.log(products);
    }, [products]);

    return (
        <>
            <main className="flex flex-col h-full items-start justify-center p-2 text-black dark:text-white gap-2 w-full max-w-md">
                <h1>Add Course</h1>
                <div className="flex flex-col">
                    <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Name</label>
                    <input
                        type="text"
                        id="courseName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Course name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="courseDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Description</label>
                    <textarea
                        rows={5}
                        id="courseDescription"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Course description"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label htmlFor="coursePrice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Price</label>
                    <select
                        id="coursePrice"
                        title="Course Price"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        defaultValue={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                    >
                        <option value="">Select a price</option>
                        {products.map((product: any) => (
                            product.prices.map((price: any) => (
                                <option key={price.id} value={price.id}>
                                    {(Number(price.unit_amount) / 100).toFixed(2)} {price.currency}
                                </option>
                            ))
                        ))}
                    </select>
                </div>
                {loading ? <LoadingButton /> :
                    <button
                        type="button"
                        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/30 dark:hover:bg-[#4285F4]/30 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2"
                        onClick={addCourse}
                    >
                        Add Course
                    </button>
                }
            </main>
        </>
    )
}
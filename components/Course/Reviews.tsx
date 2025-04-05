

import { useContext, useCallback, useState, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import { firestoreDB } from "firewand";
import { doc, addDoc, collection, Timestamp } from "firebase/firestore";
import LoadingButton from "../Buttons/LoadingButton";


export default function Reviews(props: any) {
    const { courseId } = props
    const [loading, setLoading] = useState(false)
    const [comment, setComment] = useState("")


    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { userPaidProducts, courses, user, reviews, getCourseReviews } = context


    const addReview = useCallback(() => {
        if (!user) return
        setLoading(true)
        const review = {
            comment: comment,
            rating: 5,
            userId: user.uid,
            user: {
                displayName: user.displayName,
                photoURL: user.photoURL,
            },
            courseId: courseId,
            createdAt: Timestamp.now(),
        }
        addDoc(collection(firestoreDB, `courses/${courseId}/reviews`), review).then(() => {
            console.log("Review added")
            setLoading(false)
        }).catch((error) => {
            console.log(error)
            setLoading(false)
        })
    }, [user, courseId, comment]);

    useEffect(() => {
        getCourseReviews(courseId)
    }, [courseId, getCourseReviews]);

    return (
        <>

            <div className="flex flex-col border items-center border-gray-700 rounded w-full max-w-md gap-2">
                {userPaidProducts?.find((userPaidProduct: any) => userPaidProduct.metadata.courseId === courseId) && (
                    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                            <label htmlFor="comment" className="sr-only">Your review</label>
                            <textarea id="comment" rows={4} className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write a review..." required
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                            {loading ? <LoadingButton /> :
                                <button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                                    onClick={addReview}
                                >
                                    Post review
                                </button>
                            }
                        </div>
                    </div>
                )}
                {Object.keys(reviews).map((key: any) => {
                    if (courseId === key) {
                        return (Object.entries(reviews[key]).map(([key, review]: any) => (
                            <div key={review.id} id={review.id}
                                className={`flex flex-col w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                                `}
                            >
                                <div className="flex flex-row items-center justify-between px-3 py-2 border-b dark:border-gray-600">
                                    <div className="flex flex-row items-center gap-2">
                                        <img className="w-8 h-8 rounded-full" src={review.user?.photoURL} alt={review.user?.displayName} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{review.user?.displayName}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createdAt.seconds * 1000).toLocaleDateString('ro-RO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false,
                                            })
                                            }</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{review.rating}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1l2.598 6.776h7.903l-6.385 4.92 2.598 6.776L10 13.552 3.284 19.472l2.598-6.776L0 7.776h7.903L10 1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="px-3 py-2">
                                    <p className="text-sm text-gray-900 dark:text-white">{review.comment}</p>
                                </div>
                            </div>
                        )))
                    }
                })}
            </div>


        </>
    )
}
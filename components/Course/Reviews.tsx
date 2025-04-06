import { useContext, useState, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import {
    firestoreDB,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    Timestamp
} from '@/utils/firebase/firestore'
import { useParams } from "next/navigation"
import { Rating, Button, Textarea } from "@heroui/react"
import { motion } from 'framer-motion'

export default function Reviews({ courseId: propCourseId }) {
    const [review, setReview] = useState('')
    const [stars, setStars] = useState(5)
    const [reviews, setReviews] = useState<any[]>([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { user } = context

    const params = useParams()
    const courseId = propCourseId || params.courseId

    const getReviews = async () => {
        setError('')
        setSuccess('')
        try {
            const q = query(collection(firestoreDB, "courses", courseId as string, "reviews"));
            const querySnapshot = await getDocs(q);
            const reviewsData: any[] = [];
            querySnapshot.forEach((doc) => {
                reviewsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setReviews(reviewsData);
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred')
        }
    }

    useEffect(() => {
        getReviews()
    }, [courseId])

    const handleReview = async (e: any) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsSubmitting(true)

        if (!user) {
            setError('You must be logged in to write a review')
            setIsSubmitting(false)
            return
        }

        try {
            await setDoc(doc(firestoreDB, "courses", courseId as string, "reviews", user.uid), {
                review,
                stars,
                userName: user.displayName || user.email,
                userEmail: user.email,
                userId: user.uid,
                timestamp: Timestamp.now()
            });
            setReview('')
            setStars(5)
            setSuccess('Review posted successfully!')
            getReviews()
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Write a review section */}
            <motion.div
                variants={itemVariants}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
            >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Write a Review</span>
                    </h3>
                </div>

                <div className="p-4">
                    <form onSubmit={handleReview}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your thoughts on this course</label>
                                <Textarea
                                    id="review"
                                    placeholder="Share your experience with this course..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="w-full"
                                    rows={4}
                                    variant="bordered"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your rating:</label>
                                <Rating size="lg" defaultValue={stars} onChange={setStars} />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
                                    {success}
                                </div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isDisabled={!user || isSubmitting}
                                    isLoading={isSubmitting}
                                    startContent={
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    }
                                >
                                    {user ? 'Submit Review' : 'Login to Review'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Reviews list section */}
            <motion.div
                variants={itemVariants}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
            >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>Student Reviews</span>
                        {reviews.length > 0 && (
                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                {reviews.length}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="p-4">
                    {reviews.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                            {review.userName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white">{review.userName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString() : 'Recently'}
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full shadow-sm">
                                            <Rating size="sm" value={review.stars} readOnly />
                                        </div>
                                    </div>
                                    <div className="ml-13 pl-13 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300/50 to-purple-300/50 dark:from-indigo-700/30 dark:to-purple-700/30 rounded-full"></div>
                                        <p className="pl-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {review.review}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reviews yet</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Be the first to share your experience with this course!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
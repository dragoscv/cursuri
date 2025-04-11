import { useContext, useState, useEffect } from "react"
import { AppContext } from "@/components/AppContext"
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    Timestamp
} from 'firebase/firestore'
import { firestoreDB } from '@/utils/firebase/firebase.config'
import { useParams } from "next/navigation"
import { Button, Textarea } from "@heroui/react"
// Using our custom RatingStars component 
import RatingStars from "../ui/RatingStars"
import { motion } from 'framer-motion'
import { FiStar } from '../icons/FeatherIcons'
import { FiEdit } from '../icons/FeatherIcons/FiEdit'
import { FiMessageCircle } from '../icons/FeatherIcons/FiMessageCircle'

export default function Reviews({ courseId: propCourseId }: { courseId: string }) {
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
            querySnapshot.forEach((doc: any) => {
                reviewsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setReviews(reviewsData);
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred')
        }
    }    useEffect(() => {
        getReviews()
    }, [courseId, getReviews])

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
                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
            >
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiEdit className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>Write a Review</span>
                    </h3>
                </div>

                <div className="p-4">
                    <form onSubmit={handleReview}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="review" className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-1">Your thoughts on this course</label>
                                <Textarea
                                    id="review"
                                    placeholder="Share your experience with this course..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="w-full bg-[color:var(--ai-card-bg)] border-[color:var(--ai-card-border)]"
                                    rows={4}
                                    variant="bordered"
                                    required
                                />
                            </div>                            <div className="flex items-center gap-2">                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)]">Your rating:</label>                                <RatingStars
                                size="lg"
                                defaultValue={Number(stars)}
                                value={Number(stars)}
                                onChange={(value) => setStars(value)}
                                classNames={{
                                    base: "gap-1",
                                    item: "text-[color:var(--ai-accent)]"
                                }}
                            />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    {success}
                                </div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isDisabled={!user || isSubmitting}
                                    isLoading={isSubmitting}
                                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none transition-transform hover:scale-[1.02]"
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
                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
            >
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiMessageCircle className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>Student Reviews</span>
                        {reviews.length > 0 && (
                            <span className="ml-2 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                {reviews.length}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="p-4">
                    {reviews.length > 0 ? (
                        <div className="divide-y divide-[color:var(--ai-card-border)]/50">
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="py-4 first:pt-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                            {review.userName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-[color:var(--ai-foreground)]">{review.userName}</div>
                                            <div className="text-xs text-[color:var(--ai-muted)]">
                                                {review.timestamp ? new Date(review.timestamp.toDate()).toLocaleDateString() : 'Recently'}
                                            </div>
                                        </div>                                        <div className="flex items-center bg-[color:var(--ai-accent)]/10 px-2 py-1 rounded-full shadow-sm">                                        <RatingStars
                                            size="sm"
                                            value={typeof review.stars === 'string' ? Number(review.stars) : review.stars}
                                            readOnly
                                            classNames={{
                                                base: "gap-1",
                                                item: "text-[color:var(--ai-accent)]"
                                            }}
                                        />
                                        </div>
                                    </div>
                                    <div className="relative pl-3">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[color:var(--ai-primary)]/30 to-[color:var(--ai-secondary)]/30 rounded-full"></div>
                                        <p className="pl-3 text-[color:var(--ai-muted)] text-sm leading-relaxed">
                                            {review.review}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FiStar className="w-16 h-16 text-[color:var(--ai-muted)]/40 mb-4" />
                            <h3 className="text-lg font-medium text-[color:var(--ai-foreground)] mb-1">No reviews yet</h3>
                            <p className="text-sm text-[color:var(--ai-muted)]">
                                Be the first to share your experience with this course!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
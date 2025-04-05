import { useContext, useState } from "react"
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
import { Rating } from "@heroui/react"

export default function Reviews() {
    const [review, setReview] = useState('')
    const [stars, setStars] = useState(5)
    const [reviews, setReviews] = useState<any[]>([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const context = useContext(AppContext)
    if (!context) {
        throw new Error("You probably forgot to put <AppProvider>.")
    }
    const { user } = context

    const params = useParams()
    const courseId = params.courseId

    const getReviews = async () => {
        setError('')
        setSuccess('')
        try {
            const q = query(collection(firestoreDB, "courses", courseId as string, "reviews"));
            const querySnapshot = await getDocs(q);
            const reviews: any[] = [];
            querySnapshot.forEach((doc) => {
                reviews.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setReviews(reviews);
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred')
        }
    }

    useState(() => {
        getReviews()
    })

    const handleReview = async (e: any) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!user) {
            setError('You must be logged in to write a review')
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
        }
    }

    return (
        <div className="flex flex-col items-center justify-start p-24 gap-4">
            <div className="flex flex-col border items-center border-[color:var(--ai-card-border)] rounded w-full max-w-md gap-2">
                <h2>Write a Review</h2>
                <form onSubmit={handleReview}>
                    <div className="w-full mb-4 border border-[color:var(--ai-card-border)] rounded-lg bg-[color:var(--ai-card-bg)]">
                        <div className="px-4 py-2 bg-[color:var(--ai-card-bg)] rounded-t-lg">
                            <textarea
                                id="comment"
                                rows={4}
                                className="w-full px-0 text-sm text-[color:var(--ai-foreground)] bg-[color:var(--ai-card-bg)] border-0 focus:ring-0"
                                placeholder="Write a review..."
                                required
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-[color:var(--ai-card-border)]">
                            <div className="flex gap-2 pl-0 items-center">
                                <button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-[color:var(--ai-foreground-inverse)] bg-[color:var(--ai-primary)] rounded-lg focus:ring-4 focus:ring-[color:var(--ai-primary)]/30 hover:bg-[color:var(--ai-primary)]/90"
                                >
                                    Post review
                                </button>
                                <Rating defaultValue={stars} onChange={setStars} />
                            </div>
                        </div>
                    </div>
                </form>
                {error && <div className="text-red-500">{error}</div>}
                {success && <div className="text-green-500">{success}</div>}

                <h2>Reviews</h2>
                <div className="flex flex-col w-full gap-4">
                    {reviews.map((review) => (
                        <div key={review.id}
                            className={`flex flex-col w-full border border-[color:var(--ai-card-border)] rounded-lg bg-[color:var(--ai-card-bg)]
                                p-4`}
                        >
                            <div className="flex flex-row items-center justify-between px-3 py-2 border-b border-[color:var(--ai-card-border)]">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[color:var(--ai-primary)]/20 flex items-center justify-center">
                                        {review.userName?.[0] || 'U'}
                                    </div>
                                    <div>{review.userName}</div>
                                </div>
                                <div>
                                    <Rating value={review.stars} readOnly />
                                </div>
                            </div>
                            <div className="p-3">
                                {review.review}
                            </div>
                            <div className="text-[color:var(--ai-muted)] text-sm px-3">
                                {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
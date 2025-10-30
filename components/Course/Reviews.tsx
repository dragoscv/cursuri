import { useContext, useState, useEffect } from 'react';
import { AppContext } from '@/components/AppContext';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import RichTextEditor from '@/components/Lesson/QA/RichTextEditor';
// Using our custom RatingStars component
import RatingStars from '../ui/RatingStars';
import { motion } from 'framer-motion';
import { FiStar } from '../icons/FeatherIcons';
import { FiEdit } from '../icons/FeatherIcons/FiEdit';
import { FiMessageCircle } from '../icons/FeatherIcons/FiMessageCircle';

export default function Reviews({ courseId: propCourseId, isPurchased = false }: { courseId: string; isPurchased?: boolean }) {
    const [review, setReview] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [rating, setRating] = useState(5);
    const [reviews, setReviews] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasExistingReview, setHasExistingReview] = useState(false);

    const context = useContext(AppContext);
    if (!context) {
        throw new Error('You probably forgot to put <AppProvider>.');
    }
    const { user, subscriptions } = context;

    const params = useParams();
    const courseId = propCourseId || params.courseId;
    const t = useTranslations('courses.reviewsSection');

    const handleEditorChange = (text: string, html: string) => {
        setReview(text);
        setHtmlContent(html);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!user || reviewId !== user.uid) return;

        if (!confirm(t('confirmDeleteReview'))) return;

        try {
            await deleteDoc(doc(firestoreDB, 'courses', courseId as string, 'reviews', reviewId));
            setSuccess(t('reviewDeleted'));
            setReview('');
            setHtmlContent('');
            setRating(5);
            setHasExistingReview(false);
            getReviews();
        } catch (error: any) {
            setError(error?.message || 'Failed to delete review');
        }
    };

    const getReviews = async () => {
        setError('');
        setSuccess('');
        try {
            const q = query(collection(firestoreDB, 'courses', courseId as string, 'reviews'));
            const querySnapshot = await getDocs(q);
            const reviewsData: any[] = [];
            querySnapshot.forEach((doc: any) => {
                reviewsData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            setReviews(reviewsData);

            // Check if current user has already submitted a review
            if (user) {
                const userReview = reviewsData.find((r) => r.userId === user.uid);
                if (userReview) {
                    setReview(userReview.review || '');
                    setHtmlContent(userReview.htmlContent || '');
                    setRating(Number(userReview.rating) || 5);
                    setHasExistingReview(true);
                } else {
                    setReview('');
                    setHtmlContent('');
                    setRating(5);
                    setHasExistingReview(false);
                }
            }
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred');
        }
    };

    // Check for active subscription from context
    const hasSubscription = subscriptions && subscriptions.length > 0 && subscriptions.some((sub: any) => 
        sub.status === 'active' || sub.status === 'trialing'
    );

    useEffect(() => {
        if (courseId) {
            getReviews();
        }
    }, [courseId]);

    const handleReview = async (e: any) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!user) {
            setError(t('mustBeLoggedIn'));
            setIsSubmitting(false);
            return;
        }

        try {
            await setDoc(doc(firestoreDB, 'courses', courseId as string, 'reviews', user.uid), {
                review,
                htmlContent,
                rating,
                userName: user.displayName || user.email,
                userEmail: user.email,
                userId: user.uid,
                timestamp: Timestamp.now(),
            });
            setReview('');
            setHtmlContent('');
            setRating(5);
            setHasExistingReview(false);
            setSuccess(hasExistingReview ? t('reviewUpdated') : t('reviewPosted'));
            getReviews();
        } catch (error: any) {
            setError(error?.message || 'Unknown error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                damping: 12,
            },
        },
    };

    // Check if user has access (purchased OR subscribed)
    const hasAccess = isPurchased || hasSubscription;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Write a review section - only show if user has purchased or has active subscription */}
            {hasAccess && (
                <motion.div
                variants={itemVariants}
                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
            >
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiEdit className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>{hasExistingReview ? t('editReview') : t('writeReview')}</span>
                    </h3>
                </div>

                <div className="p-4">
                    <form onSubmit={handleReview}>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="review"
                                    className="block text-sm font-medium text-[color:var(--ai-foreground)] mb-2"
                                >
                                    {t('yourThoughts')}
                                </label>
                                <RichTextEditor
                                    value={htmlContent}
                                    onChange={handleEditorChange}
                                    placeholder={t('shareExperience')}
                                    minHeight={150}
                                />
                            </div>{' '}
                            <div className="flex items-center gap-2">
                                {' '}
                                <label className="block text-sm font-medium text-[color:var(--ai-foreground)]">
                                    {t('yourRating')}
                                </label>{' '}
                                <RatingStars
                                    size="lg"
                                    value={rating}
                                    onChange={(value) => setRating(value)}
                                    classNames={{
                                        base: 'gap-1',
                                        item: 'text-[color:var(--ai-accent)]',
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
                                    size="md"
                                    radius="lg"
                                    color="primary"
                                    isDisabled={!user || isSubmitting || !review.trim()}
                                    isLoading={isSubmitting}
                                    className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white border-none transition-transform hover:scale-[1.02] rounded-lg font-semibold"
                                    startContent={
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 4V20M4 12H20"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    }
                                >
                                    {!user
                                        ? t('loginToReview')
                                        : hasExistingReview
                                            ? t('updateReview')
                                            : t('submitReview')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
            )}

            {/* Reviews list section */}
            <motion.div
                variants={itemVariants}
                className="border border-[color:var(--ai-card-border)] rounded-xl overflow-hidden bg-[color:var(--ai-card-bg)] shadow-sm"
            >
                <div className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 via-[color:var(--ai-secondary)]/10 to-transparent py-3 px-4 border-b border-[color:var(--ai-card-border)]">
                    <h3 className="font-medium text-[color:var(--ai-foreground)] flex items-center">
                        <FiMessageCircle className="mr-2 text-[color:var(--ai-primary)]" />
                        <span>{t('studentReviews')}</span>
                        {reviews.length > 0 && (
                            <span className="ml-2 text-xs bg-[color:var(--ai-primary)]/10 text-[color:var(--ai-primary)] px-2 py-0.5 rounded-full">
                                {reviews.length}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="p-4">
                    {reviews.length > 0 ? (
                        <div className="divide-y divide-[color:var(--ai-card-border)]/50 w-full">
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="py-4 first:pt-0 last:pb-0 w-full"
                                >
                                    <div className="flex items-start gap-3 mb-3 w-full">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] flex items-center justify-center text-white font-medium text-lg shadow-sm">
                                            {review.userName?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-[color:var(--ai-foreground)] truncate">
                                                        {review.userName}
                                                    </div>
                                                    <div className="text-xs text-[color:var(--ai-muted)]">
                                                        {review.timestamp
                                                            ? new Date(review.timestamp.toDate()).toLocaleDateString()
                                                            : t('recently')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center bg-[color:var(--ai-accent)]/10 px-2 py-1 rounded-full shadow-sm flex-shrink-0">
                                                        <RatingStars
                                                            size="sm"
                                                            value={
                                                                typeof review.rating === 'string'
                                                                    ? Number(review.rating)
                                                                    : review.rating
                                                            }
                                                            readOnly
                                                            classNames={{
                                                                base: 'gap-1',
                                                                item: 'text-[color:var(--ai-accent)]',
                                                            }}
                                                        />
                                                    </div>
                                                    {user && review.userId === user.uid && (
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                                            title={t('deleteReview')}
                                                            aria-label="Delete review"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="relative pl-3 mt-2">
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[color:var(--ai-primary)]/30 to-[color:var(--ai-secondary)]/30 rounded-full"></div>
                                                <div className="pl-3 text-[color:var(--ai-muted)] text-sm leading-relaxed text-justify">
                                                    {review.htmlContent ? (
                                                        <div dangerouslySetInnerHTML={{ __html: review.htmlContent }} />
                                                    ) : (
                                                        <p>{review.review}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FiStar className="w-16 h-16 text-[color:var(--ai-muted)]/40 mb-4" />
                            <h3 className="text-lg font-medium text-[color:var(--ai-foreground)] mb-1">
                                {t('noReviewsYet')}
                            </h3>
                            <p className="text-sm text-[color:var(--ai-muted)]">{t('beTheFirst')}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

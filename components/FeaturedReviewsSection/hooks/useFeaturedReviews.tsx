'use client'

import { useState, useEffect } from 'react'
import { Review } from '@/types'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { firestoreDB } from '@/utils/firebase/config'
import { fallbackReviews } from '../fallbackReviewData'

export const useFeaturedReviews = (count: number = 3): Review[] => {
    const [reviews, setReviews] = useState<Review[]>([])

    useEffect(() => {
        const fetchFeaturedReviews = async () => {
            try {
                // Query for reviews with rating >= 4, ordered by rating (descending)
                const reviewsQuery = query(
                    collection(firestoreDB, 'reviews'),
                    where('rating', '>=', 4),
                    where('featured', '==', true),
                    orderBy('rating', 'desc'),
                    orderBy('createdAt', 'desc'),
                    limit(count)
                )

                const querySnapshot = await getDocs(reviewsQuery)
                const fetchedReviews: Review[] = []

                querySnapshot.forEach((doc) => {
                    fetchedReviews.push({
                        id: doc.id,
                        ...doc.data()
                    } as Review)
                })

                setReviews(fetchedReviews)
            } catch (error) {
                console.error("Error fetching featured reviews:", error)
                setReviews(fallbackReviews.slice(0, count))
            }
        }

        fetchFeaturedReviews()
    }, [count])

    return reviews
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Review } from '@/types';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { useTranslations } from 'next-intl';
import { getFallbackReviews } from '../fallbackReviewData';

// Cache the reviews in memory to avoid unnecessary Firestore calls
const reviewsCache: Record<number, { data: Review[]; timestamp: number }> = {};
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const useFeaturedReviews = (count: number = 3): Review[] => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const isMounted = useRef(true);
  const t = useTranslations('home');

  useEffect(() => {
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      // Check cache first
      if (reviewsCache[count] && Date.now() - reviewsCache[count].timestamp < CACHE_TIME) {
        setReviews(reviewsCache[count].data);
        return;
      }

      try {
        // Query for reviews with rating >= 4, ordered by rating (descending)
        const reviewsQuery = query(
          collection(firestoreDB, 'reviews'),
          where('rating', '>=', 4),
          where('featured', '==', true),
          orderBy('rating', 'desc'),
          orderBy('createdAt', 'desc'),
          limit(count)
        );

        const querySnapshot = await getDocs(reviewsQuery);
        const fetchedReviews: Review[] = [];

        querySnapshot.forEach((doc) => {
          fetchedReviews.push({
            id: doc.id,
            ...doc.data(),
          } as Review);
        });

        // Only update state if component is still mounted
        if (isMounted.current) {
          setReviews(fetchedReviews);

          // Update cache
          reviewsCache[count] = {
            data: fetchedReviews,
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error);
        if (isMounted.current) {
          setReviews(getFallbackReviews(t).slice(0, count));
        }
      }
    };

    fetchFeaturedReviews();
  }, [count]);

  return reviews;
};

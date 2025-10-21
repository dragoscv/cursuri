import { Review } from "@/types";

// These fallback reviews use translation keys - actual content comes from home.json
// This approach allows dynamic language switching without hardcoding content
export function getFallbackReviews(t: any): Review[] {
    return [
        {
            id: "1",
            content: t('fallback.review1.content'),
            author: {
                name: t('fallback.review1.author'),
                role: t('fallback.review1.role'),
                avatar: "https://i.pravatar.cc/150?img=11"
            },
            rating: 5,
            courseType: t('fallback.review1.courseType')
        },
        {
            id: "2",
            content: t('fallback.review2.content'),
            author: {
                name: t('fallback.review2.author'),
                role: t('fallback.review2.role'),
                avatar: "https://i.pravatar.cc/150?img=5"
            },
            rating: 5,
            courseType: t('fallback.review2.courseType')
        },
        {
            id: "3",
            content: t('fallback.review3.content'),
            author: {
                name: t('fallback.review3.author'),
                role: t('fallback.review3.role'),
                avatar: "https://i.pravatar.cc/150?img=8"
            },
            rating: 4,
            courseType: t('fallback.review3.courseType')
        }
    ];
}

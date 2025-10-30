import type { Metadata } from 'next';

// Base URL for the website - update this with your actual domain in production
export const siteConfig = {
    name: 'StudiAI',
    description: 'Advance your career with expert-led online courses in programming, technology, and digital skills.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro',
    ogImage: '/images/og-image.jpg',
    links: {
        twitter: 'https://twitter.com/studiai',
        github: 'https://github.com/studiai',
    },
};

// Define OpenGraph types supported by Next.js
type OpenGraphType = 'website' | 'article' | 'book' | 'profile' | 'music.song' |
    'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' |
    'video.episode' | 'video.tv_show' | 'video.other';

type MetadataProps = {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    canonical?: string;
    type?: OpenGraphType | 'course' | 'lesson';
    publishedTime?: string;
    modifiedTime?: string;
    robots?: {
        index?: boolean;
        follow?: boolean;
        googleBot?: {
            index?: boolean;
            follow?: boolean;
            'max-video-preview'?: number;
            'max-image-preview'?: string;
            'max-snippet'?: number;
        };
    };
};

/**
 * Generate metadata for a page
 * 
 * @param props - Metadata properties
 * @returns Metadata object for Next.js
 */
export function constructMetadata({
    title,
    description,
    keywords,
    image,
    canonical,
    type = 'website',
    publishedTime,
    modifiedTime,
    robots,
}: MetadataProps = {}): Metadata {
    const metaTitle = title
        ? `${title} | ${siteConfig.name}`
        : siteConfig.name;

    const metaDescription = description || siteConfig.description;
    const metaImage = image || `${siteConfig.url}${siteConfig.ogImage}`;
    const url = canonical || siteConfig.url;

    // Convert custom types to standard OpenGraph types
    let ogType = type;
    if (type === 'course' || type === 'lesson') {
        ogType = 'article';
    }

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: keywords?.join(', '),
        authors: [
            {
                name: siteConfig.name,
                url: siteConfig.url,
            },
        ],
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            url,
            siteName: siteConfig.name,
            images: [
                {
                    url: metaImage,
                    width: 1200,
                    height: 630,
                    alt: metaTitle,
                },
            ],
            locale: 'en_US',
            type: ogType as OpenGraphType,
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: [metaImage],
            site: '@studiai',
            creator: '@studiai',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: '/apple-touch-icon.png',
            other: [
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    url: '/favicon-32x32.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '16x16',
                    url: '/favicon-16x16.png',
                },
                {
                    rel: 'manifest',
                    url: '/site.webmanifest',
                },
            ],
        },
    };
}

/**
 * Generate metadata for a course page
 * 
 * @param course - Course data
 * @returns Metadata object for Next.js
 */
export function constructCourseMetadata(course: {
    title: string;
    description: string;
    instructorName: string;
    updatedAt?: string;
    createdAt?: string;
    slug: string;
    coverImage?: string;
}) {
    const {
        title,
        description,
        instructorName,
        updatedAt,
        createdAt,
        slug,
        coverImage
    } = course;

    const courseUrl = `${siteConfig.url}/courses/${slug}`;
    const imageUrl = coverImage || `${siteConfig.url}${siteConfig.ogImage}`;

    const keywords = [
        title,
        instructorName,
        'online course',
        'e-learning',
        'education',
        'technology course',
        'professional development',
    ];

    return constructMetadata({
        title,
        description,
        keywords,
        image: imageUrl,
        canonical: courseUrl,
        type: 'course',
        publishedTime: createdAt,
        modifiedTime: updatedAt,
    });
}

/**
 * Generate structured data for a course (JSON-LD)
 * 
 * @param course - Course data
 * @returns JSON-LD object as string
 */
/**
 * Generate metadata for a lesson page
 * 
 * @param lesson - Lesson data
 * @param course - Course data
 * @returns Metadata object for Next.js
 */
export function constructLessonMetadata(lesson: {
    title: string;
    description?: string;
    isFree?: boolean;
    updatedAt?: string;
    createdAt?: string;
    id: string;
    courseId: string;
    duration?: number;
}, course: {
    title: string;
    instructorName: string;
    slug?: string;
    id?: string;
}) {
    const {
        title: lessonTitle,
        description,
        isFree,
        updatedAt,
        createdAt,
        id: lessonId,
        courseId
    } = lesson;

    const {
        title: courseTitle,
        instructorName,
        id = courseId
    } = course;

    const courseSlug = course.slug || courseId;
    const lessonUrl = `${siteConfig.url}/courses/${courseSlug}/lessons/${lessonId}`;

    const keywords = [
        lessonTitle,
        courseTitle,
        instructorName,
        'online course',
        'e-learning',
        'education',
        'lesson',
        'learning material',
        isFree ? 'free lesson' : 'premium content',
    ];

    const metaDescription = description || `${lessonTitle} - Part of the ${courseTitle} course. Learn at your own pace with StudiAI.`;

    return constructMetadata({
        title: `${lessonTitle} | ${courseTitle}`,
        description: metaDescription,
        keywords,
        canonical: lessonUrl,
        type: 'lesson',
        publishedTime: createdAt,
        modifiedTime: updatedAt,
        robots: isFree
            ? { index: true, follow: true }
            : { index: false, follow: true }
    });
}

export function generateCourseStructuredData(course: {
    title: string;
    description: string;
    instructorName: string;
    updatedAt?: string;
    createdAt?: string;
    slug: string;
    coverImage?: string;
    price?: number;
    rating?: number;
    ratingCount?: number;
    lessons?: { title: string; duration?: number }[];
}) {
    const {
        title,
        description,
        instructorName,
        updatedAt,
        createdAt,
        slug,
        coverImage,
        price,
        rating,
        ratingCount,
        lessons = []
    } = course;

    const courseUrl = `${siteConfig.url}/courses/${slug}`;
    const imageUrl = coverImage || `${siteConfig.url}${siteConfig.ogImage}`;

    const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: title,
        description,
        provider: {
            '@type': 'Organization',
            name: siteConfig.name,
            sameAs: siteConfig.url,
        },
        author: {
            '@type': 'Person',
            name: instructorName,
        },
        dateCreated: createdAt,
        dateModified: updatedAt,
        url: courseUrl,
        image: imageUrl,
        ...(price !== undefined && {
            offers: {
                '@type': 'Offer',
                price: price.toString(),
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: courseUrl,
                validFrom: createdAt,
            },
        }),
        ...(rating !== undefined && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: rating.toString(),
                ratingCount: ratingCount || 0,
                bestRating: '5',
                worstRating: '1',
            },
        }),
        ...(totalDuration > 0 && {
            timeRequired: `PT${Math.floor(totalDuration / 60)}H${totalDuration % 60}M`,
        }),
        ...(lessons.length > 0 && {
            hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: 'online',
                courseWorkload: `PT${Math.floor(totalDuration / 60)}H${totalDuration % 60}M per week`,
            },
        }),
    };

    return JSON.stringify(structuredData);
}

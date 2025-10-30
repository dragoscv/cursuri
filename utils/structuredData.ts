/**
 * Structured data utilities for SEO
 */

// Base URL for the website
const siteConfig = {
    name: 'StudiAI',
    description: 'Advance your career with expert-led online courses in programming, technology, and digital skills.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://studiai.ro',
    ogImage: '/images/og-image.jpg',
};

/**
 * Generate breadcrumb structured data for a page (JSON-LD)
 * 
 * @param items - Array of breadcrumb items, in order from home to current page
 * @returns JSON-LD object as string
 */
export function generateBreadcrumbStructuredData(items: Array<{
    name: string;
    url: string;
    position: number;
}>): string {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map(item => ({
            '@type': 'ListItem',
            position: item.position,
            name: item.name,
            item: item.url
        }))
    };

    return JSON.stringify(structuredData);
}

/**
 * Generate structured data for a course lesson (JSON-LD)
 * 
 * @param lesson - Lesson data
 * @param course - Course data
 * @param courseUrl - URL of the course page
 * @param lessonUrl - URL of the lesson page
 * @returns JSON-LD object as string
 */
export function generateLessonStructuredData(
    lesson: Record<string, any>,
    course: Record<string, any>,
    courseUrl: string,
    lessonUrl: string
): string {
    const data: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: lesson.title,
        description: lesson.description || `Lesson in ${course.title}`,
        isPartOf: {
            '@type': 'Course',
            name: course.title,
            url: courseUrl,
        },
        provider: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        }
    };

    // Add optional properties if available
    if (lesson.createdAt) {
        data.datePublished = new Date(lesson.createdAt).toISOString();
    }

    if (lesson.updatedAt) {
        data.dateModified = new Date(lesson.updatedAt).toISOString();
    }

    if (lesson.order !== undefined) {
        data.position = lesson.order;
    }

    if (lesson.difficulty) {
        data.educationalLevel = lesson.difficulty;
    }

    if (lesson.format) {
        data.accessMode = lesson.format;
    }

    // Add timeRequired if duration is available
    if (lesson.duration) {
        // Convert minutes to ISO 8601 duration
        const hours = Math.floor(lesson.duration / 60);
        const minutes = lesson.duration % 60;
        data.timeRequired = `PT${hours ? hours + 'H' : ''}${minutes ? minutes + 'M' : ''}`;
    }

    // Add educational alignment if we have categories or tags
    if (lesson.categories || lesson.tags) {
        data.educationalAlignment = [];

        if (lesson.categories) {
            const categories = Array.isArray(lesson.categories)
                ? lesson.categories
                : [lesson.categories];

            categories.forEach((category: string) => {
                data.educationalAlignment.push({
                    '@type': 'AlignmentObject',
                    alignmentType: 'educationalSubject',
                    targetName: category
                });
            });
        }

        if (lesson.tags) {
            const tags = Array.isArray(lesson.tags) ? lesson.tags : [lesson.tags];

            tags.forEach((tag: string) => {
                data.educationalAlignment.push({
                    '@type': 'AlignmentObject',
                    alignmentType: 'educationalTopic',
                    targetName: tag
                });
            });
        }
    }

    return JSON.stringify(data);
}

/**
 * Generate structured data for a course (JSON-LD)
 */
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
}): string {
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

    const structuredData: Record<string, any> = {
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
    };

    if (price !== undefined) {
        structuredData.offers = {
            '@type': 'Offer',
            price: price.toString(),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: courseUrl,
            validFrom: createdAt,
        };
    }

    if (rating !== undefined) {
        structuredData.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toString(),
            ratingCount: ratingCount || 0,
            bestRating: '5',
            worstRating: '1',
        };
    }

    if (totalDuration > 0) {
        structuredData.timeRequired = `PT${Math.floor(totalDuration / 60)}H${totalDuration % 60}M`;
    }

    if (lessons.length > 0) {
        structuredData.hasCourseInstance = {
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: `PT${Math.floor(totalDuration / 60)}H${totalDuration % 60}M per week`,
        };
    }

    return JSON.stringify(structuredData);
}

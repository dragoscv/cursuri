import { MetadataRoute } from 'next'
import { siteConfig } from '@/utils/metadata'
import { getCourses } from '@/utils/firebase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all courses to generate course URLs
  let courses: any[] = [];
  try {
    courses = await getCourses();
  } catch (error) {
    console.error("Error fetching courses for sitemap:", error);
    // Continue with empty courses array if fetch fails
  }

  // Static routes with their last modified date
  const routes = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/gdpr`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]
  // Generate course URLs
  const courseUrls = courses.map((course) => {
    // Ensure we have valid dates or use current date as fallback
    let lastModDate = new Date();
    try {
      if (course.updatedAt) {
        lastModDate = new Date(course.updatedAt);
      } else if (course.createdAt) {
        lastModDate = new Date(course.createdAt);
      }
      // Check if the date is valid
      if (isNaN(lastModDate.getTime())) {
        lastModDate = new Date(); // Use current date as fallback
      }
    } catch (e) {
      console.error("Invalid date for course", course.id);
      lastModDate = new Date(); // Use current date as fallback
    }

    return {
      url: `${siteConfig.url}/courses/${course.slug || course.id}`,
      lastModified: lastModDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  return [...routes, ...courseUrls]
}

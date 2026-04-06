/**
 * Generate a course URL path using slug when available, falling back to ID.
 * This ensures human-readable, SEO-friendly URLs for AI and search engines.
 */
export function getCourseUrl(course: { id?: string; slug?: string; courseId?: string }): string {
  const slug = course.slug || course.courseId || course.id;
  return `/courses/${slug}`;
}

/**
 * Generate a lesson URL path using course slug when available.
 */
export function getLessonUrl(
  course: { id?: string; slug?: string; courseId?: string },
  lessonId: string
): string {
  const slug = course.slug || course.courseId || course.id;
  return `/courses/${slug}/lessons/${lessonId}`;
}

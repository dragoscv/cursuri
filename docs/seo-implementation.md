# SEO Implementation Guide for Cursuri

This document outlines the SEO strategy and implementation details for the Cursuri online learning platform.

## Architecture Overview

The Cursuri platform uses Next.js 14's metadata API to implement comprehensive SEO features across the site. The implementation follows these key principles:

1. **Centralized Configuration**: Core SEO settings are defined in a central utility (`utils/metadata.ts`).
2. **Page-Specific Metadata**: Each page defines its own metadata using the centralized utilities.
3. **Dynamic Metadata**: Course and lesson pages generate metadata based on their content.
4. **Structured Data**: JSON-LD implementation for rich search results.
5. **Technical SEO**: Site optimizations for performance, accessibility, and indexability.

## Implementation Components

### 1. `utils/metadata.ts`

The core utility that provides:

- Default site configuration (`siteConfig`)
- Functions to generate metadata for different page types:
  - `constructMetadata()`: General pages
  - `constructCourseMetadata()`: Course detail pages
  - `generateCourseStructuredData()`: JSON-LD for course pages

### 2. Root Layout Metadata

The root layout (`app/layout.tsx`) defines default metadata that applies to all pages:

```typescript
export const metadata = constructMetadata();
```

### 3. Page-Specific Metadata

Each page defines its own metadata using the `generateMetadata` function:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Page Title",
    description: "Page description",
    // other properties
  });
}
```

### 4. Dynamic Course Metadata

Course detail pages generate metadata based on course content:

```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  return constructCourseMetadata(course);
}
```

### 5. Structured Data Implementation

Course pages include JSON-LD structured data for rich search results:

```typescript
export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourseBySlug(params.slug);
  const structuredData = generateCourseStructuredData(course);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      {/* Page content */}
    </>
  );
}
```

## SEO Features Implemented

1. **Basic Metadata**:

   - Title tags
   - Meta descriptions
   - Canonical URLs
   - Language attributes

2. **Social Media Optimization**:

   - Open Graph tags
   - Twitter Card tags
   - Social images

3. **Structured Data (JSON-LD)**:

   - Course schema
   - Organization schema
   - Person schema (for instructors)
   - Rating schema

4. **Technical SEO**:

   - Proper heading structure
   - Semantic HTML
   - Mobile responsiveness
   - Breadcrumb navigation
   - Sitemap.xml
   - robots.txt

5. **Indexability Controls**:
   - robots meta tags
   - Pagination controls

## Best Practices for Ongoing SEO Maintenance

1. **Content Quality**:

   - Ensure all courses have complete, descriptive information
   - Use keyword-rich but natural titles and descriptions
   - Keep content fresh and updated

2. **Performance Monitoring**:

   - Monitor page speed and Core Web Vitals
   - Review search console data regularly
   - Track ranking performance

3. **Content Expansion**:

   - Create valuable blog content related to courses
   - Build out course category pages
   - Develop instructor profile pages

4. **Technical Checks**:
   - Regularly audit for broken links
   - Check for crawl errors in Search Console
   - Verify mobile friendliness
   - Update structured data as schema standards evolve

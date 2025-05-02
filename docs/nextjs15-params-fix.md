# Next.js 15 Dynamic Route Params Fix

## Issue

In Next.js 15, using dynamic route parameters directly without awaiting them causes the following error:

```
Error: Route "/courses/[courseId]" used `params.courseId`. `params` should be awaited before using its properties.
Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
```

## Files Fixed

1. `app/courses/[courseId]/page.tsx`

   - Updated `generateMetadata` and `Page` functions to properly await the params object
   - Changed from directly accessing `params.courseId` to using `const resolvedParams = await params`

2. `app/courses/[courseId]/lessons/[lessonId]/page.tsx`
   - Updated both `generateMetadata` and `Page` functions to await params before accessing properties
   - Used the pattern `const resolvedParams = await params` for consistency

## Solution Pattern

For server components with dynamic routes in Next.js 15, use this pattern:

```typescript
export default async function Page({ params }: { params: { someId: string } }) {
  // Await params before accessing properties
  const resolvedParams = await params;
  const someId = resolvedParams.someId;

  // Rest of component logic
}
```

## Why This Works

Next.js 15 made dynamic route params a Promise in server components to ensure consistency with other data fetching APIs. This helps with:

- Ensuring consistent data loading patterns
- Preventing race conditions between data fetching and parameter resolution
- Enabling better streaming and partial hydration

## Client-Side Routes

Note that client components using the `useParams()` hook don't need this fix, as the hook already handles the Promise resolution internally. All admin routes in this project use the client-side `useParams()` and didn't require updates.

## Resources

- [Next.js Messages: Sync Dynamic APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)

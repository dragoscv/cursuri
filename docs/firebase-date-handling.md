# Firebase Date Handling and Parameter Handling in Next.js

## Issues

### Issue 1: Invalid Date Values

When rendering a lesson page, we encountered a `RangeError: Invalid time value` error. This occurred when trying to convert Firebase timestamp or date fields (`course.updatedAt` and `course.createdAt`) to ISO strings using `new Date().toISOString()`.

The error occurred in `app/courses/[courseId]/lessons/[lessonId]/page.tsx` when generating structured data for the page.

### Issue 2: Parameter Handling in Next.js 15

We also encountered issues with the dynamic route parameters in Next.js 15, including:

- A `ReferenceError: resolvedParams is not defined` error caused by a syntax error in the code
- Parameters being passed as empty values to client components
- Non-existent lesson IDs not being properly handled

## Root Cause

Firebase Firestore can store dates in multiple formats:

1. As Firestore Timestamp objects (with `seconds` and `nanoseconds` properties)
2. As ISO strings
3. As Unix timestamps (numbers)

When trying to convert these various formats to ISO strings, we were not handling all possible cases or malformed dates properly, leading to the "Invalid time value" error.

## Solutions

### Solution 1: Safe Date Conversion

We implemented a `safeToISOString` helper function that:

1. Handles Firestore Timestamp objects by checking for the `seconds` property
2. Safely converts normal date strings or numbers
3. Uses try/catch to prevent errors for invalid date values
4. Returns `undefined` instead of throwing errors when date conversion fails

```typescript
const safeToISOString = (dateValue: any): string | undefined => {
  if (!dateValue) return undefined;

  try {
    // Handle Firestore timestamps that might be objects with seconds and nanoseconds
    if (typeof dateValue === "object" && "seconds" in dateValue) {
      return new Date(dateValue.seconds * 1000).toISOString();
    }

    // Handle normal date strings or numbers
    return new Date(dateValue).toISOString();
  } catch (error) {
    console.error("Invalid date value:", dateValue, error);
    return undefined;
  }
};
```

### Solution 2: Proper Parameter Handling in Next.js 15

We fixed several issues related to parameter handling in Next.js 15:

1. Fixed a syntax error where a comment was injected into a variable declaration
2. Improved explicit handling of parameters with proper string conversion:

```typescript
// Ensure params are strings
const courseId = String(resolvedParams.courseId);
const lessonId = String(resolvedParams.lessonId);
```

3. Added more robust error handling and user feedback for non-existent lessons:

```typescript
// Check if lesson exists - if not, show user-friendly message
if (!lessonExists) {
  console.log("No such lesson exists in fallback path!");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
      <p className="mb-6">
        The lesson you're looking for doesn't exist or might have been removed.
      </p>
      <a
        href={`/courses/${courseId}`}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Course
      </a>
    </div>
  );
}
```

## Additional Improvements

1. Added better checking for non-existent lessons to avoid triggering the same error
2. Enhanced fallback handling to check if a lesson exists before trying to render it
3. Added more diagnostic logging to identify problems with dates and lesson retrieval

## Best Practices for Firebase Dates in Next.js

1. Always use a safe wrapper function when converting Firebase dates to ISO strings
2. Check for Firestore Timestamp objects by testing for the `seconds` property
3. Handle all date conversions inside try/catch blocks
4. Return a default value (like `undefined`) instead of throwing errors
5. Log details about invalid date values for debugging

## Related Issues

This fix complements the previous Next.js 15 parameter handling fixes documented in:

- `nextjs15-params-fix.md`
- `nextjs15-lesson-params-fix.md`

By adding proper date handling, we've resolved another class of errors that can occur when working with Firebase data in Next.js server components.

# Enhanced Caching System for Cursuri

This document explains the enhanced caching system implemented for the Cursuri online course platform.

## Overview

The enhanced caching system provides the following features:

1. **State-Based Caching**: All data fetching operations track loading states (`idle`, `loading`, `success`, `error`) in the global AppContext.
2. **Local Storage Persistence**: Important data can be persisted to localStorage to reduce API calls across page reloads.
3. **TTL-Based Invalidation**: Cache entries automatically expire after a configurable Time-To-Live (TTL).
4. **Request Deduplication**: Multiple components requesting the same data will result in only one API call.
5. **Explicit Cache Control**: APIs for clearing specific cache entries or the entire cache.

## Architecture

### Types

The caching system introduces several new types:

```typescript
// Cache status types to track loading state
export type CacheStatus = "idle" | "loading" | "success" | "error";

// Metadata to track cache freshness
export interface CacheMetadata {
  timestamp: number;
  expiresAt: number;
  status: CacheStatus;
  error?: string;
}

// Generic cache entry container
export interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
}

// Options for caching behavior
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  persist?: boolean; // Whether to persist in localStorage (default: false)
  cacheKey?: string; // Custom cache key (default: auto-generated)
}
```

### Utility Functions

The `utils/caching.ts` file provides utility functions:

1. `generateCacheMetadata`: Creates metadata for new cache entries
2. `isCacheExpired`: Checks if a cache entry has expired
3. `saveToLocalStorage`: Persists data to localStorage
4. `loadFromLocalStorage`: Retrieves data from localStorage
5. `generateCacheKey`: Creates standardized cache keys
6. `clearLocalStorageCache`: Removes specific cache entries
7. `clearAllLocalStorageCache`: Cleans up all cache data

### AppContext Integration

The AppContext has been enhanced with:

1. New state properties to track loading states for all data types
2. Extended data fetching methods that accept caching options
3. Cache management utilities accessible to all components

## Using the Caching System

### Data Fetching with Caching

```typescript
// Basic usage - default settings (no persistence, 5-minute TTL)
getCourseLessons(courseId);

// With persistence to localStorage
getCourseLessons(courseId, { persist: true });

// With custom TTL (30 minutes)
getCourseLessons(courseId, { ttl: 30 * 60 * 1000 });

// With both options
getCourseLessons(courseId, { persist: true, ttl: 30 * 60 * 1000 });
```

### Accessing Loading States

```typescript
const { courseLoadingStates } = useContext(AppContext);

// Check loading state for all courses
if (courseLoadingStates["all"] === "loading") {
  return <LoadingSpinner />;
}

// Check loading state for a specific course
if (courseLoadingStates[courseId] === "error") {
  return <ErrorMessage />;
}
```

### Cache Management

```typescript
const { clearCache, clearAllCache } = useContext(AppContext);

// Clear specific cache
clearCache("lessons_123");

// Clear all cache
clearAllCache();
```

## Best Practices

1. **Use Persistence Selectively**: Only enable `persist: true` for data that doesn't change frequently and benefits from being available immediately on page load.

2. **Consider TTL Carefully**: Set appropriate TTL values based on how frequently the data changes:

   - User preferences: Long TTL (hours/days)
   - Course listings: Medium TTL (30-60 minutes)
   - Active lesson data: Short TTL (5-15 minutes)

3. **Handle Loading States**: Always check the loading state and provide appropriate UI feedback:

   ```tsx
   {
     courseLoadingStates["all"] === "loading" && <LoadingIndicator />;
   }
   {
     courseLoadingStates["all"] === "error" && <ErrorMessage />;
   }
   {
     courseLoadingStates["all"] === "success" && <CourseList />;
   }
   ```

4. **Cache Invalidation**: Explicitly invalidate cache when data is known to be stale:
   ```typescript
   // After adding a new course
   addCourse(newCourse).then(() => {
     clearCache("courses");
   });
   ```

## Components

A `CacheStatus` component has been created to visualize and manage the cache status. It can be used in admin panels or development environments to monitor cache status and manually refresh or clear specific cache entries.

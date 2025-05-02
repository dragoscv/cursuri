/**
 * Caching utility functions for the AppContext
 */
import { CacheEntry, CacheMetadata, CacheOptions, CacheStatus } from '@/types';

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Generate a metadata object for the cache entry
 */
export const generateCacheMetadata = (
    ttlOrStatus?: number | CacheStatus,
    statusOrTtl?: CacheStatus | number,
    error?: string
): CacheMetadata => {
    const now = Date.now();

    // Handle different parameter orders for backward compatibility
    let ttl = DEFAULT_TTL;
    let status: CacheStatus = 'success';

    if (typeof ttlOrStatus === 'number') {
        ttl = ttlOrStatus;
        if (typeof statusOrTtl === 'string') {
            status = statusOrTtl;
        }
    } else if (typeof ttlOrStatus === 'string') {
        status = ttlOrStatus;
        if (typeof statusOrTtl === 'number') {
            ttl = statusOrTtl;
        }
    }

    return {
        timestamp: now,
        expiresAt: now + ttl,
        status,
        error,
    };
};

/**
 * Check if a cache entry has expired
 */
export const isCacheExpired = (metadata: CacheMetadata): boolean => {
    return Date.now() > metadata.expiresAt;
};

/**
 * Save data to localStorage
 */
export const saveToLocalStorage = <T>(key: string, data: T, metadata?: CacheMetadata): void => {
    try {
        const cacheEntry: CacheEntry<T> = {
            data,
            metadata: metadata || generateCacheMetadata()
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
        console.error(`Error saving to localStorage for key ${key}:`, error);
    }
};

/**
 * Load data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string): CacheEntry<T> | null => {
    try {
        const storedData = localStorage.getItem(key);
        if (!storedData) return null;
        return JSON.parse(storedData) as CacheEntry<T>;
    } catch (error) {
        console.error(`Error loading from localStorage for key ${key}:`, error);
        return null;
    }
};

/**
 * Generate a cache key for a given resource and ID
 */
export const generateCacheKey = (resourceType: string, id?: string): string => {
    return id ? `${resourceType}_${id}` : resourceType;
};

/**
 * Clear a specific cache entry from localStorage
 */
export const clearLocalStorageCache = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error clearing localStorage for key ${key}:`, error);
    }
};

/**
 * Clear all cache entries that match a prefix
 */
export const clearLocalStorageCacheByPrefix = (prefix: string): void => {
    try {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error(`Error clearing localStorage for prefix ${prefix}:`, error);
    }
};

/**
 * Clear all cached data from localStorage
 */
export const clearAllLocalStorageCache = (): void => {
    try {
        // Clear only our app-specific cache keys
        const prefixes = ['course_', 'lessons_', 'reviews_', 'users', 'adminAnalytics', 'adminSettings', 'bookmarks', 'wishlist'];
        prefixes.forEach(prefix => {
            clearLocalStorageCacheByPrefix(prefix);
        });
    } catch (error) {
        console.error('Error clearing all localStorage cache:', error);
    }
};

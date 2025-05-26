import React, { createContext, useContext } from 'react';

/**
 * Factory to create a type-safe context with proper error handling
 * @param name The name of the context for error messages
 * @returns A tuple with [Context, useContext hook]
 */
export function createSafeContext<T>(name: string): readonly [React.Context<T | null>, () => T] {
    const Context = createContext<T | null>(null);
    Context.displayName = name;

    const useSafeContext = () => {
        const ctx = useContext(Context);
        if (ctx === null) {
            throw new Error(`use${name} must be used within a ${name}Provider`);
        }
        return ctx;
    };

    return [Context, useSafeContext] as const;
}

/**
 * Type for loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Cache options for data fetching
 */
export interface CacheOptions {
    ttl?: number;
    persist?: boolean;
    cacheKey?: string;
}

/**
 * Default cache options
 */
export const DEFAULT_CACHE_OPTIONS: CacheOptions = {
    ttl: 1000 * 60 * 15, // 15 minutes
    persist: true,
};

/**
 * Cache metadata
 */
export interface CacheMetadata {
    timestamp: number;
    status: LoadingState;
    ttl: number;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
    data: T;
    metadata: CacheMetadata;
}

/**
 * Helper to generate cache metadata
 */
export function generateCacheMetadata(status: LoadingState, ttl?: number): CacheMetadata {
    return {
        timestamp: Date.now(),
        status,
        ttl: ttl || DEFAULT_CACHE_OPTIONS.ttl!,
    };
}

/**
 * Check if a cache entry is expired
 */
export function isCacheExpired(metadata: CacheMetadata): boolean {
    const now = Date.now();
    const expiresAt = metadata.timestamp + metadata.ttl;
    return now > expiresAt;
}

/**
 * Save data to localStorage
 */
export function saveToLocalStorage(key: string, data: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage with key ${key}:`, error);
    }
}

/**
 * Load data from localStorage
 */
export function loadFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item) as CacheEntry<T>;
    } catch (error) {
        console.error(`Error loading from localStorage with key ${key}:`, error);
        return null;
    }
}

/**
 * Generate a cache key for a resource
 */
export function generateCacheKey(resourceType: string, id?: string): string {
    return id ? `cursuri_${resourceType}_${id}` : `cursuri_${resourceType}`;
}

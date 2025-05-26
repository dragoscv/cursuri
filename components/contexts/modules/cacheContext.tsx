'use client'

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { CacheOptions, CacheStatus } from '@/types';
import {
    generateCacheMetadata,
    isCacheExpired,
    saveToLocalStorage,
    loadFromLocalStorage,
    generateCacheKey,
    clearLocalStorageCache,
    clearAllLocalStorageCache
} from '@/utils/caching';

// Cache entry interface
interface CacheEntry<T = unknown> {
    data: T;
    timestamp: number;
    ttl: number;
    metadata: import('@/types').CacheMetadata;
}

// Cache state interface
interface CacheState {
    memoryCache: Record<string, CacheEntry>;
    requestStates: Record<string, CacheStatus>;
    pendingRequests: Record<string, boolean>;
}

// Cache action types
type CacheAction =
    | { type: 'SET_CACHE_ENTRY'; payload: { key: string; entry: CacheEntry } }
    | { type: 'REMOVE_CACHE_ENTRY'; payload: string }
    | { type: 'CLEAR_CACHE'; payload?: string }
    | { type: 'SET_REQUEST_STATE'; payload: { key: string; status: CacheStatus } }
    | { type: 'SET_PENDING_REQUEST'; payload: { key: string; isPending: boolean } };

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    persist: false,
    cacheKey: undefined
};

// Cache reducer
const cacheReducer = (state: CacheState, action: CacheAction): CacheState => {
    switch (action.type) {
        case 'SET_CACHE_ENTRY':
            return {
                ...state,
                memoryCache: {
                    ...state.memoryCache,
                    [action.payload.key]: action.payload.entry
                }
            };
        case 'REMOVE_CACHE_ENTRY': {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [action.payload]: _, ...remainingCache } = state.memoryCache;
            return {
                ...state,
                memoryCache: remainingCache
            };
        }
        case 'CLEAR_CACHE': {
            if (action.payload) {
                // Clear specific cache entry
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [action.payload]: _, ...remainingCache } = state.memoryCache;
                return {
                    ...state,
                    memoryCache: remainingCache
                };
            } else {
                // Clear all cache
                return {
                    ...state,
                    memoryCache: {}
                };
            }
        }
        case 'SET_REQUEST_STATE':
            return {
                ...state,
                requestStates: {
                    ...state.requestStates,
                    [action.payload.key]: action.payload.status
                }
            };
        case 'SET_PENDING_REQUEST':
            return {
                ...state,
                pendingRequests: {
                    ...state.pendingRequests,
                    [action.payload.key]: action.payload.isPending
                }
            };
        default:
            return state;
    }
};

// Initial cache state
const initialCacheState: CacheState = {
    memoryCache: {},
    requestStates: {},
    pendingRequests: {}
};

// Cache context interface
interface CacheContextType {
    // Cache operations
    getCachedData: <T>(key: string, options?: CacheOptions) => T | null;
    setCachedData: <T>(key: string, data: T, options?: CacheOptions) => void;
    invalidateCache: (key: string) => void;
    clearCache: (cacheKey?: string) => void;
    clearAllCache: () => void;

    // Request state management
    getRequestState: (key: string) => CacheStatus;
    setRequestState: (key: string, status: CacheStatus) => void;
    isRequestPending: (key: string) => boolean;
    setRequestPending: (key: string, isPending: boolean) => void;
    // Utilities
    generateCacheKey: (prefix: string, params: Record<string, string | number>) => string;
    isCacheValid: (key: string) => boolean;
    getCacheMetadata: (key: string) => import('@/types').CacheMetadata | null;
}

// Create context
const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Custom hook to use cache context
export const useCache = () => {
    const context = useContext(CacheContext);
    if (context === undefined) {
        throw new Error('useCache must be used within a CacheProvider');
    }
    return context;
};

// Cache provider props
interface CacheProviderProps {
    children: ReactNode;
}

// Cache provider component
export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cacheReducer, initialCacheState);

    // Get cached data
    const getCachedData = useCallback(<T,>(key: string, options: CacheOptions = {}): T | null => {
        const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
        // Check memory cache first
        const memoryEntry = state.memoryCache[key];
        if (memoryEntry && !isCacheExpired(memoryEntry.metadata)) {
            return memoryEntry.data as T;
        }        // Check localStorage if persist is enabled
        if (opts.persist) {
            const persistedData = loadFromLocalStorage<T>(key);
            if (persistedData && 'data' in persistedData && 'metadata' in persistedData) {
                const cacheEntry = persistedData as CacheEntry<T>;
                if (!isCacheExpired(cacheEntry.metadata)) {
                    // Store in memory cache for faster access
                    const entry: CacheEntry = {
                        data: cacheEntry.data,
                        timestamp: Date.now(),
                        ttl: opts.ttl!,
                        metadata: cacheEntry.metadata
                    };
                    dispatch({ type: 'SET_CACHE_ENTRY', payload: { key, entry } });
                    return cacheEntry.data;
                }
            }
        }

        return null;
    }, [state.memoryCache]);

    // Set cached data
    const setCachedData = useCallback(<T,>(key: string, data: T, options: CacheOptions = {}) => {
        const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };

        const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
            ttl: opts.ttl!,
            metadata: generateCacheMetadata()
        };

        // Store in memory cache
        dispatch({ type: 'SET_CACHE_ENTRY', payload: { key, entry } });        // Store in localStorage if persist is enabled
        if (opts.persist) {
            const cacheEntryForStorage: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl: opts.ttl!,
                metadata: generateCacheMetadata('success', opts.ttl!)
            };
            saveToLocalStorage(key, cacheEntryForStorage);
        }
    }, []);

    // Invalidate specific cache entry
    const invalidateCache = useCallback((key: string) => {
        dispatch({ type: 'REMOVE_CACHE_ENTRY', payload: key });
        clearLocalStorageCache(key);
    }, []);

    // Clear cache (specific key or all)
    const clearCache = useCallback((cacheKey?: string) => {
        dispatch({ type: 'CLEAR_CACHE', payload: cacheKey });
        if (cacheKey) {
            clearLocalStorageCache(cacheKey);
        }
    }, []);

    // Clear all cache
    const clearAllCache = useCallback(() => {
        dispatch({ type: 'CLEAR_CACHE' });
        clearAllLocalStorageCache();
    }, []);

    // Get request state
    const getRequestState = useCallback((key: string): CacheStatus => {
        return state.requestStates[key] || 'idle';
    }, [state.requestStates]);

    // Set request state
    const setRequestState = useCallback((key: string, status: CacheStatus) => {
        dispatch({ type: 'SET_REQUEST_STATE', payload: { key, status } });
    }, []);

    // Check if request is pending
    const isRequestPending = useCallback((key: string): boolean => {
        return !!state.pendingRequests[key];
    }, [state.pendingRequests]);

    // Set request pending status
    const setRequestPending = useCallback((key: string, isPending: boolean) => {
        dispatch({ type: 'SET_PENDING_REQUEST', payload: { key, isPending } });
    }, []);    // Generate cache key utility
    const generateCacheKeyUtil = useCallback((prefix: string, params: Record<string, string | number>): string => {
        const id = params.id?.toString() || Object.values(params).join('_');
        return generateCacheKey(prefix, id);
    }, []);    // Check if cache is valid
    const isCacheValid = useCallback((key: string): boolean => {
        const entry = state.memoryCache[key];
        if (!entry) return false;
        return !isCacheExpired(entry.metadata);
    }, [state.memoryCache]);    // Get cache metadata
    const getCacheMetadata = useCallback((key: string): import('@/types').CacheMetadata | null => {
        const entry = state.memoryCache[key];
        return entry?.metadata || null;
    }, [state.memoryCache]);    // Clean up expired cache entries periodically
    React.useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const expiredKeys: string[] = [];

            Object.entries(state.memoryCache).forEach(([key, entry]) => {
                if (isCacheExpired(entry.metadata)) {
                    expiredKeys.push(key);
                }
            });

            expiredKeys.forEach(key => {
                dispatch({ type: 'REMOVE_CACHE_ENTRY', payload: key });
            });
        }, 60000); // Check every minute

        return () => clearInterval(cleanupInterval);
    }, [state.memoryCache]);

    // Context value
    const value: CacheContextType = {
        // Cache operations
        getCachedData,
        setCachedData,
        invalidateCache,
        clearCache,
        clearAllCache,

        // Request state management
        getRequestState,
        setRequestState,
        isRequestPending,
        setRequestPending,

        // Utilities
        generateCacheKey: generateCacheKeyUtil,
        isCacheValid,
        getCacheMetadata
    };

    return (
        <CacheContext.Provider value={value}>
            {children}
        </CacheContext.Provider>
    );
};

export default CacheContext;

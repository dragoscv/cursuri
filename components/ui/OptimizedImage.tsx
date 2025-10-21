'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
    OptimizedImageProps,
    getOptimizedImageProps,
    generateSrcSet,
    generateSizesAttribute
} from '@/utils/imageOptimization';

interface OptimizedImageComponentProps extends Omit<OptimizedImageProps, 'sizes'> {
    fallbackSrc?: string;
    onLoad?: () => void;
    onError?: () => void;
    responsiveBreakpoints?: string[];
    aspectRatio?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image component with automatic lazy loading, responsive images,
 * and fallback handling for the Cursuri platform
 */
export default function OptimizedImage({
    src,
    alt,
    fallbackSrc = '/placeholder-course.svg',
    className = '',
    width = 800,
    height = 450,
    priority = false,
    loading = 'lazy',
    placeholder = 'blur',
    blurDataURL,
    onLoad,
    onError,
    responsiveBreakpoints,
    aspectRatio,
    objectFit = 'cover',
    ...props
}: OptimizedImageComponentProps) {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const t = useTranslations('common.emptyStates');

    // Get optimized props
    const optimizedProps = getOptimizedImageProps(currentSrc, alt, {
        width,
        height,
        priority,
        loading,
        placeholder,
        blurDataURL,
        className,
    });

    // Handle image load
    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.();
    };

    // Handle image error
    const handleError = () => {
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setHasError(false);
        } else {
            setIsLoading(false);
            setHasError(true);
        }
        onError?.();
    };

    // Update src when prop changes
    useEffect(() => {
        if (src !== currentSrc && !hasError) {
            setCurrentSrc(src);
            setIsLoading(true);
        }
    }, [src, currentSrc, hasError]);

    // Generate responsive sizes if needed
    const sizesAttribute = responsiveBreakpoints
        ? generateSizesAttribute(responsiveBreakpoints)
        : generateSizesAttribute();

    return (
        <div
            className={`relative ${className}`}
            style={{
                aspectRatio: aspectRatio || `${width}/${height}`,
            }}
        >
            {/* Main Image */}
            <Image
                ref={imageRef}
                src={currentSrc}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                loading={loading}
                placeholder={placeholder}
                blurDataURL={optimizedProps.blurDataURL}
                sizes={sizesAttribute}
                className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${objectFit === 'cover' ? 'object-cover' : ''}
          ${objectFit === 'contain' ? 'object-contain' : ''}
          ${objectFit === 'fill' ? 'object-fill' : ''}
          ${objectFit === 'none' ? 'object-none' : ''}
          ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
        `}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />

            {/* Loading placeholder */}
            {isLoading && (
                <div className="absolute inset-0 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] animate-pulse">
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                </div>
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-border)] flex items-center justify-center">
                    <div className="text-center text-[color:var(--ai-muted-foreground)] dark:text-[color:var(--ai-muted)]">
                        <svg
                            className="w-12 h-12 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-sm">{t('imageNotAvailable')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Specialized component for course thumbnails
 */
export function CourseThumbnail({
    course,
    className = '',
    priority = false,
    ...props
}: {
    course: { title: string; image?: string; thumbnail?: string };
    className?: string;
    priority?: boolean;
} & Omit<OptimizedImageComponentProps, 'src' | 'alt'>) {
    const imageSrc = course.image || course.thumbnail || '/placeholder-course.svg';

    return (
        <OptimizedImage
            src={imageSrc}
            alt={`${course.title} course thumbnail`}
            className={`rounded-lg ${className}`}
            width={400}
            height={225}
            priority={priority}
            aspectRatio="16/9"
            objectFit="cover"
            responsiveBreakpoints={[
                '(max-width: 640px) 100vw',
                '(max-width: 1024px) 50vw',
                '400px'
            ]}
            {...props}
        />
    );
}

/**
 * Specialized component for user avatars
 */
export function UserAvatar({
    user,
    size = 'medium',
    className = '',
    ...props
}: {
    user: { displayName?: string; photoURL?: string; email?: string };
    size?: 'small' | 'medium' | 'large';
    className?: string;
} & Omit<OptimizedImageComponentProps, 'src' | 'alt' | 'width' | 'height'>) {
    const sizeMap = {
        small: { width: 32, height: 32 },
        medium: { width: 64, height: 64 },
        large: { width: 128, height: 128 },
    };

    const { width, height } = sizeMap[size];
    const imageSrc = user.photoURL || '/default-avatar.svg';
    const altText = user.displayName || user.email || 'User avatar';

    return (
        <OptimizedImage
            src={imageSrc}
            alt={altText}
            className={`rounded-full ${className}`}
            width={width}
            height={height}
            aspectRatio="1/1"
            objectFit="cover"
            priority={false}
            {...props}
        />
    );
}

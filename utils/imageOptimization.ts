/**
 * Image optimization utilities for the Cursuri platform
 * Handles responsive images, lazy loading, and performance optimization
 */

export interface ImageSizes {
    small: string;
    medium: string;
    large: string;
    xlarge?: string;
}

export interface OptimizedImageProps {
    src: string;
    alt: string;
    sizes?: ImageSizes;
    loading?: 'lazy' | 'eager';
    priority?: boolean;
    className?: string;
    width?: number;
    height?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export function generateImageSizes(baseSrc: string): ImageSizes {
    const baseUrl = baseSrc.replace(/\.[^/.]+$/, ""); // Remove extension
    const extension = baseSrc.match(/\.[^/.]+$/)?.[0] || '.jpg';

    return {
        small: `${baseUrl}_400w${extension}`,
        medium: `${baseUrl}_800w${extension}`,
        large: `${baseUrl}_1200w${extension}`,
        xlarge: `${baseUrl}_1600w${extension}`,
    };
}

/**
 * Generate srcSet string for responsive images
 */
export function generateSrcSet(sizes: ImageSizes): string {
    return [
        `${sizes.small} 400w`,
        `${sizes.medium} 800w`,
        `${sizes.large} 1200w`,
        sizes.xlarge ? `${sizes.xlarge} 1600w` : null,
    ].filter(Boolean).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(breakpoints?: string[]): string {
    if (breakpoints) {
        return breakpoints.join(', ');
    }

    // Default responsive breakpoints
    return [
        '(max-width: 640px) 100vw',
        '(max-width: 1024px) 50vw',
        '(max-width: 1536px) 33vw',
        '25vw'
    ].join(', ');
}

/**
 * Create a blur placeholder for images
 */
export function createBlurDataURL(width: number = 10, height: number = 10): string {
    // Create a simple blur effect using base64 encoded SVG
    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Validate image URL and provide fallback
 */
export function validateImageSrc(src: string, fallback: string = '/placeholder-course.svg'): string {
    if (!src || src.trim() === '') {
        return fallback;
    }

    // Check if it's a valid URL or relative path
    try {
        new URL(src);
        return src;
    } catch {
        // If not a valid URL, assume it's a relative path
        return src.startsWith('/') ? src : `/${src}`;
    }
}

/**
 * Check if an image should be loaded with priority
 */
export function shouldUsePriority(index: number, isAboveFold: boolean = false): boolean {
    // Prioritize images above the fold or first few images
    return isAboveFold || index < 3;
}

/**
 * Generate optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
    src: string,
    alt: string,
    options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
    const validatedSrc = validateImageSrc(src);
    const sizes = options.sizes || generateImageSizes(validatedSrc);

    return {
        src: validatedSrc,
        alt: alt || 'Course image',
        loading: options.loading || 'lazy',
        priority: options.priority || false,
        className: options.className || '',
        width: options.width || 800,
        height: options.height || 450,
        placeholder: options.placeholder || 'blur',
        blurDataURL: options.blurDataURL || createBlurDataURL(),
        sizes,
        ...options,
    };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<void> {
    try {
        await Promise.all(urls.map(url => preloadImage(url)));
    } catch (error) {
        console.warn('Failed to preload some images:', error);
    }
}

/**
 * Intersection Observer for lazy loading images
 */
export class LazyImageLoader {
    private observer: IntersectionObserver | null = null;
    private images: Set<HTMLImageElement> = new Set();

    constructor(options: IntersectionObserverInit = {}) {
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
                rootMargin: '50px 0px',
                threshold: 0.01,
                ...options,
            });
        }
    }

    private handleIntersection(entries: IntersectionObserverEntry[]) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                const dataSrc = img.dataset.src;

                if (dataSrc) {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                    this.observer?.unobserve(img);
                    this.images.delete(img);
                }
            }
        });
    }

    observe(img: HTMLImageElement) {
        if (this.observer) {
            this.images.add(img);
            this.observer.observe(img);
        }
    }

    unobserve(img: HTMLImageElement) {
        if (this.observer) {
            this.images.delete(img);
            this.observer.unobserve(img);
        }
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.images.clear();
        }
    }
}

// Export a singleton instance
export const lazyImageLoader = new LazyImageLoader();

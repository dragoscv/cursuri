/**
 * HTML Sanitization Utility
 *
 * Provides secure HTML sanitization to prevent XSS attacks when rendering
 * user-generated content with dangerouslySetInnerHTML.
 *
 * Uses DOMPurify with strict configuration to allow only safe HTML elements
 * and attributes while removing all potentially dangerous content.
 *
 * @module utils/security/htmlSanitizer
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration options
 */
interface SanitizeOptions {
    /**
     * Allow specific HTML tags
     * @default ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img']
     */
    allowedTags?: string[];

    /**
     * Allow specific attributes on tags
     * @default { 'a': ['href', 'title', 'target', 'rel'], 'img': ['src', 'alt', 'title', 'width', 'height'] }
     */
    allowedAttributes?: Record<string, string[]>;

    /**
     * Allow data attributes
     * @default false
     */
    allowDataAttributes?: boolean;

    /**
     * Allow style attributes
     * @default false
     */
    allowStyles?: boolean;

    /**
     * Profile preset: 'strict' (minimal), 'moderate' (common formatting), 'rich' (full content editing)
     * @default 'moderate'
     */
    profile?: 'strict' | 'moderate' | 'rich';
}

/**
 * Predefined sanitization profiles
 */
const SANITIZATION_PROFILES = {
    /**
     * Strict profile: Only basic text formatting
     * Suitable for: Comments, short messages, reviews
     */
    strict: {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
        KEEP_CONTENT: true,
        RETURN_TRUSTED_TYPE: false,
    },

    /**
     * Moderate profile: Common formatting and lists
     * Suitable for: Blog posts, Q&A answers, course descriptions
     */
    moderate: {
        ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'a',
            'ul',
            'ol',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'code',
            'pre',
            'img',
            'hr',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
        ],
        ALLOWED_ATTR: [
            'href',
            'title',
            'target',
            'rel',
            'src',
            'alt',
            'width',
            'height',
            'class',
            'id',
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
        KEEP_CONTENT: true,
        RETURN_TRUSTED_TYPE: false,
    },

    /**
     * Rich profile: Full content with embedded media
     * Suitable for: Rich text editors, lesson content, articles
     */
    rich: {
        ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'a',
            'ul',
            'ol',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'code',
            'pre',
            'img',
            'hr',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
            'iframe',
            'video',
            'audio',
            'source',
            'div',
            'span',
            'section',
            'article',
        ],
        ALLOWED_ATTR: [
            'href',
            'title',
            'target',
            'rel',
            'src',
            'alt',
            'width',
            'height',
            'class',
            'id',
            'frameborder',
            'allowfullscreen',
            'controls',
            'autoplay',
            'loop',
            'muted',
            'poster',
            'preload',
        ],
        ALLOWED_URI_REGEXP:
            /^(?:(?:(?:f|ht)tps?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
        KEEP_CONTENT: true,
        RETURN_TRUSTED_TYPE: false,
    },
};

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param html - Raw HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * // Basic usage with default (moderate) profile
 * const cleanHtml = sanitizeHtml(userInput);
 *
 * // Use strict profile for user comments
 * const cleanComment = sanitizeHtml(comment, { profile: 'strict' });
 *
 * // Use rich profile for lesson content
 * const cleanLesson = sanitizeHtml(lessonContent, { profile: 'rich' });
 *
 * // Custom configuration
 * const custom = sanitizeHtml(html, {
 *   allowedTags: ['p', 'strong', 'em'],
 *   allowedAttributes: { 'a': ['href'] }
 * });
 * ```
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
    // Return empty string for null/undefined input
    if (!html || typeof html !== 'string') {
        return '';
    }

    // Get profile configuration
    const profile = options.profile || 'moderate';
    const profileConfig = SANITIZATION_PROFILES[profile];

    // Build DOMPurify configuration
    const config: any = {
        ...profileConfig,
        // Always add these security measures
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base'],
        FORBID_ATTR: [
            'onerror',
            'onload',
            'onclick',
            'onmouseover',
            'onmouseout',
            'onmouseenter',
            'onmouseleave',
            'onfocus',
            'onblur',
            'onchange',
            'oninput',
            'onsubmit',
            'onreset',
            'onkeydown',
            'onkeyup',
            'onkeypress',
        ],
    };

    // Override with custom configuration
    if (options.allowedTags) {
        config.ALLOWED_TAGS = options.allowedTags;
    }

    if (options.allowedAttributes) {
        config.ALLOWED_ATTR = [];
        Object.entries(options.allowedAttributes).forEach(([tag, attrs]) => {
            config.ALLOWED_ATTR.push(...attrs);
        });
    }

    // Special handling for iframe in rich profile (only allow trusted sources)
    if (profile === 'rich') {
        // Override iframe restrictions to allow only YouTube, Vimeo, etc.
        config.FORBID_TAGS = config.FORBID_TAGS.filter((tag: string) => tag !== 'iframe');

        // Add hook to validate iframe sources
        DOMPurify.addHook('uponSanitizeElement', (node: any, data: any) => {
            if (data.tagName === 'iframe') {
                const src = node.getAttribute('src') || '';
                const trustedDomains = [
                    'youtube.com',
                    'youtu.be',
                    'vimeo.com',
                    'player.vimeo.com',
                    'dailymotion.com',
                    'ted.com',
                ];

                const isTrusted = trustedDomains.some((domain) => src.includes(domain));

                if (!isTrusted) {
                    node.parentNode?.removeChild(node);
                }
            }
        });
    }

    // Sanitize the HTML
    const clean = DOMPurify.sanitize(html, config);

    // Remove hooks after sanitization
    DOMPurify.removeAllHooks();

    return String(clean);
}

/**
 * Sanitize HTML with strict profile
 * Use for user comments, reviews, short messages
 */
export function sanitizeStrict(html: string): string {
    return sanitizeHtml(html, { profile: 'strict' });
}

/**
 * Sanitize HTML with moderate profile
 * Use for blog posts, Q&A answers, descriptions
 */
export function sanitizeModerate(html: string): string {
    return sanitizeHtml(html, { profile: 'moderate' });
}

/**
 * Sanitize HTML with rich profile
 * Use for lesson content, articles, rich text editor output
 */
export function sanitizeRich(html: string): string {
    return sanitizeHtml(html, { profile: 'rich' });
}

/**
 * React hook for sanitizing HTML in components
 *
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Object with sanitized HTML for use with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * function MyComponent({ userContent }) {
 *   const cleanHtml = useSanitizedHtml(userContent);
 *   return <div dangerouslySetInnerHTML={cleanHtml} />;
 * }
 * ```
 */
export function useSanitizedHtml(
    html: string,
    options?: SanitizeOptions
): { __html: string } | null {
    if (!html) return null;

    return {
        __html: sanitizeHtml(html, options),
    };
}

/**
 * Validate if HTML string is safe (doesn't contain dangerous elements)
 * Useful for pre-validation before storing in database
 *
 * @param html - HTML string to validate
 * @returns True if HTML is safe, false if contains dangerous content
 */
export function isHtmlSafe(html: string): boolean {
    if (!html) return true;

    const dangerous = [
        /<script/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /javascript:/i,
        /on\w+\s*=/i, // Event handlers
        /<style/i,
        /expression\(/i, // IE CSS expressions
        /import\s+['"]/i, // CSS imports
    ];

    return !dangerous.some((pattern) => pattern.test(html));
}

/**
 * Strip all HTML tags and return plain text
 * Useful for creating safe excerpts or previews
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true,
    });
}

/**
 * Source-hash helpers for translation freshness tracking.
 *
 * Lives outside `utils/azure/translator.ts` because the translator module
 * imports Node's `crypto` and other server-only deps; this file is safe to
 * import from client components (`LessonForm`, `AddCourse`, `TranslationsPanel`).
 *
 * The hash itself only needs to be stable & collision-resistant *enough* to
 * detect "did the source content change since the last translation?" — we
 * use FNV-1a 64-bit hex so it works identically in browsers and Node without
 * Web Crypto's async `subtle.digest()` API.
 */

function fnv1a64(input: string): string {
    // 64-bit FNV-1a using two 32-bit halves so we stay inside JS safe ints.
    let h1 = 0xcbf29ce4 | 0;
    let h2 = 0x84222325 | 0;
    for (let i = 0; i < input.length; i++) {
        const c = input.charCodeAt(i);
        h1 ^= c & 0xff;
        h2 ^= (c >> 8) & 0xff;
        // Multiplication by FNV prime 1099511628211 spread across two halves.
        h1 = Math.imul(h1, 0x01000193);
        h2 = Math.imul(h2, 0x01000193);
    }
    const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
    return (hex(h2) + hex(h1)).slice(0, 16);
}

function stableStringify(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.map(stableStringify).join('|');
    if (typeof value === 'object') {
        const keys = Object.keys(value as Record<string, unknown>).sort();
        return keys
            .map((k) => `${k}=${stableStringify((value as Record<string, unknown>)[k])}`)
            .join(';');
    }
    return String(value);
}

export interface LessonSourceFields {
    name?: string;
    description?: string;
    content?: string;
    summary?: string;
    keyPoints?: string[];
    transcription?: string;
    objectives?: string[];
    tags?: string[];
}

export function hashLessonSource(input: LessonSourceFields): string {
    return fnv1a64(stableStringify(input));
}

export interface CourseSourceFields {
    name?: string;
    description?: string;
    fullDescription?: string;
    benefits?: string[];
    objectives?: string[];
    requirements?: string[];
    tags?: string[];
}

export function hashCourseSource(input: CourseSourceFields): string {
    return fnv1a64(stableStringify(input));
}

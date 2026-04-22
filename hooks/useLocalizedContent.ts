'use client';

/**
 * useLocalizedContent — picks the AI-translated copy of a course or lesson
 * that matches the current viewer's preferred locale, falling back to the
 * original (source) fields when no translation is available.
 *
 * Usage:
 *   const lessonView = useLocalizedLesson(lesson);
 *   <h1>{lessonView.name}</h1>
 *
 * The hook reads the locale cookie directly (the same one the i18n config
 * uses) so it works on any client component without prop drilling.
 *
 * Notes:
 *   - For locales not present in `translations`, the original field is used.
 *   - HTML/markdown content is returned as-is (caller is responsible for
 *     rendering safely).
 *   - This hook does NOT affect server-rendered content. For SEO, prefer
 *     resolving translations server-side at the page level using the same
 *     selection logic in `pickTranslatedFields()` below.
 */

import { useEffect, useState } from 'react';
import type { Course, CourseTranslation, Lesson, LessonTranslation } from '@/types';
import { getContentLocale } from '@/config/locales';

const LOCALE_COOKIE = 'locale';

function readLocaleCookie(): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

export function useViewerLocale(defaultLocale = 'ro'): string {
    const [locale, setLocale] = useState<string>(() => readLocaleCookie() || defaultLocale);
    useEffect(() => {
        const v = readLocaleCookie();
        if (v && v !== locale) setLocale(v);
        // No native event for cookie changes; consumers needing reactivity
        // should re-mount via parent rerender (next-intl handles UI strings).
    }, [locale]);
    return locale;
}

function pickTranslation<T extends { translations?: Record<string, V> }, V>(
    item: T,
    locale: string
): V | undefined {
    if (!item.translations) return undefined;
    const direct = item.translations[locale];
    if (direct) return direct;
    // Fall back on language-only key (e.g. "pt" when only "pt-BR" exists).
    const lang = locale.split('-')[0];
    const fallbackKey = Object.keys(item.translations).find(
        (k) => k.split('-')[0] === lang
    );
    return fallbackKey ? item.translations[fallbackKey] : undefined;
}

export function pickLessonView(lesson: Lesson, locale: string): Lesson {
    const t = pickTranslation<Lesson, LessonTranslation>(lesson, locale);
    if (!t || t.status !== 'complete') return lesson;
    return {
        ...lesson,
        name: t.name || lesson.name,
        description: t.description || lesson.description,
        content: t.content || lesson.content,
        summary: t.summary || lesson.summary,
        keyPoints: t.keyPoints?.length ? t.keyPoints : lesson.keyPoints,
        transcription: t.transcription || lesson.transcription,
    };
}

export function pickCourseView(course: Course, locale: string): Course {
    const t = pickTranslation<Course, CourseTranslation>(course, locale);
    if (!t || t.status !== 'complete') return course;
    return {
        ...course,
        name: t.name || course.name,
        description: t.description || course.description,
        fullDescription: t.fullDescription || course.fullDescription,
        benefits: t.benefits?.length ? t.benefits : course.benefits,
        requirements: t.requirements?.length ? t.requirements : course.requirements,
        tags: t.tags?.length ? t.tags : course.tags,
    };
}

export function useLocalizedLesson(lesson: Lesson): Lesson {
    const locale = useViewerLocale();
    return pickLessonView(lesson, locale);
}

export function useLocalizedCourse(course: Course): Course {
    const locale = useViewerLocale();
    return pickCourseView(course, locale);
}

/**
 * Server-side helper. Pass the locale you derived from the cookie
 * (e.g. `cookies().get('locale')?.value`) and apply to a course or lesson
 * before serializing for SEO / metadata.
 */
export function applyLocaleToLesson(lesson: Lesson, locale: string): Lesson {
    return pickLessonView(lesson, locale);
}

export function applyLocaleToCourse(course: Course, locale: string): Course {
    return pickCourseView(course, locale);
}

export { getContentLocale };

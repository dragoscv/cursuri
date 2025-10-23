/**
 * Mock for next-intl library in Jest tests
 * Provides test-compatible implementations of i18n functions
 */

// Common translations for testing
const translations = {
    // Error Page
    'common.errorPage.pageNotFound': 'Page Not Found',
    'common.errorPage.pageNotFoundMessage': 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    'common.errorPage.goToHomepage': 'Go to Homepage',
    'common.errorPage.goBack': 'Go Back',
    'common.errorPage.errorIllustration': 'Error illustration',
    'common.errorPage.internalServerError': 'Internal Server Error',
    'common.errorPage.forbidden': 'Access Forbidden',

    // Footer
    'common.footer.about': 'Quality programming courses to accelerate your career',
    'common.footer.version': 'Version ',
    'common.footer.quickLinks': 'Quick Links',
    'common.footer.connect': 'Connect',
    'common.footer.copyright': 'All rights reserved.',

    // Navigation
    'common.nav.allCourses': 'All Courses',
    'common.nav.featuredCourses': 'Featured Courses',
    'common.nav.testimonials': 'Testimonials',

    // Theme
    'common.theme.light': 'Light Mode',
    'common.theme.dark': 'Dark Mode',

    // Lessons List
    'courses.lessonsList.courseContent': 'Course Content',
    'courses.lessonsList.lessons': 'Lessons',
    'courses.lessonsList.totalDuration': 'Total Duration',
    'courses.lessonsList.freePreview': 'Free Preview',
    'courses.lessonsList.noDescription': 'No description available',
};

// Mock translation function that returns the key or actual translation
const mockTranslate = (key, values) => {
    // Get translation if it exists, otherwise return the key
    let translation = translations[key] || key;

    // Auto-substitute {year} with current year if not provided in values
    if (translation.includes('{year}') && (!values || !values.year)) {
        translation = translation.replace('{year}', new Date().getFullYear().toString());
    }

    // Handle value substitution
    if (values) {
        translation = Object.entries(values).reduce((str, [k, v]) => {
            return str.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }, translation);
    }

    return translation;
};

// Mock useTranslations hook
export const useTranslations = (namespace) => {
    return (key, values) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        return mockTranslate(fullKey, values);
    };
};

// Mock useLocale hook
export const useLocale = () => 'en';

// Mock NextIntlClientProvider component
export const NextIntlClientProvider = ({ children, locale, messages }) => {
    return children;
};

// Mock getTranslations (server component)
export const getTranslations = async (namespace) => {
    return (key, values) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        return mockTranslate(fullKey, values);
    };
};

// Mock getLocale (server component)
export const getLocale = async () => 'en';

// Mock useMessages hook
export const useMessages = () => ({});

// Mock useFormatter hook
export const useFormatter = () => ({
    dateTime: (date, options) => new Date(date).toLocaleDateString('en-US', options),
    number: (value, options) => value.toLocaleString('en-US', options),
    relativeTime: (date, baseDate) => 'just now',
});

// Mock useNow hook
export const useNow = (options) => new Date();

// Mock useTimeZone hook
export const useTimeZone = () => 'UTC';

// Default export for compatibility
export default {
    useTranslations,
    useLocale,
    NextIntlClientProvider,
    getTranslations,
    getLocale,
    useMessages,
    useFormatter,
    useNow,
    useTimeZone,
};

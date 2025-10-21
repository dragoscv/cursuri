import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

/**
 * Cookie-only i18n configuration for the Cursuri platform.
 * 
 * NO URL-based routing - locale is determined ONLY from cookies.
 * The locale preference is stored in a 'locale' cookie.
 * 
 * Translation files are organized by domain (common, auth, courses, etc.)
 * and automatically merged for each locale.
 * 
 * Detection:
 * 1. Read 'locale' cookie
 * 2. Default to 'en' if not set
 */
export default getRequestConfig(async () => {
    // Get locale from cookie only
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale');

    // Fallback to English if cookie not set
    const locale = localeCookie?.value || 'en';

    // Ensure valid locale (en or ro only)
    const validLocale = locale === 'ro' ? 'ro' : 'en';

    // Load all domain translation files and merge them
    const domains = ['common', 'auth', 'courses', 'lessons', 'profile', 'admin', 'home', 'legal', 'about', 'contact'];
    const messages: Record<string, any> = {};

    for (const domain of domains) {
        try {
            const domainMessages = await import(`../messages/${validLocale}/${domain}.json`);
            messages[domain] = domainMessages.default;
        } catch (error) {
            console.warn(`Warning: Could not load ${domain}.json for locale ${validLocale}`);
        }
    }

    return {
        locale: validLocale,
        messages,
    };
});

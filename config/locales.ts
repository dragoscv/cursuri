/**
 * Content locales — the set of languages that lesson & course content
 * (titles, descriptions, summaries, key points, captions, transcriptions)
 * can be translated into via the AI translation pipeline.
 *
 * NOTE: This is intentionally separate from UI locales. The UI strings
 * (messages/<locale>/*.json) are currently only authored in `en` and `ro`.
 * Content translations cover a much wider set of learner-facing languages.
 *
 * `code` is the BCP-47 tag we use as the storage key on the lesson/course
 * `translations` map. The `speechCode` is the Azure-style locale used by
 * the captions pipeline (matches the keys in `lesson.captions`).
 */

export interface ContentLocale {
    /** BCP-47 code used in `lesson.translations[code]`. */
    code: string;
    /** Azure Speech locale used as the captions key when caption translations are saved. */
    speechCode: string;
    /** Native (endonym) display name. */
    nativeName: string;
    /** English display name (for admin UI). */
    englishName: string;
    /** ISO country flag emoji for visual scan. */
    flag: string;
    /** Right-to-left script flag — used for preview layout. */
    rtl?: boolean;
}

export const CONTENT_LOCALES: ContentLocale[] = [
    { code: 'en', speechCode: 'en-US', nativeName: 'English', englishName: 'English', flag: '🇬🇧' },
    { code: 'ro', speechCode: 'ro-RO', nativeName: 'Română', englishName: 'Romanian', flag: '🇷🇴' },
    { code: 'es', speechCode: 'es-ES', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', speechCode: 'fr-FR', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
    { code: 'de', speechCode: 'de-DE', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
    { code: 'it', speechCode: 'it-IT', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', speechCode: 'pt-BR', nativeName: 'Português (Brasil)', englishName: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'pt-PT', speechCode: 'pt-PT', nativeName: 'Português (Portugal)', englishName: 'Portuguese (Portugal)', flag: '🇵🇹' },
    { code: 'nl', speechCode: 'nl-NL', nativeName: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', speechCode: 'pl-PL', nativeName: 'Polski', englishName: 'Polish', flag: '🇵🇱' },
    { code: 'cs', speechCode: 'cs-CZ', nativeName: 'Čeština', englishName: 'Czech', flag: '🇨🇿' },
    { code: 'sk', speechCode: 'sk-SK', nativeName: 'Slovenčina', englishName: 'Slovak', flag: '🇸🇰' },
    { code: 'hu', speechCode: 'hu-HU', nativeName: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺' },
    { code: 'bg', speechCode: 'bg-BG', nativeName: 'Български', englishName: 'Bulgarian', flag: '🇧🇬' },
    { code: 'el', speechCode: 'el-GR', nativeName: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
    { code: 'sv', speechCode: 'sv-SE', nativeName: 'Svenska', englishName: 'Swedish', flag: '🇸🇪' },
    { code: 'da', speechCode: 'da-DK', nativeName: 'Dansk', englishName: 'Danish', flag: '🇩🇰' },
    { code: 'nb', speechCode: 'nb-NO', nativeName: 'Norsk Bokmål', englishName: 'Norwegian', flag: '🇳🇴' },
    { code: 'fi', speechCode: 'fi-FI', nativeName: 'Suomi', englishName: 'Finnish', flag: '🇫🇮' },
    { code: 'tr', speechCode: 'tr-TR', nativeName: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
    { code: 'ar', speechCode: 'ar-SA', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', rtl: true },
    { code: 'he', speechCode: 'he-IL', nativeName: 'עברית', englishName: 'Hebrew', flag: '🇮🇱', rtl: true },
    { code: 'fa', speechCode: 'fa-IR', nativeName: 'فارسی', englishName: 'Persian', flag: '🇮🇷', rtl: true },
    { code: 'zh-CN', speechCode: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-TW', speechCode: 'zh-TW', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'ja', speechCode: 'ja-JP', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', speechCode: 'ko-KR', nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷' },
    { code: 'ru', speechCode: 'ru-RU', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
    { code: 'uk', speechCode: 'uk-UA', nativeName: 'Українська', englishName: 'Ukrainian', flag: '🇺🇦' },
    { code: 'hi', speechCode: 'hi-IN', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
    { code: 'vi', speechCode: 'vi-VN', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', speechCode: 'th-TH', nativeName: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
    { code: 'id', speechCode: 'id-ID', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
];

export const CONTENT_LOCALE_CODES = CONTENT_LOCALES.map((l) => l.code);

const LOCALE_BY_CODE = new Map(CONTENT_LOCALES.map((l) => [l.code.toLowerCase(), l]));
const LOCALE_BY_SPEECH = new Map(CONTENT_LOCALES.map((l) => [l.speechCode.toLowerCase(), l]));

export function getContentLocale(code: string | undefined | null): ContentLocale | undefined {
    if (!code) return undefined;
    const lower = code.toLowerCase();
    return (
        LOCALE_BY_CODE.get(lower) ||
        LOCALE_BY_SPEECH.get(lower) ||
        // Fall back on the language portion (e.g. "en-GB" -> "en").
        LOCALE_BY_CODE.get(lower.split('-')[0])
    );
}

export function isSupportedContentLocale(code: string | undefined | null): boolean {
    return !!getContentLocale(code);
}

/**
 * Source language — the language all originals are authored in. The
 * translation pipeline never overwrites this on the source-of-truth fields.
 */
export const DEFAULT_SOURCE_LOCALE = 'ro';

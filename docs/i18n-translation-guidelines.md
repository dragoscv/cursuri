# 📖 i18n Translation Guidelines

**Project**: Cursuri Learning Platform  
**Last Updated**: October 20, 2025  
**Status**: Complete implementation reference guide

---

## 📋 Overview

This document provides comprehensive guidelines for maintaining and extending the internationalization (i18n) implementation in the Cursuri platform. It covers best practices, patterns, conventions, and examples for working with translations.

---

## 🏗️ Architecture Overview

### Cookie-Only Locale Detection
```typescript
// i18n/request.ts - Server-side locale detection
export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale');
    const validLocale = localeCookie?.value === 'ro' ? 'ro' : 'en';
    
    // Load domain-based translation files
    const domains = ['common', 'auth', 'courses', 'lessons', 'profile', 'admin', 'home'];
    // ... merge translations
    
    return { locale: validLocale, messages };
});
```

### No URL Routing
✅ **Correct**: `https://cursuri.com/courses`  
❌ **Wrong**: `https://cursuri.com/en/courses` or `https://cursuri.com/ro/courses`

The locale is stored entirely in cookies, not URLs.

---

## 📝 Translation File Structure

### Domain Organization
```
messages/
├── en/
│   ├── common.json      # Navigation, buttons, errors, empty states
│   ├── auth.json        # Login, signup, password reset
│   ├── courses.json     # Course listings, filters, details
│   ├── lessons.json     # Lesson viewer, form, content
│   ├── profile.json     # User dashboard, settings, purchases
│   ├── admin.json       # Admin interface components
│   └── home.json        # Homepage sections
└── ro/
    └── (mirror of en/)
```

### Key Naming Convention

**Pattern**: `domain.section.key`

```json
{
  "profile": {
    "settings": {
      "notifications": {
        "emailTitle": "Email Notifications",
        "emailDescription": "Receive course updates via email"
      },
      "privacy": {
        "publicProfileLabel": "Make my profile public",
        "showEmailLabel": "Show my email address"
      }
    }
  }
}
```

**Benefits**:
- Clear hierarchy and organization
- Easy to find specific translations
- Type-safe with TypeScript
- Prevents key collisions

---

## 🔧 Implementation Patterns

### Basic Component Translation

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
    const t = useTranslations('domain.section');
    
    return (
        <div>
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
            <button>{t('actionButton')}</button>
        </div>
    );
}
```

### Multiple Translation Domains

```typescript
export default function ComplexComponent() {
    const t = useTranslations('profile.settings');
    const tCommon = useTranslations('common.buttons');
    const tErrors = useTranslations('common.errors');
    
    return (
        <div>
            <h2>{t('title')}</h2>
            <button>{tCommon('save')}</button>
            {error && <p>{tErrors('saveFailed')}</p>}
        </div>
    );
}
```

### Dynamic Content with Variables

```typescript
// Translation file
{
  "greeting": "Welcome, {name}!",
  "itemCount": "You have {count} items",
  "search": {
    "noResults": "No courses found for \"{query}\""
  }
}

// Component
const t = useTranslations('messages');
<p>{t('greeting', { name: userName })}</p>
<p>{t('itemCount', { count: items.length })}</p>
<p>{t('search.noResults', { query: searchQuery })}</p>
```

### Pluralization

```typescript
// Translation files
{
  "en": {
    "courseCount": "{count, plural, =0 {No courses} one {1 course} other {# courses}}"
  },
  "ro": {
    "courseCount": "{count, plural, =0 {Niciun curs} one {1 curs} few {# cursuri} other {# de cursuri}}"
  }
}

// Usage
const t = useTranslations('courses');
<p>{t('courseCount', { count: courseCount })}</p>
```

### Date and Number Formatting

```typescript
import { useLocale } from 'next-intl';

export default function FormattedContent() {
    const locale = useLocale();
    
    // Numbers
    const price = 1234.56;
    const formattedPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: locale === 'ro' ? 'RON' : 'USD'
    }).format(price);
    // EN: $1,234.56
    // RO: 1.234,56 RON
    
    // Dates
    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
    // EN: October 20, 2025
    // RO: 20 octombrie 2025
    
    return (
        <div>
            <p>{formattedPrice}</p>
            <p>{formattedDate}</p>
        </div>
    );
}
```

---

## 📊 Best Practices

### 1. Always Use Translation Keys

✅ **GOOD**:
```typescript
const t = useTranslations('common.buttons');
<button>{t('login')}</button>
```

❌ **BAD**:
```typescript
<button>Login</button>
```

### 2. Group Related Translations

✅ **GOOD**:
```json
{
  "form": {
    "emailLabel": "Email Address",
    "emailPlaceholder": "Enter your email",
    "emailError": "Please enter a valid email"
  }
}
```

❌ **BAD**:
```json
{
  "emailLabel": "Email Address",
  "emailPlaceholder": "Enter your email",
  "emailError": "Please enter a valid email"
}
```

### 3. Provide Context in Keys

✅ **GOOD**:
```json
{
  "course": {
    "enrollment": {
      "successTitle": "Successfully Enrolled",
      "successMessage": "You can now access all course materials",
      "successAction": "Start Learning"
    }
  }
}
```

❌ **BAD**:
```json
{
  "success": "Success",
  "message": "You're enrolled",
  "action": "Continue"
}
```

### 4. Handle Edge Cases

```typescript
// Handle missing translations gracefully
const t = useTranslations('profile');

// Provide fallback values
const displayName = t('displayName', { default: 'User' });

// Handle optional props with translations
const title = customTitle || t('defaultTitle');
```

### 5. Keep Translation Files Synchronized

**Always update both EN and RO files together**:

```bash
# Before committing
git diff messages/en/common.json
git diff messages/ro/common.json

# Ensure both have same keys (different values)
```

### 6. Use Descriptive Key Names

✅ **GOOD**:
```json
{
  "errors": {
    "courseNotFound": "Course not found",
    "lessonAccessDenied": "You don't have access to this lesson",
    "paymentFailed": "Payment processing failed"
  }
}
```

❌ **BAD**:
```json
{
  "error1": "Course not found",
  "error2": "Access denied",
  "error3": "Failed"
}
```

---

## 🎨 Common Patterns

### Form Translations

```typescript
export default function RegistrationForm() {
    const t = useTranslations('auth.register');
    const tCommon = useTranslations('common.buttons');
    
    return (
        <form>
            <Input 
                label={t('nameLabel')}
                placeholder={t('namePlaceholder')}
                error={errors.name && t('nameError')}
            />
            
            <Input 
                label={t('emailLabel')}
                placeholder={t('emailPlaceholder')}
                type="email"
            />
            
            <Button type="submit">
                {tCommon('signUp')}
            </Button>
        </form>
    );
}
```

### Error Messages

```typescript
export default function CourseEnrollment() {
    const t = useTranslations('courses.enrollment');
    const tErrors = useTranslations('common.errors');
    
    const handleEnroll = async () => {
        try {
            await enrollInCourse(courseId);
            toast.success(t('successMessage'));
        } catch (error) {
            if (error.code === 'ALREADY_ENROLLED') {
                toast.error(t('alreadyEnrolledError'));
            } else {
                toast.error(tErrors('genericError'));
            }
        }
    };
}
```

### Empty States

```typescript
export default function CourseList({ courses }) {
    const t = useTranslations('courses.list');
    const tEmpty = useTranslations('common.emptyStates');
    
    if (courses.length === 0) {
        return (
            <div className="empty-state">
                <h3>{tEmpty('noCoursesAvailable')}</h3>
                <p>{t('emptyDescription')}</p>
                <Button>{t('browseAllCourses')}</Button>
            </div>
        );
    }
    
    return <div>{/* render courses */}</div>;
}
```

### Loading States

```typescript
export default function DataComponent() {
    const t = useTranslations('common');
    const [loading, setLoading] = useState(true);
    
    if (loading) {
        return (
            <div className="loading">
                <Spinner />
                <p>{t('loading')}</p>
            </div>
        );
    }
    
    return <div>{/* render data */}</div>;
}
```

---

## 🌍 Romanian Translation Guidelines

### Character Encoding
Always use UTF-8 and proper Romanian diacritics:
- ă, Ă (a with breve)
- â, Â (a with circumflex)
- î, Î (i with circumflex)
- ș, Ș (s with comma below)
- ț, Ț (t with comma below)

✅ **CORRECT**: "Autentificare", "Înregistrare", "Șterge"  
❌ **WRONG**: "Autentificare", "Inregistrare", "Sterge"

### Formal vs. Informal
Use **formal "dumneavoastră"** form for most UI text:

✅ **FORMAL**: "Vă mulțumim pentru înregistrare"  
❌ **INFORMAL**: "Îți mulțumim pentru înregistrare"

**Exception**: Community/social features can use informal "tu" form

### Text Length
Romanian text is typically 20-30% longer than English:

```json
{
  "en": {
    "continue": "Continue"  // 8 characters
  },
  "ro": {
    "continue": "Continuă"  // 8 characters (similar)
  }
}

{
  "en": {
    "settings": "Settings"  // 8 characters
  },
  "ro": {
    "settings": "Setări"  // 6 characters (shorter)
  }
}

{
  "en": {
    "enrollment": "Enrollment"  // 10 characters
  },
  "ro": {
    "enrollment": "Înscriere"  // 9 characters
  }
}
```

**Design accordingly**: Use flexible layouts that accommodate text expansion.

### Common Translations Reference

| English | Romanian | Notes |
|---------|----------|-------|
| Login | Autentificare | Formal form |
| Sign Up | Înregistrare | Not "Inscrie-te" |
| Continue | Continuă | Imperative |
| Save | Salvează | Imperative |
| Cancel | Anulează | Imperative |
| Delete | Șterge | Imperative |
| Settings | Setări | Plural |
| Profile | Profil | Singular |
| Dashboard | Panou de Control | Literal translation |
| Course | Curs | Singular |
| Courses | Cursuri | Plural |
| Lesson | Lecție | Singular |
| Lessons | Lecții | Plural |
| Loading... | Se încarcă... | Progressive form |
| Error | Eroare | Singular |
| Success | Succes | Singular |

---

## 🔍 Testing Your Translations

### Visual Testing Checklist
- [ ] Switch to Romanian and verify all text is translated
- [ ] Check for layout breaks (text overflow, wrapping issues)
- [ ] Verify buttons are still readable
- [ ] Test on mobile devices (smaller screens)
- [ ] Check for proper diacritic rendering

### Console Warnings
```bash
# Check browser console for missing keys
# Warning: Missing translation: "domain.section.key"
```

### Automated Validation
```bash
# Run translation synchronization check
npm run validate-translations

# Search for hardcoded text
grep -r ">[A-Z][a-zA-Z\s]{5,}<" components/
```

---

## 📦 Adding New Translations

### Step-by-Step Process

1. **Identify the domain** (common, auth, courses, etc.)

2. **Choose the appropriate section**
```json
{
  "domain": {
    "existingSection": { ... },
    "newSection": {
      // Add your keys here
    }
  }
}
```

3. **Add to English file first**
```json
// messages/en/domain.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature description",
    "action": "Try It Now"
  }
}
```

4. **Add Romanian translation**
```json
// messages/ro/domain.json
{
  "newFeature": {
    "title": "Funcție Nouă",
    "description": "Aceasta este descrierea funcției noi",
    "action": "Încearcă Acum"
  }
}
```

5. **Use in component**
```typescript
const t = useTranslations('domain.newFeature');

<div>
  <h2>{t('title')}</h2>
  <p>{t('description')}</p>
  <Button>{t('action')}</Button>
</div>
```

6. **Test both languages**
- Switch to EN and verify
- Switch to RO and verify
- Check console for warnings

7. **Commit with descriptive message**
```bash
git add messages/en/domain.json messages/ro/domain.json
git commit -m "feat(i18n): add translations for new feature"
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Update Both Locales
**Problem**: Adding keys only to EN file  
**Solution**: Always update RO file immediately

### 2. Using Hardcoded Text
**Problem**: `<button>Click Here</button>`  
**Solution**: `<button>{t('clickHere')}</button>`

### 3. Inconsistent Key Naming
**Problem**: Mixing flat and nested structures  
**Solution**: Always use hierarchical `domain.section.key`

### 4. Missing Context
**Problem**: Generic keys like "save", "cancel"  
**Solution**: Specific keys like "profile.settings.save", "modal.close"

### 5. Not Testing Romanian Layout
**Problem**: Text overflow due to length differences  
**Solution**: Always test with Romanian locale activated

### 6. Incorrect Pluralization
**Problem**: Using simple `{count} courses` for all languages  
**Solution**: Use ICU plural syntax for proper Romanian forms

---

## 📚 Resources

### Documentation
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Romanian Grammar Rules](https://en.wikipedia.org/wiki/Romanian_grammar)

### Internal Files
- `i18n/request.ts` - Cookie detection logic
- `components/LanguageSwitcher.tsx` - Language switching UI
- `middleware.ts` - Security middleware (no locale routing)
- `next.config.js` - next-intl configuration

### Translation Tools
- **Google Translate** (for quick reference, always review)
- **DeepL** (often better quality for Romanian)
- **Native Speaker Review** (required for production)

---

## ✅ Checklist for New Developers

When adding a new feature:
- [ ] Identify which translation domain to use
- [ ] Add English keys with descriptive names
- [ ] Add Romanian translations (or mark TODO for native speaker)
- [ ] Import `useTranslations` in component
- [ ] Replace all hardcoded text with `t()` calls
- [ ] Test language switching
- [ ] Verify layout works in both languages
- [ ] Check browser console for missing key warnings
- [ ] Commit both EN and RO files together
- [ ] Document any special translation needs in PR

---

**Questions?** Check existing translations for examples or ask the team lead.

**Last Updated**: October 20, 2025 by the Development Team

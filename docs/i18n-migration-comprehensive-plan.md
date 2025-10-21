# Comprehensive i18n Migration Plan

## 📋 Executive Summary

**Goal**: Complete translation migration of entire Cursuri platform to support English (EN) and Romanian (RO) with instant cookie-based locale switching, NO URL routing.

**Current Status**: 
- ✅ Infrastructure: 100% complete (next-intl v4.3.12, cookie-based)
- ✅ Migrated: 27 components using `useTranslations()`
- ⚠️ Remaining: ~200+ hardcoded text instances across app, admin, profile, lesson components
- ⚠️ No URL routing confirmed (verified in middleware.ts, i18n/request.ts, next.config.js)

**Target**: 100% translation coverage across all user-facing text

---

## 🏗️ Architecture Overview

### Current Implementation (Confirmed Working)
```typescript
// i18n/request.ts - Cookie-only locale detection
export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale');
    const locale = localeCookie?.value || 'en';
    const validLocale = locale === 'ro' ? 'ro' : 'en';
    
    // Load and merge domain translation files
    const domains = ['common', 'auth', 'courses', 'lessons', 'profile', 'admin', 'home'];
    // ... merge logic
});
```

### No URL Routing
- ✅ `middleware.ts`: Security only, no locale routing
- ✅ `next.config.js`: Uses `next-intl` plugin without routing config
- ✅ `LanguageSwitcher`: Updates cookie only, triggers revalidation
- ✅ Navigation: All relative paths, no `/en` or `/ro` prefixes

### Translation File Structure
```
messages/
├── en/
│   ├── common.json       ✅ Headers, footers, buttons, nav
│   ├── auth.json         ✅ Login, signup, errors (45+ keys)
│   ├── courses.json      ✅ Course components
│   ├── lessons.json      ⚠️ Partial coverage
│   ├── profile.json      ⚠️ Minimal coverage
│   ├── admin.json        ⚠️ Minimal coverage
│   └── home.json         ✅ Homepage sections
└── ro/
    └── [mirror of en/]   ✅ All files match structure
```

---

## 📊 Component Migration Status

### ✅ Fully Migrated (27 components)
| Component | Domain | Status |
|-----------|--------|--------|
| `HeroSection.tsx` | home.hero | ✅ Complete |
| `Login.tsx` | auth | ✅ Complete (45+ keys) |
| `Header.tsx` | common | ✅ Complete |
| `Footer.tsx` | common | ⚠️ Partial (missing legal links) |
| `WhyChooseUsSection` | home.whyChooseUs | ✅ Complete |
| `TechStackSection` | home.techStack | ✅ Complete |
| `StatisticsSection` | home.statistics | ✅ Complete |
| `RecommendedCoursesSection` | home.recommendedCourses | ✅ Complete |
| `FeaturedCoursesSection` | home.featuredCourses | ✅ Complete |
| `FeaturedReviewsSection` | home.reviews | ✅ Complete |
| `LearningPathSection` | home.learningPath | ✅ Complete |
| `InstructorHighlightsSection` | home.instructorHighlights | ✅ Complete |
| `CallToActionSection` | home.cta | ✅ Complete |
| `AvailableCoursesSection` | home.availableCourses | ✅ Complete |
| `Course.tsx` | courses | ✅ Complete |
| `CourseContent.tsx` | courses.content | ✅ Complete |
| `CourseOverview.tsx` | courses.overview | ✅ Complete |
| `CourseEnrollment.tsx` | courses.enrollment | ✅ Complete (just fixed) |
| `LessonsList.tsx` | courses.lessonsList | ✅ Complete |
| `Reviews.tsx` | courses.reviewsSection | ✅ Complete |
| `CoursesFilter.tsx` | courses.filter | ✅ Complete |
| `Courses.tsx` | courses | ✅ Complete |

### ⚠️ Partially Migrated (Need Completion)
| Component | Hardcoded Text Count | Priority |
|-----------|---------------------|----------|
| `app/admin/courses/page.tsx` | 8 instances | HIGH |
| `components/Courses/CoursesList.tsx` | 4 instances | HIGH |
| `components/SearchBar.tsx` | 6 instances | HIGH |
| `components/Footer.tsx` | 12 instances | MEDIUM |
| `components/FeaturedCoursesSection.tsx` | 3 instances | MEDIUM |
| `components/RecommendedCoursesSection.tsx` | 1 instance | LOW |

### ❌ Not Migrated (High Priority)
| Category | Components Count | Hardcoded Text |
|----------|------------------|----------------|
| **Profile Components** | 12 | 80+ instances |
| **Lesson Components** | 15 | 60+ instances |
| **Admin Components** | 8 | 40+ instances |
| **Layout Components** | 6 | 30+ instances |
| **Utility Components** | 4 | 20+ instances |

---

## 🎯 Migration Priority Matrix

### Phase 1: High-Traffic User-Facing (Week 1)
**Priority**: CRITICAL - Most visible to end users

1. **Profile Components** (12 components, 80+ strings)
   - `components/Profile/AppSettings.tsx` - Notification & Privacy settings
   - `components/Profile/PaymentHistorySection.tsx` - Payment table
   - `components/Profile/DashboardProgress.tsx` - Progress charts
   - `components/Profile/CourseCard.tsx` - Course status chips
   - `components/Profile/LearningPathSection.tsx` - Learning path UI
   - `components/Profile/OfflineContentSection.tsx` - Offline download UI
   - `components/Profile/ThemeSelector.tsx` - Theme picker
   - `components/Profile/RecentActivity.tsx` - Activity feed
   - **Duplicates**: `components/layout/Profile/*.tsx` (same structure)

2. **SearchBar & Navigation** (2 components, 12 strings)
   - `components/SearchBar.tsx` - Search placeholder, keyboard hints
   - `components/layout/SearchBar.tsx` - (duplicate)
   - `components/Header/UserDropdown/index.tsx` - Menu items

3. **Course Components** (3 components, 8 strings)
   - `components/Courses/CoursesList.tsx` - Most Popular, Featured badges
   - `components/FeaturedCoursesSection.tsx` - View button, Free label
   - `components/RecommendedCoursesSection.tsx` - Free label

### Phase 2: Lesson Experience (Week 2)
**Priority**: HIGH - Core learning experience

4. **Lesson Components** (15 components, 60+ strings)
   - `components/Lesson/LessonForm.tsx` - Complex form (highest priority)
   - `components/Lesson/LessonContent.tsx` - Content viewer
   - `components/Lesson/LessonViewer.tsx` - Main viewer
   - `components/Lesson/LessonDetailComponent.tsx` - Detail page
   - `components/Lesson/LessonHeader.tsx` - Header actions
   - `components/Lesson/LessonNavigation.tsx` - Lesson nav
   - `components/Lesson/LessonNotFound.tsx` - Error page
   - `components/Lesson/OfflineButton.tsx` - Download button
   - `components/Lesson/ClientLessonWrapper.tsx` - Wrapper
   - `components/Lesson/Video/VideoPlayer.tsx` - Video UI
   - `components/Lesson/Resources/ResourcesList.tsx` - Resources
   - `components/Lesson/Settings/LessonSettings.tsx` - Settings
   - `components/Lesson/QA/*.tsx` - Q&A components

### Phase 3: Admin & Management (Week 3)
**Priority**: MEDIUM - Admin-only interface

5. **Admin Components** (8 components, 40+ strings)
   - `app/admin/courses/page.tsx` - Admin courses page
   - `components/Admin/*.tsx` - Admin dashboard
   - `components/Admin/AdminAnalytics.tsx` - Analytics (already has useLocale)
   - `components/Admin/AdminRevenueSection.tsx` - Revenue (already has useLocale)
   - Other admin sections

### Phase 4: Utility & Polish (Week 4)
**Priority**: LOW - Supporting features

6. **Footer & Legal** (2 components, 15 strings)
   - `components/Footer.tsx` - Complete footer migration
   - `components/layout/Footer.tsx` - (duplicate)

7. **Utility Components** (4 components, 20 strings)
   - `components/layout/CookieConsent.tsx` - Cookie dialog
   - `components/layout/CacheStatus.tsx` - Cache debugging
   - `components/ui/Select.tsx` - "No options" message
   - `components/ui/OptimizedImage.tsx` - "Image not available"

8. **Error & Empty States** (All components, 30+ strings)
   - Consolidate all error messages to `common.json`
   - Create `emptyStates` section in `common.json`

---

## 📝 Translation Key Naming Conventions

### Pattern: `domain.section.key`

```typescript
// ✅ GOOD - Hierarchical structure
t('profile.settings.notifications.emailTitle')
t('profile.settings.privacy.publicProfileLabel')
t('admin.courses.emptyState.title')
t('lessons.form.basicInfo.titleLabel')
t('common.emptyStates.noCoursesTitle')
t('common.errors.accessDenied')

// ❌ BAD - Flat structure
t('emailNotificationsTitle')
t('noCoursesMessage')
t('accessDeniedError')
```

### Domain Organization

```json
// common.json - Global UI elements
{
  "header": {...},
  "footer": {...},
  "navigation": {...},
  "buttons": {...},
  "errors": {...},
  "emptyStates": {...},
  "consent": {...}
}

// profile.json - Profile-specific
{
  "settings": {
    "notifications": {...},
    "privacy": {...},
    "data": {...}
  },
  "dashboard": {...},
  "payments": {...},
  "courses": {...}
}

// lessons.json - Lesson-specific
{
  "form": {
    "basicInfo": {...},
    "additionalContent": {...},
    "quiz": {...}
  },
  "viewer": {...},
  "navigation": {...},
  "resources": {...}
}

// admin.json - Admin-specific
{
  "dashboard": {...},
  "courses": {...},
  "users": {...},
  "analytics": {...}
}
```

---

## 🔧 Implementation Patterns

### 1. Component Migration Template

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl'; // For number/date formatting

export default function ExampleComponent() {
    const t = useTranslations('domain.section');
    const locale = useLocale(); // For toLocaleString, toLocaleDateString
    
    return (
        <div>
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
            <span>{amount.toLocaleString(locale)}</span>
        </div>
    );
}
```

### 2. Dynamic Content with Variables

```typescript
// Translation file
{
  "welcomeMessage": "Welcome, {name}!",
  "coursesCount": "You have {count} {count, plural, one {course} other {courses}}"
}

// Component usage
t('welcomeMessage', { name: user.name })
t('coursesCount', { count: coursesLength })
```

### 3. Handling Arrays and Lists

```typescript
// Translation file
{
  "steps": {
    "step1": { "title": "...", "description": "..." },
    "step2": { "title": "...", "description": "..." }
  }
}

// Component usage
const steps = ['step1', 'step2'].map(key => ({
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`)
}));
```

### 4. Conditional Rendering with Translations

```typescript
// Translation file
{
  "courseStatus": {
    "completed": "Completed",
    "inProgress": "In Progress",
    "notStarted": "Not Started"
  }
}

// Component usage
<Chip>{t(`courseStatus.${getStatus()}`)}</Chip>
```

---

## 🧪 Testing Strategy

### 1. Manual Testing Checklist
- [ ] Switch language via LanguageSwitcher
- [ ] Verify instant update (no page reload URL change)
- [ ] Check cookie value in DevTools
- [ ] Test all navigation (relative paths only)
- [ ] Verify number/currency formatting (EN: 1,000.00 vs RO: 1.000,00)
- [ ] Test date formatting (English vs Romanian month names)
- [ ] Check form validation messages
- [ ] Test error states in both languages
- [ ] Verify empty states show correct translations
- [ ] Test admin pages (if admin user)
- [ ] Test profile pages
- [ ] Test lesson viewer and forms

### 2. Automated Testing with Playwright MCP

```typescript
// Test language switching
await playwright_navigate('http://localhost:3000');
await playwright_get_visible_text(); // Check English text
await playwright_evaluate('document.cookie = "locale=ro"');
await playwright_navigate('http://localhost:3000');
await playwright_get_visible_text(); // Check Romanian text
```

### 3. Translation Coverage Verification

```bash
# Find remaining hardcoded text
grep -r "className.*>[A-Z][a-zA-Z\s]{5,}<" components/ app/

# Verify useTranslations usage
grep -r "useTranslations(" components/ app/ | wc -l

# Check for missing translation keys
# Run app and check browser console for missing key warnings
```

---

## 📦 Deliverables

### Translation Files
- ✅ `messages/en/common.json` - Expand with navigation, errors, emptyStates, consent
- ⚠️ `messages/en/profile.json` - Create comprehensive profile translations
- ⚠️ `messages/en/lessons.json` - Create comprehensive lesson translations
- ⚠️ `messages/en/admin.json` - Create comprehensive admin translations
- ✅ `messages/ro/*.json` - Mirror all English translations

### Documentation
- [ ] `docs/i18n-guidelines.md` - Developer guidelines for translations
- [ ] `docs/i18n-testing.md` - Testing procedures
- [x] `docs/i18n-migration-comprehensive-plan.md` - This document

### Code Changes
- [ ] ~200 component files updated to use `useTranslations()`
- [ ] All hardcoded text extracted to translation files
- [ ] Consistent key naming across all domains
- [ ] Dynamic locale formatting for numbers/dates/currency

---

## 🚀 Execution Plan

### Week 1: Profile & High-Traffic Components
**Days 1-2**: Profile Components (AppSettings, PaymentHistorySection, DashboardProgress)
**Days 3-4**: SearchBar, Navigation, UserDropdown
**Day 5**: Course Components (CoursesList, Featured, Recommended)

### Week 2: Lesson Experience
**Days 1-2**: LessonForm.tsx (complex, needs careful extraction)
**Days 3-4**: LessonContent, LessonViewer, LessonDetailComponent
**Day 5**: Lesson sub-components (Navigation, Resources, Video, QA)

### Week 3: Admin & Management
**Days 1-2**: Admin pages (app/admin/courses/page.tsx)
**Days 3-4**: Admin components (dashboard, analytics, users)
**Day 5**: Admin utilities and settings

### Week 4: Utilities & Testing
**Days 1-2**: Footer, Legal links, CookieConsent, CacheStatus
**Days 3-4**: Error messages, Empty states, UI components
**Day 5**: Comprehensive testing, bug fixes, documentation

---

## ⚠️ Critical Requirements

### Must-Have Features
1. ✅ **No URL Routing**: Confirmed working, cookie-only
2. ✅ **Instant Switching**: Language changes without page reload/navigation
3. ⚠️ **100% Coverage**: All user-visible text must be translatable
4. ⚠️ **Consistent Keys**: Follow `domain.section.key` pattern
5. ⚠️ **Proper Formatting**: Use `useLocale()` for numbers/dates/currency
6. ✅ **Domain Organization**: Separate files by feature area

### Quality Standards
- **No Hardcoded Text**: Zero English/Romanian strings in components
- **Type Safety**: All translation keys type-checked (next-intl provides this)
- **Fallback Handling**: Graceful degradation if translation missing
- **Performance**: Lazy-loaded domains, no unnecessary re-renders
- **Accessibility**: Maintain ARIA labels and semantic HTML

---

## 📈 Success Metrics

### Technical Metrics
- **Translation Coverage**: 100% (currently ~20%)
- **Components Migrated**: 100% (currently 27 out of ~150)
- **Hardcoded Text Instances**: 0 (currently 200+)
- **Translation Domains**: 7 complete files
- **Build Time Impact**: < 5% increase
- **Runtime Performance**: No measurable impact

### User Experience Metrics
- **Language Switch Speed**: < 100ms (instant, no reload)
- **Translation Accuracy**: 100% (verified by native speakers)
- **UI Consistency**: Perfect match across languages
- **No Broken UI**: Zero layout breaks from text length differences

---

## 🔍 Risk Mitigation

### Risk 1: Text Length Variations
**Impact**: Romanian text can be 20-30% longer than English
**Mitigation**: 
- Use responsive design with flex/grid
- Test all UI components in both languages
- Add overflow handling where needed

### Risk 2: Missing Context for Translators
**Impact**: Incorrect translations due to lack of context
**Mitigation**:
- Add comments in translation files
- Document translation key meanings
- Provide screenshots for complex UI

### Risk 3: Dynamic Content Translation
**Impact**: User-generated content remains untranslated
**Mitigation**:
- Clearly separate system UI from user content
- Document which fields support multiple languages
- Consider future multi-language content support

### Risk 4: Performance Impact
**Impact**: Loading multiple translation files
**Mitigation**:
- Already using domain-based lazy loading
- Translation files are small JSON (< 50KB each)
- Caching handled by next-intl automatically

---

## 📞 Support & Resources

### Documentation
- [next-intl Official Docs](https://next-intl-docs.vercel.app/)
- [ICU Message Syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Cookie-based Locale Guide](https://github.com/amannn/next-intl/issues/366)

### Internal Resources
- `i18n/request.ts` - Cookie detection logic
- `components/LanguageSwitcher.tsx` - Language switching UI
- `middleware.ts` - Security (no locale routing)
- `next.config.js` - next-intl configuration

### Team Contacts
- **i18n Lead**: [Assign team member]
- **Translation Review**: [Native Romanian speaker]
- **QA Testing**: [Testing team]
- **DevOps**: [For deployment verification]

---

## ✅ Definition of Done

A component/page is considered "migrated" when:
1. ✅ All visible text uses `useTranslations()` hook
2. ✅ Translation keys follow `domain.section.key` pattern
3. ✅ Both EN and RO translations exist and are accurate
4. ✅ Numbers/dates/currency use `useLocale()` for formatting
5. ✅ Component tested in both languages
6. ✅ No hardcoded text remains (verified by grep)
7. ✅ UI layout works correctly in both languages
8. ✅ No console warnings for missing keys
9. ✅ Code reviewed by peer
10. ✅ Merged to main branch

---

**Last Updated**: October 20, 2025
**Document Owner**: Development Team
**Next Review**: After Phase 1 completion (Week 1)

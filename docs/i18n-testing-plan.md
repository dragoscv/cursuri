# 🧪 i18n Translation Testing Plan

**Project**: Cursuri Learning Platform  
**Last Updated**: October 20, 2025  
**Status**: All component migrations complete, ready for comprehensive testing

---

## 📋 Overview

This document outlines the comprehensive testing strategy for the internationalization (i18n) implementation across the Cursuri platform. All user-facing components have been migrated to use next-intl v4.3.12 with cookie-based locale switching.

### Testing Goals
- ✅ Verify all translations display correctly in both English and Romanian
- ✅ Ensure instant language switching without URL changes
- ✅ Validate cookie-based locale persistence
- ✅ Test dynamic content formatting (numbers, dates, currency)
- ✅ Verify accessibility with translated content
- ✅ Ensure no hardcoded text remains in components

---

## 🎯 Testing Strategy

### 1. Manual Testing Checklist

#### Language Switching
- [ ] Click EN button in LanguageSwitcher
- [ ] Verify all visible text updates to English
- [ ] Click RO button in LanguageSwitcher
- [ ] Verify all visible text updates to Romanian
- [ ] Confirm page reloads but URL stays the same (no /en or /ro)
- [ ] Verify 'locale' cookie is set correctly in DevTools
- [ ] Close and reopen browser - verify language preference persists

#### Navigation & URL Verification
- [ ] Navigate through all pages (home, courses, profile, admin)
- [ ] Verify URL paths remain unchanged (no locale prefixes)
- [ ] Test direct URL access with different cookie values
- [ ] Verify relative links work correctly
- [ ] Test browser back/forward buttons
- [ ] Verify no `/en/` or `/ro/` patterns anywhere

#### Component Coverage Testing
**Home Page:**
- [ ] Hero section title and description
- [ ] Call-to-action buttons
- [ ] Statistics section
- [ ] Featured courses section
- [ ] Testimonials section
- [ ] Footer links and copyright

**Course Pages:**
- [ ] Course listings and filters
- [ ] Course cards (title, description, price)
- [ ] Enrollment buttons and status
- [ ] Lesson navigation
- [ ] Empty states ("No courses available")

**Lesson Experience:**
- [ ] Lesson viewer interface
- [ ] Lesson form (all tabs: Basic Info, Additional Content, Quiz)
- [ ] Progress indicators
- [ ] Navigation buttons
- [ ] Video controls
- [ ] Quiz questions and feedback

**Profile Section:**
- [ ] Dashboard metrics and progress
- [ ] Settings form labels
- [ ] Payment history table
- [ ] Certificate display
- [ ] Notification preferences

**Admin Interface:**
- [ ] Admin dashboard cards
- [ ] User management table
- [ ] Course engagement metrics
- [ ] Settings form
- [ ] Analytics charts labels

**Error States:**
- [ ] 404 error page
- [ ] Generic error page
- [ ] Empty states (no lessons, no courses, etc.)
- [ ] Loading states
- [ ] Image fallback messages

#### Dynamic Content Formatting
**Numbers:**
- [ ] English: 1,234.56 (comma separator)
- [ ] Romanian: 1.234,56 (period separator)

**Currency:**
- [ ] English: $99.99
- [ ] Romanian: 99,99 RON

**Dates:**
- [ ] English: December 25, 2024
- [ ] Romanian: 25 decembrie 2024

**Pluralization:**
- [ ] Test with 0, 1, and multiple items
- [ ] Verify correct plural forms in Romanian

---

### 2. Automated Testing with Playwright

#### Test Suite Structure
```typescript
// tests/i18n/language-switching.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('should switch to Romanian and update all content', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify initial English content
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Click Romanian language button
    await page.click('[aria-label="Switch to Romanian"]');
    await page.waitForLoadState('networkidle');
    
    // Verify Romanian content
    await expect(page.locator('h1')).toContainText('Bun venit');
    
    // Verify URL unchanged
    expect(page.url()).toBe('http://localhost:3000/');
    
    // Verify cookie set
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find(c => c.name === 'locale');
    expect(localeCookie?.value).toBe('ro');
  });

  test('should persist language preference across sessions', async ({ page }) => {
    // Set Romanian cookie
    await page.context().addCookies([
      { name: 'locale', value: 'ro', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('http://localhost:3000');
    
    // Verify Romanian content loads
    await expect(page.locator('h1')).toContainText('Bun venit');
  });
});
```

#### Coverage Tests
```typescript
// tests/i18n/translation-coverage.spec.ts
test.describe('Translation Coverage', () => {
  test('should have no hardcoded English text', async ({ page }) => {
    // Set Romanian locale
    await page.context().addCookies([
      { name: 'locale', value: 'ro', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('http://localhost:3000');
    
    // Get all text content
    const bodyText = await page.locator('body').innerText();
    
    // Check for common English words that should be translated
    const englishWords = ['Welcome', 'Login', 'Sign Up', 'Continue', 'Loading'];
    
    for (const word of englishWords) {
      expect(bodyText).not.toContain(word);
    }
  });
});
```

#### Dynamic Content Tests
```typescript
// tests/i18n/formatting.spec.ts
test.describe('Dynamic Content Formatting', () => {
  test('should format numbers correctly in Romanian', async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'ro', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('http://localhost:3000/courses/pricing');
    
    // Verify Romanian number format (period as thousands separator)
    await expect(page.locator('[data-testid="course-price"]'))
      .toContainText('1.234,56');
  });

  test('should format dates correctly in Romanian', async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'ro', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('http://localhost:3000/profile');
    
    // Verify Romanian date format
    await expect(page.locator('[data-testid="enrollment-date"]'))
      .toMatch(/\d+ (ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie) \d{4}/);
  });
});
```

---

### 3. Translation Key Validation

#### Missing Keys Detection
```bash
# Run the app with Romanian locale and check console for warnings
# Missing keys will show: "Missing translation: domain.section.key"

# Search for hardcoded text patterns
grep -r "className.*>[A-Z][a-zA-Z\s]{5,}<" components/ app/

# Verify all useTranslations calls
grep -r "useTranslations(" components/ app/ | wc -l
```

#### Translation File Verification
```typescript
// scripts/verify-translations.ts
import fs from 'fs';
import path from 'path';

const domains = ['common', 'auth', 'courses', 'lessons', 'profile', 'admin', 'home'];
const locales = ['en', 'ro'];

for (const domain of domains) {
  const enKeys = loadKeys(`./messages/en/${domain}.json`);
  const roKeys = loadKeys(`./messages/ro/${domain}.json`);
  
  // Check for missing keys
  const missingInRo = enKeys.filter(k => !roKeys.includes(k));
  const extraInRo = roKeys.filter(k => !enKeys.includes(k));
  
  if (missingInRo.length > 0) {
    console.error(`❌ ${domain}: Missing Romanian keys:`, missingInRo);
  }
  
  if (extraInRo.length > 0) {
    console.warn(`⚠️ ${domain}: Extra Romanian keys:`, extraInRo);
  }
  
  if (missingInRo.length === 0 && extraInRo.length === 0) {
    console.log(`✅ ${domain}: Perfect synchronization`);
  }
}
```

---

### 4. Accessibility Testing

#### ARIA Labels and Screen Readers
- [ ] Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Verify all buttons have translated aria-label attributes
- [ ] Test form field labels in both languages
- [ ] Verify error messages are announced correctly
- [ ] Test navigation landmarks with translated labels

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test keyboard shortcuts work in both languages
- [ ] Verify modal dialogs have translated close buttons

---

### 5. Performance Testing

#### Load Time Comparison
```typescript
// Measure translation file loading impact
test('should load translations within performance budget', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(3000); // 3 second budget
});
```

#### Bundle Size Analysis
```bash
# Check translation file sizes
du -sh messages/en/*.json
du -sh messages/ro/*.json

# Should all be < 50KB each
```

---

## 🐛 Edge Cases & Known Issues

### Edge Cases to Test
1. **Long Romanian Text**: Some Romanian translations are 20-30% longer
   - Test responsive layouts don't break
   - Verify overflow handling works

2. **Special Characters**: Romanian uses ă, â, î, ș, ț
   - Verify proper UTF-8 encoding
   - Test search functionality with diacritics

3. **Pluralization**: Romanian has complex plural rules
   - Test with 0, 1, 2-19, 20+ items
   - Verify correct forms: "1 curs", "2 cursuri", "21 de cursuri"

4. **Number Formatting**: Romanian uses comma for decimals
   - Test financial calculations display correctly
   - Verify sorting works with Romanian number format

5. **Date Edge Cases**:
   - Test month boundaries
   - Verify timezone handling
   - Test past vs. future date displays

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

---

## ✅ Acceptance Criteria

A complete and successful i18n implementation must meet:

1. **Translation Coverage**: 100% of user-visible text translated
2. **No URL Routing**: Zero instances of `/en/` or `/ro/` in URLs
3. **Cookie Persistence**: Language preference survives browser restart
4. **Instant Switching**: < 100ms to switch languages (page reload time)
5. **Perfect Synchronization**: EN and RO files have identical key structures
6. **No Console Errors**: Zero "missing translation" warnings
7. **Accessibility**: All ARIA labels and alt text translated
8. **Performance**: < 5% impact on page load times
9. **Layout Integrity**: No UI breaks from text length differences
10. **Dynamic Formatting**: Numbers, dates, currency format correctly

---

## 📊 Test Results Template

### Test Execution Summary
| Test Category | Tests Run | Passed | Failed | Coverage |
|--------------|-----------|--------|--------|----------|
| Manual UI Testing | TBD | TBD | TBD | TBD% |
| Playwright E2E | TBD | TBD | TBD | TBD% |
| Translation Keys | TBD | TBD | TBD | TBD% |
| Accessibility | TBD | TBD | TBD | TBD% |
| Performance | TBD | TBD | TBD | TBD% |

### Known Issues
| Issue | Severity | Component | Status | Notes |
|-------|----------|-----------|--------|-------|
| - | - | - | - | - |

### Sign-Off
- [ ] Developer tested and verified
- [ ] QA team approved
- [ ] Product owner approved
- [ ] Native Romanian speaker verified translations
- [ ] Accessibility specialist approved
- [ ] Ready for production deployment

---

**Next Steps**: Execute this testing plan systematically, document results, and address any issues before final deployment.

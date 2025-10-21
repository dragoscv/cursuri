# 🧪 i18n Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the cookie-based i18n implementation across all migrated pages and components.

## 🎯 Cookie-Based Locale Switching Test

### Architecture Verification
- ✅ **No URL routing**: Locale is NOT in the URL path
- ✅ **Cookie-based**: Locale stored in `NEXT_LOCALE` cookie
- ✅ **Instant switching**: No page reload required
- ✅ **Persistence**: Locale persists across sessions
- ✅ **Default**: Defaults to 'en' for new visitors

### Test Procedure
1. Open browser DevTools → Application → Cookies
2. Verify `NEXT_LOCALE` cookie exists
3. Use language switcher (EN/RO buttons)
4. Verify instant UI update without page reload
5. Verify cookie value changes
6. Refresh page - verify locale persists
7. Clear cookies - verify defaults to 'en'

## 📋 Page-by-Page Testing

### ✅ Profile Pages (100% Migrated)

#### 1. Profile Settings (`/profile/settings`)
**Migrated Strings**: 15+ strings
- [ ] Password validation messages (EN/RO)
  - "Password Too Weak" → "Parolă Prea Slabă"
  - "Password does not meet security requirements" → Romanian translation
- [ ] Notification descriptions (7 notifications)
  - "Course Updates" → "Actualizări Cursuri"
  - "Get notified when courses you're enrolled in are updated" → Romanian description
  - "Marketing Emails" → "Email-uri Marketing"
  - "Receive promotions and special offers" → Romanian description
- [ ] Test all notification toggle descriptions switch language
- [ ] Verify form validation messages appear in correct language

**Test Actions**:
1. Switch to RO → All labels and descriptions should be in Romanian
2. Try weak password → Error message in Romanian
3. Switch to EN → All text instantly changes to English
4. Refresh page → Language persists

#### 2. Profile Payments (`/profile/payments`)
**Migrated Strings**: 3 strings
- [ ] Search placeholder
  - "Search payments" → Romanian equivalent
- [ ] Sort options
  - "Oldest First" → "Cele Mai Vechi"
  - "Newest First" → "Cele Mai Noi"

**Test Actions**:
1. Switch to RO → Search box and sort button text in Romanian
2. Click sort button → Verify both options are in Romanian
3. Switch to EN → Instant switch to English

#### 3. Profile Certificates (`/profile/certificates`)
**Migrated Strings**: 5 strings
- [ ] Error messages
  - "Failed to generate certificate" → Romanian translation
  - "Could not download certificate. Please try again." → Romanian translation
- [ ] Empty state
  - "No certificates yet" → Romanian translation
  - Description text → Romanian translation
- [ ] Action buttons
  - "Browse courses" → Romanian translation

**Test Actions**:
1. If no certificates: Verify empty state text in both languages
2. If certificates exist: Try download → Verify error messages in correct language
3. Switch languages → All text updates instantly

### ✅ Legal Pages (100% Migrated)

#### 4. GDPR Page (`/gdpr`)
**Migrated Strings**: 2 arrays with 12 items total
- [ ] Processing Purposes (9 items)
  - "To create and manage your account" → Romanian translation
  - "To provide and manage our courses and services" → Romanian translation
  - All 9 items should render correctly in both languages
- [ ] International Transfers Safeguards (3 items)
  - "Using Standard Contractual Clauses approved by the European Commission" → Romanian
  - All 3 items should render correctly in both languages

**Test Actions**:
1. Navigate to GDPR page
2. Scroll to "6. Purposes of Processing" section
3. Switch to RO → Verify all 9 list items are in Romanian
4. Scroll to "9. International Transfers" section
5. Switch to RO → Verify all 3 list items are in Romanian
6. Switch back to EN → Verify instant update

### ✅ Course Error Pages (100% Migrated)

#### 5. Course/Lesson Errors (`/courses/[id]/lessons/[id]`)
**Migrated Strings**: 6 strings
- [ ] Course not found
  - "Course Not Found" → Romanian translation
  - "The course you're looking for doesn't exist." → Romanian translation
  - "Browse Courses" → Romanian translation
- [ ] Lesson not found
  - "Lesson Not Found" → Romanian translation
  - "The lesson you're looking for doesn't exist..." → Romanian translation
  - "Return to Course" → Romanian translation

**Test Actions**:
1. Try accessing invalid course URL
2. Verify error page displays in correct language
3. Switch language → Error messages update
4. Try invalid lesson URL
5. Verify lesson error messages in both languages

## 🔧 Component Testing

### ✅ Admin Components (100% Migrated)

#### 6. Batch Operations (`components/Admin/BatchOperations.tsx`)
**Migrated Strings**: 5 action labels
- [ ] Action dropdown options
  - "Update Status" → "Actualizează Status"
  - "Change Category" → "Schimbă Categoria"
  - "Change Visibility" → "Schimbă Vizibilitatea"
  - "Update Price" → "Actualizează Prețul"
  - "Delete" → "Șterge"

**Test Actions**:
1. Go to admin courses page
2. Select multiple courses (if available)
3. Open batch actions dropdown
4. Switch to RO → All actions in Romanian
5. Switch to EN → All actions in English

#### 7. Role Management (`components/Admin/AdminRoleManagement.tsx`)
**Migrated Strings**: 4 strings
- [ ] Role names
  - "Super Admin" → "Super Administrator"
  - "Admin" → "Administrator"
  - "User" → "Utilizator"
- [ ] Permission message
  - "You don't have permission to manage user roles." → Romanian translation

**Test Actions**:
1. Access role management (if authorized)
2. Switch language → Verify role names update
3. If not authorized → Verify no permission message in both languages

#### 8. User Management (`components/Admin/EnhancedUserManagement.tsx`)
**Migrated Strings**: 5 strings
- [ ] Placeholders
  - "Display Name" → "Nume Afișat"
  - "User bio" → "Biografie utilizator"
- [ ] Tab labels
  - "Admin Notes" → "Note Administrator"
  - "Activity Log" → "Istoric Activitate"
- [ ] Enrollment source
  - "Admin assignment" → "Atribuire administrator"
  - "Self purchase" → "Achiziție proprie"

**Test Actions**:
1. Open user details modal
2. Switch to RO → Verify all tabs are in Romanian
3. Edit user → Verify placeholder text in Romanian
4. Check enrollments → Verify source text in Romanian

### ✅ Course Components (100% Migrated)

#### 9. Add/Edit Course Form (`components/Course/AddCourse.tsx`)
**Migrated Strings**: 10 strings
- [ ] Page title
  - "Edit Course" / "Create New Course" → Romanian translations
- [ ] Form labels
  - "Estimated Duration" → "Durată Estimată"
  - "Repository URL" → "URL Repository"
  - "Difficulty Level" → "Nivel Dificultate"
  - "Course Price" → "Preț Curs"
  - "Price Amount" → "Sumă Preț"
- [ ] Button text
  - "Creating Price..." → "Se Creează Preț..."
  - "Create Price in Stripe" → "Creează Preț în Stripe"
  - "Update Course" / "Create Course" → Romanian translations

**Test Actions**:
1. Navigate to add course page (admin)
2. Switch to RO → Verify page title in Romanian
3. Check all form labels → All in Romanian
4. Try creating custom price → Button text in Romanian
5. Switch to EN → Instant update to English

#### 10. Captions Section (`components/Course/CaptionsSection.tsx`)
**Migrated Strings**: 3 strings
- [ ] No content message
  - "No content available" → "Fără conținut disponibil"
- [ ] Button states
  - "Processing..." → "Se procesează..."
  - "Regenerate Captions" → "Regenerează Subtitrări"

**Test Actions**:
1. Open lesson edit with captions
2. If no captions → Verify empty message in both languages
3. Click regenerate → Verify button text changes in both languages
4. While processing → Verify "Processing..." in correct language

#### 11. Course Content (`components/Course/CourseContent.tsx`)
**Migrated Strings**: 1 string
- [ ] Unknown course fallback
  - "Unknown Course" → "Curs Necunoscut"

**Test Actions**:
1. Check course content with missing course data
2. Verify fallback text in both languages

#### 12. Course Detail (`components/Course/CourseDetail.tsx`)
**Migrated Strings**: 3 strings
- [ ] Fallback strings
  - "No description available" → "Fără descriere disponibilă"
  - "Cursuri Instructor" → "Instructor Cursuri"
  - "Unnamed Lesson" → "Lecție Fără Nume"

**Test Actions**:
1. View course with missing description
2. Verify fallback text in both languages
3. Check lessons with missing names
4. Verify "Unnamed Lesson" in correct language

## 🔍 Advanced Testing

### Cookie Persistence Test
```
Test Steps:
1. Set locale to RO
2. Navigate through 5+ pages
3. Verify all pages remain in RO
4. Close browser completely
5. Reopen browser and navigate to site
6. Verify locale is still RO
7. Clear cookies
8. Verify defaults to EN
```

### Concurrent Session Test
```
Test Steps:
1. Open site in Browser 1, set to EN
2. Open site in Browser 2 (incognito), set to RO
3. Navigate both browsers to same pages
4. Verify each maintains its own locale
5. Verify cookie isolation between sessions
```

### Language Switcher Test
```
Test Steps:
1. Navigate to any page
2. Click language switcher (EN → RO)
3. Verify instant update (< 100ms)
4. Verify NO page reload
5. Verify NO URL change
6. Click switcher (RO → EN)
7. Verify instant switch back
```

### Translation Key Coverage Test
```
Pages to check:
- Profile: settings, payments, certificates ✅
- Legal: GDPR ✅
- Courses: error pages ✅
- Admin: batch ops, roles, users ✅
- Course: add/edit, captions, content, detail ✅

For each page:
1. Switch to RO
2. Inspect page for English text (should find none)
3. Open DevTools console
4. Check for translation key errors (should be none)
5. Switch to EN
6. Verify all text is English
```

## 📊 Test Results Template

```markdown
### Test Session: [Date/Time]
**Tester**: [Name]
**Browser**: [Chrome/Firefox/Safari] [Version]
**OS**: [Windows/Mac/Linux]

#### Results:
- Profile Pages: ✅ PASS / ❌ FAIL
  - Settings: ✅
  - Payments: ✅
  - Certificates: ✅
- Legal Pages: ✅ PASS / ❌ FAIL
  - GDPR: ✅
- Course Errors: ✅ PASS / ❌ FAIL
- Admin Components: ✅ PASS / ❌ FAIL
- Course Components: ✅ PASS / ❌ FAIL

#### Issues Found:
1. [Issue description]
2. [Issue description]

#### Notes:
- [Any additional observations]
```

## 🎯 Success Criteria

### Must Pass:
✅ All pages switch instantly (< 100ms)  
✅ No English text visible when in RO mode  
✅ No Romanian text visible when in EN mode  
✅ Cookie persists across page navigations  
✅ Cookie persists across browser sessions  
✅ No console errors for missing translation keys  
✅ No URL changes when switching locale  
✅ All migrated components render correctly in both languages

### Expected Behavior:
- **Instant switching**: No loading spinners or delays
- **No flicker**: Smooth transition between languages
- **Proper diacritics**: Romanian text displays ț, ș, ă, â, î correctly
- **Consistent UX**: All UI elements maintain layout in both languages
- **Error handling**: Graceful fallback if translation missing

## 📝 Testing Notes

### Common Issues to Watch For:
1. **Missing translations**: Check console for translation key warnings
2. **Hardcoded strings**: Look for English text that doesn't switch
3. **Cookie issues**: Verify cookie is set and readable
4. **Cache problems**: Clear cache if translations don't update
5. **Dynamic content**: Ensure user-generated content doesn't break layout

### Browser Compatibility:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

### Device Testing:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

---

**Status**: Ready for comprehensive testing  
**Coverage**: 100% of migrated pages and components  
**Total Test Cases**: 50+ across 12 components/pages

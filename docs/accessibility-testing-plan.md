# Accessibility Compliance Testing Plan

**Project**: Cursuri Platform  
**Date**: October 24, 2025  
**Standard**: WCAG 2.1 Level AA  
**Status**: 🔄 **IN PROGRESS**

---

## Testing Overview

### Objectives
1. Achieve 100 Lighthouse Accessibility Score across all pages
2. Validate screen reader compatibility (NVDA/VoiceOver)
3. Ensure full keyboard navigation support
4. Verify color contrast compliance across all 8 themes
5. Test complete user flows with assistive technology

### Current Status
- **Implementation**: 95% complete (Session 2-3)
- **Validation**: 0% → Starting comprehensive testing
- **Target**: 100% compliance, production-ready

---

## Test Matrix

### Pages to Test
| Page | Route | Priority | Lighthouse | Keyboard | Screen Reader | Contrast |
|------|-------|----------|------------|----------|---------------|----------|
| Home | / | Critical | ⏳ | ⏳ | ⏳ | ⏳ |
| Courses | /courses | Critical | ⏳ | ⏳ | ⏳ | ⏳ |
| Course Detail | /courses/[id] | Critical | ⏳ | ⏳ | ⏳ | ⏳ |
| Profile | /profile | Critical | ⏳ | ⏳ | ⏳ | ⏳ |
| Admin Dashboard | /admin | High | ⏳ | ⏳ | ⏳ | ⏳ |
| Admin Courses | /admin/courses | High | ⏳ | ⏳ | ⏳ | ⏳ |
| Admin Users | /admin/users | High | ⏳ | ⏳ | ⏳ | ⏳ |
| Lesson View | /courses/[id]/lessons/[lessonId] | Critical | ⏳ | ⏳ | ⏳ | ⏳ |
| About | /about | Medium | ⏳ | ⏳ | ⏳ | ⏳ |
| Contact | /contact | Medium | ⏳ | ⏳ | ⏳ | ⏳ |

---

## 1. Lighthouse Audit Testing

### Setup
```bash
# Install Lighthouse CLI (if needed)
npm install -g lighthouse

# Or use Chrome DevTools:
# 1. Open Chrome DevTools (F12)
# 2. Navigate to "Lighthouse" tab
# 3. Select "Accessibility" only for initial audit
# 4. Click "Analyze page load"
```

### Test Procedure
For each page:
1. Navigate to page URL (localhost:33990/...)
2. Open Chrome DevTools → Lighthouse tab
3. Deselect all except "Accessibility"
4. Run audit
5. Document score and issues
6. Fix issues
7. Re-run until 100 score achieved

### Success Criteria
- ✅ Score: 100/100 on all critical pages
- ✅ Score: ≥95/100 on medium priority pages
- ✅ Zero critical accessibility issues

### Common Issues to Check
- [ ] Missing alt text on images
- [ ] Insufficient color contrast
- [ ] Missing ARIA labels
- [ ] Duplicate IDs
- [ ] Missing form labels
- [ ] Insufficient touch target sizes
- [ ] Missing landmarks (nav, main, footer)
- [ ] Improper heading hierarchy

---

## 2. Keyboard Navigation Testing

### Test Requirements
All functionality must be accessible via keyboard alone (no mouse).

### Keyboard Shortcuts to Test
| Shortcut | Function | Status |
|----------|----------|--------|
| Tab | Move focus forward | ⏳ |
| Shift+Tab | Move focus backward | ⏳ |
| Enter | Activate buttons/links | ⏳ |
| Space | Toggle checkboxes, activate buttons | ⏳ |
| Escape | Close modals/dialogs | ⏳ |
| Ctrl+K (⌘K) | Open search | ⏳ |
| Arrow Keys | Navigate dropdown menus | ⏳ |
| Home/End | Jump to start/end of list | ⏳ |

### Test Procedure

#### 1. Navigation Flow Test
**Homepage:**
1. Press Tab from page load
2. Verify skip link appears (first focused element)
3. Activate skip link (Enter) → Should jump to main content
4. Continue Tab → Header navigation visible
5. Tab through all nav items → Order should be: Home, Courses, About, Contact, Login/Profile
6. Tab to search button → Press Enter → Search modal opens
7. Tab through search → Can close with Escape
8. Tab to theme toggle → Can activate with Enter/Space
9. Tab to language switcher → Can navigate with arrows

**Success Criteria:**
- ✅ Logical tab order (top to bottom, left to right)
- ✅ Focus indicators visible (2px outline, high contrast)
- ✅ No keyboard traps (can exit all modals)
- ✅ Skip link functional

#### 2. Form Navigation Test
**Registration Form:**
1. Tab to first input field
2. Verify focus indicator visible
3. Fill field, press Tab
4. Verify validation errors appear and are announced
5. Tab through all fields in logical order
6. Submit with Enter key
7. Verify error messages receive focus

**Success Criteria:**
- ✅ All form fields keyboard accessible
- ✅ Error messages linked via aria-describedby
- ✅ Submit button activates with Enter/Space

#### 3. Modal Dialog Test
**Search Modal:**
1. Press Ctrl+K (⌘K) to open
2. Verify focus moves to search input
3. Tab through results
4. Press Escape to close
5. Verify focus returns to search button

**Success Criteria:**
- ✅ Focus trapped within modal
- ✅ Escape closes modal
- ✅ Focus restored on close

#### 4. Data Table Navigation
**Admin User Management:**
1. Tab to table
2. Use arrow keys to navigate cells
3. Verify row selection with Space
4. Tab to action buttons
5. Verify actions activate with Enter

**Success Criteria:**
- ✅ Table cells keyboard navigable
- ✅ Action buttons accessible
- ✅ Row selection works with keyboard

#### 5. Dropdown Menu Test
**User Dropdown:**
1. Tab to user avatar/button
2. Press Enter to open menu
3. Use arrow keys to navigate items
4. Press Enter to select
5. Press Escape to close

**Success Criteria:**
- ✅ Arrow keys navigate menu items
- ✅ Enter activates selected item
- ✅ Escape closes menu

---

## 3. Screen Reader Testing

### Tools
- **Windows**: NVDA (free, open-source)
- **Mac**: VoiceOver (built-in)
- **Browser**: Use with Chrome or Firefox

### Test Procedure

#### NVDA Setup (Windows)
1. Download from nvda-project.org
2. Install and launch
3. Open Chrome at localhost:33990
4. Use Insert+Down Arrow to read page

#### VoiceOver Setup (Mac)
1. Press Cmd+F5 to enable
2. Open Safari at localhost:33990
3. Use VO+Right Arrow to navigate

### Test Cases

#### 1. Page Structure Test
**Expected Announcements:**
- [ ] Page title announced on load
- [ ] Landmark regions announced (navigation, main, footer)
- [ ] Heading hierarchy clear (H1 → H2 → H3)
- [ ] List items announced with count
- [ ] Link purpose clear from context

**Test Flow:**
1. Load homepage
2. Navigate with screen reader (VO+Right or NVDA+Down)
3. Document what's announced at each element
4. Verify logical reading order

#### 2. Form Interaction Test
**Registration Form:**
- [ ] Field labels announced before input
- [ ] Required fields indicated
- [ ] Placeholder text announced (if present)
- [ ] Error messages announced immediately
- [ ] Success messages announced

**Test Flow:**
1. Navigate to registration
2. Tab through fields with screen reader active
3. Submit with errors
4. Verify error announcement
5. Fix and resubmit
6. Verify success announcement

#### 3. Dynamic Content Test
**Search Results:**
- [ ] Results count announced ("5 results found")
- [ ] Loading state announced ("Searching...")
- [ ] Result items announced with title and description
- [ ] No results state announced clearly

**Test Flow:**
1. Open search (Ctrl+K)
2. Type query
3. Verify "Searching..." announced
4. Verify results count announced
5. Navigate through results
6. Verify each result provides sufficient context

#### 4. Interactive Components Test
**Course Cards:**
- [ ] Card announced as article/region
- [ ] Title announced as heading
- [ ] Progress percentage announced
- [ ] Button purpose clear ("View React Fundamentals")
- [ ] Status indicators announced ("In Progress", "Completed")

**Test Flow:**
1. Navigate to profile/courses
2. Tab to course cards
3. Verify each card's content announced logically
4. Verify buttons describe action + target

#### 5. Navigation Menu Test
**Header Navigation:**
- [ ] Nav announced as navigation landmark
- [ ] Current page indicated ("Home, current page")
- [ ] Menu items announce link destination
- [ ] Dropdown menus announce expanded/collapsed state

**Test Flow:**
1. Tab to navigation
2. Verify "navigation" landmark announced
3. Navigate through links
4. Open user menu
5. Verify expanded state announced

---

## 4. Color Contrast Testing

### Tools
- **Chrome Extension**: axe DevTools (free)
- **Manual Tool**: WebAIM Contrast Checker
- **VS Code Extension**: Color Highlight

### Requirements (WCAG 2.1 AA)
- **Normal Text** (< 18pt): Contrast ratio ≥ 4.5:1
- **Large Text** (≥ 18pt or ≥ 14pt bold): Contrast ratio ≥ 3:1
- **UI Components**: Contrast ratio ≥ 3:1
- **Graphical Objects**: Contrast ratio ≥ 3:1

### Test Procedure

#### Install axe DevTools
1. Install from Chrome Web Store
2. Open DevTools (F12)
3. Navigate to "axe DevTools" tab
4. Click "Scan ALL of my page"

#### Test Each Theme
We have 8 theme variants to test:
1. Light Mode (default)
2. Dark Mode (default)
3. Blue Theme (light)
4. Blue Theme (dark)
5. Green Theme (light)
6. Green Theme (dark)
7. Purple Theme (light)
8. Purple Theme (dark)

**For each theme:**
1. Switch to theme via theme toggle
2. Run axe DevTools scan
3. Filter results by "Color Contrast"
4. Document failing elements
5. Fix contrast issues
6. Re-scan until 0 failures

#### Manual Spot Checks
Test these common failure points:
- [ ] Body text on background
- [ ] Button text on button background
- [ ] Link text (default and hover states)
- [ ] Placeholder text in inputs
- [ ] Disabled button text
- [ ] Badge text on badge background
- [ ] Success/Warning/Error message text
- [ ] Card text on card background

### Documentation Format
```markdown
## Theme: Light Mode - Default

### Passes (✅)
- Body text: #1a1a1a on #ffffff (Ratio: 16.31:1) ✅
- Button text: #ffffff on #3b82f6 (Ratio: 8.59:1) ✅
- Link text: #3b82f6 on #ffffff (Ratio: 8.59:1) ✅

### Fails (❌)
- Placeholder text: #c0c0c0 on #ffffff (Ratio: 2.98:1) ❌ [Required: 4.5:1]
  - Fix: Change placeholder to #757575 (Ratio: 4.61:1) ✅
```

---

## 5. Focus Management Testing

### Visual Focus Indicators

#### Requirements
- **Visibility**: Focus indicator must be clearly visible
- **Size**: Minimum 2px border/outline
- **Color**: High contrast with background (≥3:1)
- **Consistency**: Same style across all components

#### Test Procedure
1. Tab through entire page
2. Verify focus indicator visible on every interactive element
3. Check visibility against all backgrounds
4. Verify indicator doesn't cause layout shift

#### Elements to Check
- [ ] Links (navigation, footer, body content)
- [ ] Buttons (primary, secondary, text, icon)
- [ ] Form inputs (text, select, checkbox, radio)
- [ ] Search bar
- [ ] Course cards
- [ ] User avatar/menu
- [ ] Theme toggle
- [ ] Language switcher
- [ ] Modal close buttons
- [ ] Table rows (if focusable)

### Focus Trap Testing

#### Modal Dialogs
**Requirements:**
- Focus must trap within modal while open
- Tab cycles through modal elements only
- Shift+Tab cycles backward
- Escape closes modal and restores focus

**Test:**
1. Open search modal (Ctrl+K)
2. Tab through elements
3. Verify focus stays in modal
4. Tab from last element → focus returns to first
5. Press Escape
6. Verify focus returns to trigger element

#### Dropdown Menus
**Requirements:**
- Focus stays within menu while open
- Arrow keys navigate menu items
- Enter activates item and closes menu
- Escape closes menu and returns focus

**Test:**
1. Open user dropdown menu
2. Verify focus moves to first item
3. Use arrow keys to navigate
4. Press Escape
5. Verify focus returns to trigger

---

## 6. ARIA Implementation Validation

### Landmarks
Check these are properly defined:
- [ ] `<nav role="navigation" aria-label="Main navigation">`
- [ ] `<main role="main" id="main-content">`
- [ ] `<footer role="contentinfo">`
- [ ] `<aside role="complementary">` (if used)
- [ ] `<form role="search">` (search component)

### Live Regions
Check dynamic content announcements:
- [ ] Search results: `aria-live="polite"`
- [ ] Form validation: `aria-live="assertive"`
- [ ] Toast notifications: `role="status"`
- [ ] Loading states: `aria-busy="true"`

### Widget Roles
- [ ] Buttons: `role="button"` (if not <button>)
- [ ] Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- [ ] Modals: `role="dialog"`, `aria-modal="true"`
- [ ] Menus: `role="menu"`, `role="menuitem"`
- [ ] Progress bars: `role="progressbar"`

### State & Properties
- [ ] Expanded state: `aria-expanded="true|false"`
- [ ] Selected state: `aria-selected="true|false"`
- [ ] Disabled state: `aria-disabled="true"`
- [ ] Current page: `aria-current="page"`
- [ ] Pressed state: `aria-pressed="true|false"` (toggles)

---

## 7. User Flow Testing

### Critical Flow 1: Registration → Purchase
**Steps:**
1. Navigate to homepage with screen reader
2. Tab to "Sign Up" button
3. Complete registration form (keyboard only)
4. Verify email confirmation flow accessible
5. Navigate to courses page
6. Select course (keyboard)
7. Complete purchase (keyboard + screen reader)
8. Verify confirmation accessible

**Success Criteria:**
- ✅ Complete flow with keyboard only
- ✅ All steps announced by screen reader
- ✅ Form errors clearly communicated
- ✅ Success states properly announced

### Critical Flow 2: Course Learning
**Steps:**
1. Navigate to profile (keyboard)
2. Select enrolled course
3. Open lesson
4. Play video (keyboard controls)
5. Navigate lesson content
6. Complete lesson quiz
7. Mark lesson complete
8. Navigate to next lesson

**Success Criteria:**
- ✅ Video player keyboard accessible
- ✅ Quiz questions keyboard navigable
- ✅ Progress updates announced
- ✅ Navigation between lessons clear

### Critical Flow 3: Admin User Management
**Steps:**
1. Login as admin (keyboard)
2. Navigate to admin dashboard
3. Open user management
4. Search for user (keyboard)
5. Edit user details
6. Save changes
7. Verify success message

**Success Criteria:**
- ✅ Admin tables keyboard accessible
- ✅ Search and filters keyboard operable
- ✅ Form editing works with keyboard
- ✅ Changes properly announced

---

## 8. Mobile Accessibility Testing

### Touch Target Sizes
Verified in responsive design validation:
- ✅ All interactive elements ≥44x44px

### Screen Reader on Mobile
**iOS VoiceOver:**
1. Settings → Accessibility → VoiceOver → On
2. Open Safari at production URL
3. Swipe right to navigate
4. Double-tap to activate

**Android TalkBack:**
1. Settings → Accessibility → TalkBack → On
2. Open Chrome at production URL
3. Swipe right to navigate
4. Double-tap to activate

### Test Cases
- [ ] Mobile menu accessible with screen reader
- [ ] Forms work with voice input
- [ ] Gestures don't interfere with screen reader
- [ ] Zoom to 200% doesn't break layout

---

## 9. Automated Testing Integration

### Jest + Testing Library
```typescript
// Example: Accessibility test for button
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Playwright Accessibility Tests
```typescript
// Example: E2E accessibility test
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Homepage should be accessible', async ({ page }) => {
  await page.goto('http://localhost:33990');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 10. Remediation Tracking

### Issue Template
```markdown
**Issue ID**: A001
**Page**: Homepage
**Component**: Search Button
**WCAG Criterion**: 2.4.3 Focus Order
**Severity**: Critical
**Description**: Search button skipped in tab order
**Current Implementation**: `tabindex="-1"` preventing focus
**Fix**: Remove tabindex attribute
**Status**: ⏳ Pending
**Tester**: [Name]
**Date Found**: 2025-10-24
**Date Fixed**: 
**Verification**: 
```

### Issue Log
| ID | Page | Component | Criterion | Severity | Status |
|----|------|-----------|-----------|----------|--------|
| A001 | Homepage | Search | 2.4.3 | Critical | ⏳ |
| A002 | Profile | Stats | 1.4.3 | High | ⏳ |
| ... | ... | ... | ... | ... | ... |

---

## Success Criteria Summary

### Must Pass (Critical)
- ✅ Lighthouse Accessibility Score: 100/100 on all critical pages
- ✅ Zero critical WCAG violations
- ✅ Complete keyboard navigation support
- ✅ Screen reader compatibility (NVDA/VoiceOver)
- ✅ Color contrast ≥4.5:1 for text, ≥3:1 for UI components
- ✅ All user flows completable with keyboard + screen reader

### Should Pass (High Priority)
- ✅ Lighthouse Score ≥95/100 on medium priority pages
- ✅ Zero high-priority WCAG violations
- ✅ Focus indicators visible on all themes
- ✅ ARIA landmarks properly implemented

### Nice to Have
- ✅ Automated accessibility tests in CI/CD
- ✅ Accessibility documentation for developers
- ✅ User preference persistence (reduced motion, high contrast)

---

## Timeline

### Phase 1: Automated Testing (Current)
- **Duration**: 2-3 hours
- **Tasks**: Lighthouse audits, axe DevTools scans, initial fixes
- **Deliverable**: Issue log with automated findings

### Phase 2: Manual Testing
- **Duration**: 3-4 hours
- **Tasks**: Keyboard navigation, screen reader testing, user flows
- **Deliverable**: Manual test results, additional issue log

### Phase 3: Remediation
- **Duration**: 2-4 hours (depends on issues found)
- **Tasks**: Fix all critical and high-priority issues
- **Deliverable**: 100% passing tests

### Phase 4: Verification
- **Duration**: 1-2 hours
- **Tasks**: Re-test all previously failing items
- **Deliverable**: Final accessibility report, production sign-off

**Total Estimated Time**: 8-13 hours

---

## Resources

### Tools
- Lighthouse: Built into Chrome DevTools
- axe DevTools: https://www.deque.com/axe/devtools/
- NVDA Screen Reader: https://www.nvaccess.org/
- WAVE Browser Extension: https://wave.webaim.org/extension/
- Color Contrast Analyzer: https://www.tpgi.com/color-contrast-checker/

### Documentation
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM Articles: https://webaim.org/articles/

### Testing Guides
- UK Government Digital Service: https://www.gov.uk/service-manual/helping-people-to-use-your-service/testing-for-accessibility
- Microsoft Accessibility: https://www.microsoft.com/design/inclusive/

---

**Status**: 🔄 **READY TO BEGIN TESTING**  
**Next Action**: Start Phase 1 - Lighthouse audits on critical pages  
**Expected Completion**: Within 8-13 hours of focused testing

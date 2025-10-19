# 🚀 Cursuri Project - Quick Start Guide
**Last Updated**: October 19, 2025  
**For**: AI Agents continuing development

---

## ⚡ 30-Second Overview

**What is it?**: Online course platform (Next.js 15 + Firebase + Stripe)  
**Status**: Production-ready, actively developed  
**Health**: 87/100 - TypeScript clean, tests need expansion  
**Port**: `http://localhost:33990`

---

## 🎯 Start Development (3 commands)

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:33990
```

---

## 📂 Critical Files to Know

```yaml
State Management: components/AppContext.tsx (1,837 lines - needs refactoring)
Type Definitions: types/index.d.ts (all TypeScript types)
Firebase Config: utils/firebase/firebase.config.ts
Root Layout: app/layout.tsx
Homepage: app/page.tsx

Configuration:
  - tsconfig.json (strict mode enabled)
  - next.config.js (Next.js config)
  - tailwind.config.ts (8 color schemes)
  - firebase.json (Firebase services)
```

---

## 🏗️ Architecture Quick Reference

### Tech Stack
```
Frontend: Next.js 15.2.4 + React 19 + TypeScript 5 (strict)
UI: @heroui/react + TailwindCSS 4.1.3 + Framer Motion
Backend: Firebase (Firestore, Auth, Storage)
Payments: Stripe via Firewand (local package)
AI: Azure Speech SDK (captions, transcriptions)
```

### Data Flow
```
User Action → Component → AppContext → Firebase
                              ↓
                        Local Cache
                              ↓
                        localStorage (persistence)
```

### State Management
```typescript
// Central hub: components/AppContext.tsx
const context = useContext(AppContext);
const { 
  user,              // Current user
  courses,           // All courses (cached)
  isAdmin,           // Admin status
  fetchCourseById,   // Fetch course
  openModal,         // Open modal
  showToast          // Show notification
} = context;
```

---

## 🔥 Common Tasks

### 1. Add a New Component
```bash
# Location: components/[Category]/[ComponentName].tsx
# Pattern: Functional component + TypeScript

import React from 'react';

interface MyComponentProps {
  // Define props with types
}

export default function MyComponent({ }: MyComponentProps) {
  return <div>Component</div>;
}
```

### 2. Add an API Route
```bash
# Location: app/api/[route-name]/route.ts
# Pattern: Next.js 15 App Router API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Process data
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### 3. Add a New Page
```bash
# Location: app/[page-name]/page.tsx
# Pattern: Server component by default

export default function PageName() {
  return (
    <div>
      <h1>Page Title</h1>
      {/* Content */}
    </div>
  );
}
```

### 4. Use Firebase
```typescript
import { firestoreDB } from '@/utils/firebase/firebase.config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Fetch collection
const coursesRef = collection(firestoreDB, 'courses');
const snapshot = await getDocs(coursesRef);

// Fetch document
const courseRef = doc(firestoreDB, 'courses', courseId);
const courseDoc = await getDoc(courseRef);
```

### 5. Run Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 🚨 Known Issues (Fix These!)

### 1. Test Suite (43 TypeScript errors)
**Location**: `__tests__/` directory  
**Impact**: Test suite cannot run  
**Priority**: HIGH  
**Status**: Production code is clean (0 errors)

**Fix**: Update test imports and mocks for refactored components

### 2. CI/CD Not Implemented
**Impact**: No automated testing/deployment  
**Priority**: HIGH  
**Action**: Set up GitHub Actions

### 3. AppContext.tsx Too Large (1,837 lines)
**Impact**: Maintainability  
**Priority**: MEDIUM  
**Solution**: Modular contexts already implemented but disabled  
**Location**: `components/contexts/modules/`

---

## 📋 Phase 2 Priorities (Recommended Next)

```yaml
1. Fix Test Suite:
   - Fix 43 TypeScript errors in __tests__/
   - Expand coverage from 45% to 80%
   - Add critical E2E tests

2. Implement CI/CD:
   - GitHub Actions workflow
   - Automated testing on PR
   - Automated Vercel deployment

3. Security Audit:
   - Review RBAC implementation
   - Add rate limiting
   - Implement security headers

4. Performance Optimization:
   - Convert images to Next.js Image
   - Code splitting for admin
   - Bundle analysis
```

---

## 🔐 Environment Variables

```env
# Required for Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Required for Azure Speech (captions)
NEXT_PUBLIC_AZURE_SPEECH_API_KEY=
NEXT_PUBLIC_AZURE_SPEECH_API_REGION=

# Stripe - managed by Firebase Extension
# Configure in Firebase Console, no env vars needed
```

---

## 📚 Documentation

**Full Analysis**: `.agent-state/PROJECT_ANALYSIS_2025-10-19.md`  
**Architecture**: `.agent-state/ARCHITECTURE_DIAGRAM.md`  
**TODO List**: `docs/TODO.md`  
**Migration Status**: `docs/MIGRATION_STATUS.md`  
**Audit Report**: `docs/COMPREHENSIVE_AUDIT_REPORT.md`

---

## 🎓 Learning Paths

### New to the Project?
1. Read: `README.md` (project overview)
2. Review: `.agent-state/PROJECT_ANALYSIS_2025-10-19.md` (comprehensive analysis)
3. Explore: `components/AppContext.tsx` (state management)
4. Check: `app/page.tsx` (homepage structure)

### Frontend Focus?
1. `components/ui/` - Reusable UI components
2. `tailwind.config.ts` - Theming system
3. `components/Course/` - Feature components

### Backend Focus?
1. `utils/firebase/` - Firebase integration
2. `app/api/` - API routes
3. `packages/firewand/` - Stripe integration

---

## ⚡ Pro Tips

1. **VS Code Tasks**: Use built-in tasks for common operations
   - Start Dev Server (default build task)
   - Build Project
   - Type Check
   - Lint

2. **TypeScript**: Strict mode enabled - all code must have proper types

3. **Testing**: Use `npm run test:watch` during development

4. **Firebase Emulators**: Optional for local testing without cloud
   ```bash
   firebase emulators:start
   ```

5. **Hot Reload**: React Fast Refresh enabled - changes appear instantly

---

## 🆘 Need Help?

**Issues?**
- Check `docs/` directory for detailed documentation
- Review `.agent-state/` for architecture context
- TypeScript errors? Run `npm run type-check`
- Tests failing? Check `__tests__/setup/` for mocks

**Common Errors**:
- Port 33990 in use? Kill process or change port in `package.json`
- Firebase auth issues? Check `firebase.json` configuration
- Build errors? Run `npm install` to update dependencies

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All TypeScript errors fixed (`npm run type-check`)
- [ ] ESLint passing (`npm run lint`)
- [ ] Tests passing (`npm test`)
- [ ] Test coverage > 80% (`npm run test:coverage`)
- [ ] Environment variables configured in Vercel
- [ ] Firebase rules reviewed and tested
- [ ] Security headers configured
- [ ] Performance audit completed (Lighthouse > 90)

---

**Quick Start prepared by**: GitHub Copilot Agent  
**Date**: October 19, 2025  
**Status**: Ready for agent handoff ✅

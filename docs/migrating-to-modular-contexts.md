# Migrating from AppContext to Modular Contexts

This guide provides practical examples and steps for migrating components from using the monolithic AppContext to the new modular context system.

## Why Migrate?

- **Performance**: Components only re-render when their specific context changes
- **Code organization**: Each context focuses on a specific domain
- **Type safety**: Better TypeScript types for each domain
- **Developer experience**: Easier to find and work with related functionality

## Step-by-Step Migration Guide

### Step 1: Identify Context Dependencies

Review your component to identify which parts of AppContext it uses. Common patterns:

```tsx
const context = useContext(AppContext);
const { user, courses, openModal } = context;
```

### Step 2: Replace Context Imports

Replace:

```tsx
import { useContext } from "react";
import { AppContext } from "@/components/AppContext";
```

With the specific context hooks:

```tsx
import { useAuth, useCourses, useModal } from "@/components/contexts/modules";
```

### Step 3: Replace Context Usage

Replace:

```tsx
// Old way
const context = useContext(AppContext);
const { user, isDark, openModal } = context;
```

With:

```tsx
// New way
const {
  state: { user },
} = useAuth();
const {
  state: { isDark },
  toggleTheme,
} = useTheme();
const { openModal } = useModal();
```

### Step 4: Update Function Calls

The functions provided by the contexts often have the same API, but they're now organized by domain.

### Step 5: Testing

Verify your component works correctly with the new contexts.

## Enhanced Auth Context Features

The new `authContext.tsx` includes enhanced user preference and onboarding features:

### User Preferences Management

```tsx
import { useAuth } from "@/components/contexts/modules";

function PreferencesComponent() {
  const {
    state: { preferences },
    saveUserPreferences,
  } = useAuth();

  const updateLanguage = async (language) => {
    await saveUserPreferences({ language });
  };

  return (
    <div>
      <p>Current language: {preferences?.language}</p>
      <button onClick={() => updateLanguage("en")}>English</button>
      <button onClick={() => updateLanguage("ro")}>Romanian</button>
    </div>
  );
}
```

### Onboarding Support

```tsx
import { useAuth, useModal } from "@/components/contexts/modules";

function UserDashboard() {
  const { checkOnboardingStatus, completeOnboarding } = useAuth();
  const { openModal } = useModal();

  useEffect(() => {
    if (!checkOnboardingStatus()) {
      openModal({
        id: "onboarding",
        isOpen: true,
        modalBody: <OnboardingModal />,
        isDismissable: false,
      });
    }
  }, [checkOnboardingStatus, openModal]);

  // You can also use the included hook
  // import { useOnboardingCheck } from '@/components/OnboardingModal/MigratedOnboardingModal';
  // useOnboardingCheck();

  return <div>Dashboard content...</div>;
}
```

## Theme and Color Scheme Management

The upgraded `themeContext.tsx` handles both theme (dark/light) and color scheme:

```tsx
import { useTheme } from "@/components/contexts/modules";

function ThemeSelector() {
  const {
    state: { isDark, colorScheme },
    toggleTheme,
    setColorScheme,
  } = useTheme();

  return (
    <div>
      <button onClick={toggleTheme}>
        {isDark ? "Switch to Light" : "Switch to Dark"}
      </button>

      <select
        value={colorScheme}
        onChange={(e) => setColorScheme(e.target.value)}
      >
        <option value="modern-purple">Modern Purple</option>
        <option value="black-white">Black & White</option>
        <option value="green-neon">Green Neon</option>
        {/* other color schemes */}
      </select>
    </div>
  );
}
```

## Migration Examples

### Example 1: Simple Component

**Before:**

```tsx
import React, { useContext } from "react";
import { AppContext } from "@/components/AppContext";

export function ThemeToggle() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Missing context value");

  const { isDark, toggleTheme } = context;

  return (
    <button onClick={toggleTheme}>
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}
```

**After:**

```tsx
import React from "react";
import { useTheme } from "@/components/contexts/modules";

export function ThemeToggle() {
  const {
    state: { isDark },
    toggleTheme,
  } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}
```

### Example 2: Complex Component

**Before:**

```tsx
import React, { useContext, useState } from "react";
import { AppContext } from "@/components/AppContext";

export function CourseCard({ courseId }) {
  const context = useContext(AppContext);
  if (!context) throw new Error("Missing context value");

  const { user, courses, openModal, purchaseCourse } = context;
  const [loading, setLoading] = useState(false);

  const course = courses?.[courseId];

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (!user) {
        openModal({
          id: "login",
          isOpen: true,
          modalBody: "login",
        });
        return;
      }

      await purchaseCourse(courseId);
      openModal({
        id: "success",
        isOpen: true,
        modalBody: "Purchase successful!",
      });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{course?.title}</h2>
      <p>{course?.description}</p>
      <button onClick={handlePurchase} disabled={loading}>
        {loading ? "Processing..." : "Purchase"}
      </button>
    </div>
  );
}
```

**After:**

```tsx
import React, { useState } from "react";
import { useAuth, useCourses, useModal } from "@/components/contexts/modules";

export function CourseCard({ courseId }) {
  const {
    state: { user },
  } = useAuth();
  const {
    state: { courses },
    purchaseCourse,
  } = useCourses();
  const { openModal } = useModal();

  const [loading, setLoading] = useState(false);

  const course = courses?.[courseId];

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (!user) {
        openModal({
          id: "login",
          isOpen: true,
          modalBody: "login",
        });
        return;
      }

      await purchaseCourse(courseId);
      openModal({
        id: "success",
        isOpen: true,
        modalBody: "Purchase successful!",
      });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{course?.title}</h2>
      <p>{course?.description}</p>
      <button onClick={handlePurchase} disabled={loading}>
        {loading ? "Processing..." : "Purchase"}
      </button>
    </div>
  );
}
```

## Using the Compatibility Layer

For components that are difficult to migrate immediately, you can use the compatibility layer:

```tsx
import { useCompatibilityContext } from "@/components/contexts/compatibilityLayer";

function LegacyComponent() {
  const { user, courses, openModal } = useCompatibilityContext();
  // Same API as the old AppContext
}
```

## Testing During Migration

- Use the TransitionProviders component to run both context systems in parallel
- Test components with both systems enabled
- Once a component is migrated, mark it in MIGRATION_CONFIG.MIGRATED_COMPONENTS

## Getting Help

If you encounter issues during migration, please:

1. Check the migration plan document in `/docs/app-context-modularization-plan.md`
2. Refer to each context module for documentation
3. Use the compatibility layer if needed

## Complete Reference

Here are all the available hooks from the modular context system:

| Domain         | Hook           | Key Properties/Functions                                                                                |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Authentication | `useAuth()`    | `state.user`, `state.profile`, `state.preferences`, `signIn`, `signUp`, `logOut`, `saveUserPreferences` |
| Theme          | `useTheme()`   | `state.isDark`, `state.colorScheme`, `toggleTheme`, `setColorScheme`                                    |
| Modal          | `useModal()`   | `state.modals`, `openModal`, `closeModal`, `updateModal`                                                |
| Courses        | `useCourses()` | `state.courses`, `fetchCourses`, `fetchCourseById`, `purchaseCourse`                                    |
| Lessons        | `useLessons()` | `state.lessons`, `fetchLessons`, `addLesson`, `updateLesson`                                            |
| Reviews        | `useReviews()` | `state.reviews`, `fetchReviews`, `addReview`, `updateReview`                                            |
| Admin          | `useAdmin()`   | `state.adminSettings`, `state.adminAnalytics`, `fetchAdminSettings`                                     |
| Cache          | `useCache()`   | `state.pendingRequests`, `isRequestPending`, `clearCache`                                               |

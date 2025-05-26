# AppContext Modularization - Transition Plan

## Overview

This document outlines the transition plan for migrating from the monolithic AppContext to a modular context system.

## Phases

### Phase 1: Prepare the New Context System

- ✅ Create the modular context structure
- ✅ Implement core contexts (Auth, Theme, Modal, Cache)
- ✅ Implement Courses context

### Phase 2: Additional Contexts (To Be Implemented)

- [ ] Implement Lessons context
- [ ] Implement Reviews context
- [ ] Implement Admin context
- [ ] Implement Progress/Achievement context

### Phase 3: Integration

- [ ] Create a compatibility layer to ensure existing components work with both old and new context
- [ ] Update the `useAppContext` hook to provide the same API as the old context
- [ ] Test the new context system with existing components

### Phase 4: Migration

- [ ] Update components to use the specific context hooks instead of the general AppContext
- [ ] Start with low-risk components (e.g., Theme-related, Auth-related)
- [ ] Progressively move to more complex components

### Phase 5: Cleanup

- [ ] Remove the compatibility layer
- [ ] Remove the old AppContext
- [ ] Update documentation and tests

## Benefits of the New System

1. **Better Separation of Concerns**: Each context handles a specific domain
2. **Improved Performance**: Components only re-render when their specific context changes
3. **Better Type Safety**: Each context has its own specialized types
4. **Enhanced Testability**: Easier to mock and test individual contexts
5. **Simplified Development**: Smaller, focused files are easier to understand and maintain

## Migration Strategy

### For Components

Update imports from:

```tsx
import { useAppContext } from '../components/AppContext';

// Usage
const { user, theme, courses, ... } = useAppContext();
```

To:

```tsx
import { useAuth, useTheme, useCourses } from "../components/contexts/modules";

// Usage
const {
  state: { user },
} = useAuth();
const { theme } = useTheme();
const {
  state: { courses },
} = useCourses();
```

### For App Initialization

Replace:

```tsx
<AppContextProvider>
  <App />
</AppContextProvider>
```

With:

```tsx
import { AppProviders } from "../components/contexts/modules";

<AppProviders>
  <App />
</AppProviders>;
```

## Compatibility Approach

During the transition, we'll maintain a compatibility layer that mimics the old AppContext API but uses the new modular contexts under the hood. This ensures that existing components continue to work while we progressively migrate them.

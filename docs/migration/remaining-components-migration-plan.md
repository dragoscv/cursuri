# Remaining Components Migration Plan

This document outlines the plan for migrating remaining components from the deprecated `useMigrationTool` to the modular context system.

## Progress So Far

- ✅ `HeroSection.tsx`: Migrated to use direct modular contexts
- ✅ `Courses.tsx`: Migrated to use direct modular contexts + Products context compatibility layer
- ✅ Created `productsContext.tsx` module for products and user paid products data

## Remaining Components to Migrate

Components are grouped by category for a more organized migration approach.

### Lesson Components

1. `components/Lesson/ClientLessonWrapper.tsx`
2. `components/Lesson/LessonContent.tsx`
3. `components/Lesson/LessonDetailComponent.tsx`
4. `components/Lesson/LessonForm.tsx`
5. `components/Lesson/LessonViewer.tsx`

### Q&A Components

1. `components/Lesson/QA/AnswersList.tsx`
2. `components/Lesson/QA/QASection.tsx`
3. `components/Lesson/QA/QuestionItem.tsx`

### Profile Components

1. `components/Profile/AppSettings.tsx`
2. `components/Profile/hooks/useAchievements.ts`
3. `components/Profile/hooks/usePaymentHistory.ts`

## Migration Guide

For each component, follow these steps:

1. Examine the component to identify which context variables/functions it's using
2. Import the appropriate modular contexts:
   ```jsx
   import { 
     useAuth, 
     useCourses,
     useLessons,
     useReviews,
     useUserData,
     useProducts, // For product-related data
     useToast,
     useModal 
   } from '@/components/contexts/modules';
   ```
3. Replace the `useMigrationTool` call with direct hooks:
   ```jsx
   // BEFORE
   const context = useMigrationTool({ componentName: 'ComponentName' });
   const { user, courses, lessons } = context;
   
   // AFTER
   const { user } = useAuth();
   const { state: coursesState } = useCourses();
   const { courses } = coursesState; 
   const { state: lessonsState } = useLessons();
   const { lessons } = lessonsState;
   ```
4. Handle any special cases:
   - For products: Use Products context or create a temporary compatibility solution
   - For TypeScript issues: Add type guards like `if (review && typeof review === 'object' && 'rating' in review)`

## Products Context Integration

For components that need product data:

```jsx
// If Products context is available, use it directly
// Temporary fallback
const [products, setProducts] = useState<StripeProduct[]>([]);
const [userPaidProducts, setUserPaidProducts] = useState<UserPaidProduct[]>([]);

// When Products context is properly integrated:
const { products, userPaidProducts } = useProducts();
```

## Timeline

- Phase 1 (June 1-10): Migrate Lesson components
- Phase 2 (June 11-15): Migrate Q&A components 
- Phase 3 (June 16-20): Migrate Profile components
- Final review: June 21-25
- Complete removal of migration tool: June 30, 2025

## Notes

- Always maintain backward compatibility during migration
- Test thoroughly after each component migration
- Consider incremental migration to avoid breaking changes
- Update documentation as components are migrated

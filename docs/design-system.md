# Cursuri Platform - Design System Specification

## Overview

This document defines the comprehensive design system for the Cursuri online course platform, built with Next.js 15, React 19, TypeScript 5, Tailwind CSS, and HeroUI components.

## 🎨 Design Principles

### Core Values

1. **Accessibility First** - WCAG 2.1 AA compliant
2. **Real Data Only** - Zero mock/placeholder content
3. **i18n Native** - All text through next-intl translation system
4. **Performance Optimized** - Sub-3s page loads, optimized animations
5. **Mobile-First Responsive** - 320px to 1920px+ breakpoints
6. **Theme-Aware** - 8 color themes with dark mode support

## 🎨 Color System

### Design Tokens (CSS Variables)

```css
:root {
  /* Primary Brand Colors */
  --ai-primary: #6366f1; /* Indigo 500 - Main brand */
  --ai-secondary: #8b5cf6; /* Violet 500 - Secondary actions */
  --ai-accent: #ec4899; /* Pink 500 - Call-to-action accents */

  /* Base Colors */
  --ai-background: #ffffff; /* Page background */
  --ai-foreground: #0f172a; /* Primary text */
  --ai-muted: #6b7280; /* Secondary text */

  /* Component Colors */
  --ai-card-bg: #ffffff; /* Card backgrounds */
  --ai-card-border: #e5e7eb; /* Card borders */

  /* Semantic Colors (RGB for opacity control) */
  --ai-primary-rgb: 99, 102, 241;
  --ai-secondary-rgb: 139, 92, 246;
  --ai-accent-rgb: 236, 72, 153;
  --ai-success-rgb: 16, 185, 129;
  --ai-warning-rgb: 245, 158, 11;
  --ai-error-rgb: 239, 68, 68;
}

/* Dark Mode Overrides */
.dark {
  --ai-primary: #818cf8; /* Lighter indigo */
  --ai-secondary: #a78bfa; /* Lighter violet */
  --ai-accent: #f472b6; /* Lighter pink */
  --ai-background: #030305; /* Near-black background */
  --ai-foreground: #f8fafc; /* Light text */
  --ai-muted: #94a3b8; /* Lighter muted */
  --ai-card-bg: #0a0d14; /* Dark card background */
  --ai-card-border: #243247; /* Dark border */
}
```

### Theme Variations

1. **Modern Purple** (Default) - Indigo/Violet/Pink
2. **Black & White** - Monochrome professional
3. **Green Neon** - Emerald/Green tech aesthetic
4. **Blue Ocean** - Sky blue/Cyan professional
5. **Brown Sunset** - Amber/Orange warm tones
6. **Yellow Morning** - Gold/Yellow energetic
7. **Red Blood** - Red/Crimson bold
8. **Pink Candy** - Magenta/Pink playful

### Accessibility Requirements

- **Contrast Ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Never rely on color alone for meaning
- **Focus Indicators**: Clear 2px outline with color contrast

## 📝 Typography System

### Font Families

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Type Scale

```css
--text-xs: 0.75rem; /* 12px - Captions, labels */
--text-sm: 0.875rem; /* 14px - Small body text */
--text-base: 1rem; /* 16px - Body text (base) */
--text-lg: 1.125rem; /* 18px - Emphasized text */
--text-xl: 1.25rem; /* 20px - Small headings */
--text-2xl: 1.5rem; /* 24px - Section headings */
--text-3xl: 1.875rem; /* 30px - Page headings */
--text-4xl: 2.25rem; /* 36px - Hero headings */
--text-5xl: 3rem; /* 48px - Large hero */
--text-6xl: 3.75rem; /* 60px - Extra large hero */
```

### Line Heights

```css
--leading-none: 1; /* Tight headlines */
--leading-tight: 1.25; /* Headlines */
--leading-normal: 1.5; /* Body text (default) */
--leading-relaxed: 1.75; /* Comfortable reading */
```

### Font Weights

```css
--font-normal: 400; /* Body text */
--font-medium: 500; /* Emphasized text */
--font-semibold: 600; /* Subheadings */
--font-bold: 700; /* Headings */
```

## 📐 Spacing System

### Scale (4px base unit)

```css
--space-0: 0; /* No spacing */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px - Base */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Component Spacing Guidelines

- **Cards**: padding: var(--space-6) (24px)
- **Buttons**: padding: var(--space-4) var(--space-6) (16px 24px)
- **Sections**: padding-y: var(--space-16) md:var(--space-24) (64px desktop, 96px large)
- **Grid Gaps**: gap: var(--space-6) (24px)

## 🎯 Component Library

### Button Component

#### Variants

1. **Primary**: Gradient background, white text
2. **Secondary**: Transparent with border, theme color text
3. **Success**: Green gradient for confirmation actions
4. **Danger**: Red gradient for destructive actions
5. **Flat**: Subtle gray background
6. **Light**: Semi-transparent white with blur

#### Sizes

- **xs**: 0.25rem 0.625rem, 0.75rem font
- **sm**: 0.375rem 0.875rem, 0.875rem font
- **md**: 0.625rem 1.25rem, 0.875rem font (default)
- **lg**: 0.75rem 1.5rem, 1rem font
- **xl**: 1rem 2rem, 1.125rem font

#### States

- **Hover**: translateY(-1px), enhanced shadow
- **Active**: translateY(0), reduced shadow
- **Focus**: 2px white outline + 4px color outline
- **Disabled**: opacity: 0.6, cursor: not-allowed
- **Loading**: Spinning icon, text hidden

### Input Component

#### Types

- Text input
- Email input
- Password input (with visibility toggle)
- Search input (with icon)
- Textarea
- Select dropdown

#### States

- **Default**: Border color: var(--ai-card-border)
- **Focus**: Border color: var(--ai-primary), ring effect
- **Error**: Border color: var(--ai-error), error message below
- **Disabled**: opacity: 0.6, cursor: not-allowed
- **Read-only**: Background: var(--ai-muted)/10

### Card Component

```tsx
interface CardProps {
  variant: 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean; // Enable hover effects
  children: ReactNode;
}
```

#### Styles

- **Elevated**: Box shadow, white/dark background
- **Outlined**: Border only, no shadow
- **Filled**: Subtle background color
- **Hover**: translateY(-4px), enhanced shadow

### Modal Component

#### Sizes

- **sm**: max-w-md (448px)
- **md**: max-w-lg (512px)
- **lg**: max-w-2xl (672px)
- **xl**: max-w-4xl (896px)
- **full**: max-w-full

#### Features

- Backdrop blur
- Scroll behavior: inside/outside
- Dismissible/non-dismissible
- Custom header/footer
- Keyboard navigation (ESC to close)
- Focus trap

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) {
  /* sm - Small tablets */
}
@media (min-width: 768px) {
  /* md - Tablets */
}
@media (min-width: 1024px) {
  /* lg - Desktops */
}
@media (min-width: 1280px) {
  /* xl - Large desktops */
}
@media (min-width: 1536px) {
  /* 2xl - Extra large */
}
```

### Grid System

```css
/* Responsive grid that adapts to screen size */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### Mobile Considerations

- Touch targets minimum 44x44px
- Bottom navigation for mobile (under 768px)
- Stackable layouts on mobile
- Larger font sizes on mobile for readability
- Swipe gestures where appropriate

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Semantic HTML

```tsx
// ✅ Good - Proper semantic structure
<header>
  <nav aria-label="Main navigation">
    <ul role="list">
      <li><a href="/courses">Courses</a></li>
    </ul>
  </nav>
</header>

<main>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Featured Courses</h2>
  </section>
</main>
```

#### ARIA Labels

```tsx
// ✅ Good - Descriptive ARIA labels
<button
  aria-label="Close modal"
  aria-pressed={isOpen}
>
  <CloseIcon aria-hidden="true" />
</button>

<input
  type="search"
  aria-label="Search courses"
  aria-describedby="search-help"
/>
<span id="search-help" className="sr-only">
  Enter keywords to search for courses
</span>
```

#### Keyboard Navigation

- Tab order follows visual layout
- All interactive elements keyboard accessible
- Focus indicators visible (not outline: none)
- Skip links for main content
- Modal focus trap with ESC to close

#### Screen Reader Support

```tsx
// ✅ Good - Screen reader only text
<span className="sr-only">
  Navigate to course details
</span>

// ✅ Good - Status messages
<div role="status" aria-live="polite">
  {message}
</div>

// ✅ Good - Loading states
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading courses...' : 'Courses loaded'}
</div>
```

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components: 3:1 minimum
- Test with browser DevTools or axe extension

## 🎬 Animation System

### Principles

- **Purposeful**: Animations should enhance UX, not distract
- **Performant**: Use transform and opacity (GPU-accelerated)
- **Respectful**: Honor prefers-reduced-motion
- **Smooth**: 60fps target, ease-in-out timing

### Common Animations

#### Fade In

```tsx
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};
```

#### Slide Up

```tsx
const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};
```

#### Scale

```tsx
const scale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 },
};
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🌍 Internationalization (i18n)

### Translation System

All text MUST use next-intl translation system:

```tsx
// ✅ Correct - Using translation
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}

// ❌ Wrong - Hardcoded string
function Component() {
  return <h1>Welcome to Cursuri</h1>;
}
```

### Translation File Structure

```
messages/
├── en/
│   ├── common.json
│   ├── home.json
│   ├── courses.json
│   └── profile.json
└── ro/
    ├── common.json
    ├── home.json
    ├── courses.json
    └── profile.json
```

## 🚀 Performance Optimization

### Image Optimization

```tsx
// ✅ Good - Next.js Image with optimization
<Image
  src="/course.jpg"
  alt="Course thumbnail"
  width={600}
  height={400}
  priority={isAboveFold}
  loading={isAboveFold ? undefined : 'lazy'}
/>
```

### Code Splitting

```tsx
// ✅ Good - Dynamic import for heavy components
const AdminDashboard = dynamic(() => import('@/components/Admin'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### CSS Optimization

- Use CSS variables for theming (avoid inline styles)
- Minimize CSS-in-JS runtime cost
- Leverage Tailwind's purging
- Critical CSS inlined

## 📋 Implementation Checklist

### Component Checklist

- [ ] Proper semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Responsive behavior tested
- [ ] All text uses i18n
- [ ] No mock/placeholder data
- [ ] Performance optimized

### Page Checklist

- [ ] Meta tags with i18n
- [ ] Structured data (JSON-LD)
- [ ] Proper heading hierarchy
- [ ] Skip links for navigation
- [ ] Breadcrumbs (where appropriate)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] All images optimized
- [ ] Performance metrics met (LCP < 2.5s)

## 🔗 References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [HeroUI Documentation](https://www.heroui.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)

---

**Version**: 1.0.0  
**Last Updated**: October 24, 2025  
**Maintained By**: Cursuri Development Team

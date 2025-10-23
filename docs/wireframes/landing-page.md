# Landing Page Wireframe

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [Logo] [Home] [Courses] [About] [Search] [Lang] [Theme] [User]│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      HERO SECTION                            │
│  ┌───────────────┐  ┌──────────────────────────────────┐   │
│  │               │  │  Master Modern Web Development    │   │
│  │  H1: Title    │  │  with Real-World Projects        │   │
│  │  Subtitle     │  │                                   │   │
│  │               │  │  [Get Started] [Explore Courses] │   │
│  │  [CTA Buttons]│  │                                   │   │
│  │               │  │  [Student Avatars] "5000+ learners"│  │
│  │  [Stats]      │  │  [Tech Badges: TS, React, etc.]  │   │
│  └───────────────┘  └──────────────────────────────────┘   │
│                                                              │
│  Animated Background: Grid + Neural Network + Particles     │
│  [Scroll Indicator]                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              RECOMMENDED COURSES SECTION                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Section Header: "Recommended for You"]             │  │
│  │  [Subtitle: Personalized course recommendations]     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ Course │  │ Course │  │ Course │  │ Course │         │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │ Card 4 │         │
│  │ [Image]│  │ [Image]│  │ [Image]│  │ [Image]│         │
│  │ Title  │  │ Title  │  │ Title  │  │ Title  │         │
│  │ Rating │  │ Rating │  │ Rating │  │ Rating │         │
│  │ Price  │  │ Price  │  │ Price  │  │ Price  │         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  STATISTICS SECTION                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │ 50+  │  │ 5000+│  │ 500+ │  │ 4.8  │                   │
│  │Courses│ │Students│ │Reviews│ │Rating│                   │
│  │ [Icon]│ │ [Icon]│  │ [Icon]│ │ [Icon]│                   │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TECH STACK SECTION                           │
│  [Section Header: "Technologies You'll Master"]             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ TS │ │React│ │Node│ │Next│ │ FB │ │ TW │               │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘               │
│  [Animated icon cards with hover effects]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                LEARNING PATH SECTION                         │
│  [Visual timeline showing: Beginner → Intermediate → Advanced]│
│  ┌───────────┐       ┌───────────┐       ┌───────────┐    │
│  │  Step 1   │  →    │  Step 2   │  →    │  Step 3   │    │
│  │ Fundamentals│      │ Projects │       │ Advanced  │    │
│  └───────────┘       └───────────┘       └───────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FEATURED COURSES SECTION                        │
│  [Section Header: "Popular Courses"]                         │
│  [Grid of course cards - 3 columns desktop, 1 mobile]       │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ Course │  │ Course │  │ Course │                       │
│  │ [Image]│  │ [Image]│  │ [Image]│                       │
│  │ Title  │  │ Title  │  │ Title  │                       │
│  │ Desc   │  │ Desc   │  │ Desc   │                       │
│  │ [Enroll]│  │ [Enroll]│  │ [Enroll]│                      │
│  └────────┘  └────────┘  └────────┘                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             AVAILABLE COURSES SECTION (id="courses-section")│
│  [Section Header: "All Available Courses"]                  │
│  [Filter Bar: Category | Level | Price | Sort]              │
│  [Search Bar]                                                │
│  [Grid of ALL course cards with pagination]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                WHY CHOOSE US SECTION                         │
│  [Section Header: "Why Learn With Us?"]                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Feature 1  │  │ Feature 2  │  │ Feature 3  │           │
│  │ [Icon]     │  │ [Icon]     │  │ [Icon]     │           │
│  │ Title      │  │ Title      │  │ Title      │           │
│  │ Description│  │ Description│  │ Description│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FEATURED REVIEWS SECTION                        │
│  [Section Header: "What Our Students Say"]                  │
│  [Carousel of review cards]                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ [Avatar]   │  │ [Avatar]   │  │ [Avatar]   │           │
│  │ Name       │  │ Name       │  │ Name       │           │
│  │ ★★★★★      │  │ ★★★★★      │  │ ★★★★★      │           │
│  │ Review text│  │ Review text│  │ Review text│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                CALL TO ACTION SECTION                        │
│  [Large heading: "Ready to Start Your Journey?"]            │
│  [Subtitle: Join thousands of successful learners]          │
│  [Get Started Button] [View All Courses Button]             │
│  [Gradient background with animations]                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ About    │  │ Courses  │  │ Legal    │  │ Social   │  │
│  │ - Mission│  │ - All    │  │ - Privacy│  │ - GitHub │  │
│  │ - Team   │  │ - Popular│  │ - Terms  │  │ - Twitter│  │
│  │ - Contact│  │ - New    │  │ - GDPR   │  │ - LinkedIn│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  [Copyright Notice] [Language Selector] [Theme Toggle]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  MOBILE BOTTOM NAVIGATION                    │
│  (Visible only on mobile < 768px)                           │
│  [Home] [Courses] [Profile] [Menu]                          │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (1024px+)

- Full grid layouts (3-4 columns for course cards)
- Side-by-side hero content
- Expanded navigation in header
- All sections visible

### Tablet (768px-1023px)

- 2 column grid for course cards
- Side-by-side hero content
- Condensed navigation
- Sections stack naturally

### Mobile (320px-767px)

- Single column layout
- Stacked hero content (text above image)
- Hamburger menu
- Bottom navigation visible
- Touch-optimized spacing
- Larger tap targets (44x44px minimum)

## Accessibility Features

### Keyboard Navigation

- Skip to main content link
- Tab order follows visual layout
- Focus indicators visible
- All interactive elements keyboard accessible

### Screen Reader Support

- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- ARIA labels on icons
- Proper heading hierarchy (H1 → H2 → H3)
- Alternative text for images
- Status messages for dynamic content

### Color & Contrast

- Text: 4.5:1 contrast ratio minimum
- UI elements: 3:1 contrast ratio minimum
- No reliance on color alone for meaning
- High contrast mode support

## Animations

### Hero Section

- Animated grid background
- Neural network/code node visualization
- Floating particles
- Scroll indicator pulse

### Course Cards

- Hover: translateY(-4px) + shadow
- Loading: Skeleton screens
- Fade-in on scroll (Intersection Observer)

### Sections

- Stagger children animation
- Parallax scrolling for background elements
- Smooth scroll to anchors

## Data Requirements

### Hero Section

- Real course count from Firebase
- Real student count from user purchases
- Real review count and ratings
- Top 5 technologies from course tags

### All Sections

- NO mock data allowed
- All text from i18n translation files
- Real Firebase course data
- Real user testimonials/reviews
- Real statistics from database

## Performance Targets

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Page Load**: < 3s
- **Time to Interactive**: < 3.5s

## SEO Optimization

- Meta title and description (i18n)
- Open Graph tags
- Twitter Card meta
- Structured data (JSON-LD)
- Semantic HTML
- Optimized images (WebP, lazy loading)

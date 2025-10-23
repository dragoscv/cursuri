# Courses Page Wireframe

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [Logo] [Home] [Courses] [About] [Search] [Lang] [Theme] [User]│
│  [Breadcrumbs: Home > Courses]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    COURSES HEADER                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │  H1: Explore Our Courses                               ││
│  │  Subtitle: Find the perfect course for your goals      ││
│  │  [Active filters count badge]                          ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FILTER & SEARCH BAR                       │
│  ┌────────────────────────────────────────────────────────┐│
│  │  [Search Input with icon: "Search courses..."]         ││
│  │  [Filter Button] [Sort Dropdown: Popular/Newest/Price] ││
│  └────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │  Active Filters:                                        ││
│  │  [Category: Web Dev ×] [Level: Beginner ×] [Clear All]││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                SIDEBAR FILTERS (Desktop Only)                │
│  ┌──────────────────┐                                       │
│  │  Filters         │                                       │
│  │                  │                                       │
│  │  Category        │                                       │
│  │  □ Web Dev       │                                       │
│  │  □ Mobile Dev    │                                       │
│  │  □ Data Science  │                                       │
│  │  □ AI/ML         │                                       │
│  │                  │                                       │
│  │  Level           │                                       │
│  │  □ Beginner      │                                       │
│  │  □ Intermediate  │                                       │
│  │  □ Advanced      │                                       │
│  │                  │                                       │
│  │  Price Range     │                                       │
│  │  □ Free          │                                       │
│  │  □ $0-$50        │                                       │
│  │  □ $50-$100      │                                       │
│  │  □ $100+         │                                       │
│  │                  │                                       │
│  │  Duration        │                                       │
│  │  □ < 5 hours     │                                       │
│  │  □ 5-20 hours    │                                       │
│  │  □ 20+ hours     │                                       │
│  │                  │                                       │
│  │  [Clear Filters] │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     COURSES GRID                             │
│  [Results count: "Showing 24 of 48 courses"]                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Course │  │ Course │  │ Course │  │ Course │           │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │ Card 4 │           │
│  │        │  │        │  │        │  │        │           │
│  │ [Image]│  │ [Image]│  │ [Image]│  │ [Image]│           │
│  │ Title  │  │ Title  │  │ Title  │  │ Title  │           │
│  │ Instruc│  │ Instruc│  │ Instruc│  │ Instruc│           │
│  │ ★★★★★  │  │ ★★★★☆  │  │ ★★★★★  │  │ ★★★★☆  │           │
│  │ (125)  │  │ (89)   │  │ (203)  │  │ (54)   │           │
│  │        │  │        │  │        │  │        │           │
│  │ [Tags] │  │ [Tags] │  │ [Tags] │  │ [Tags] │           │
│  │ Lessons│  │ Lessons│  │ Lessons│  │ Lessons│           │
│  │ Duration│ │ Duration│ │ Duration│ │ Duration│          │
│  │        │  │        │  │        │  │        │           │
│  │ $99.99 │  │ $79.99 │  │ FREE   │  │ $149   │           │
│  │ [Enroll]│ │ [Enroll]│ │ [Enroll]│ │ [Enroll]│           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Course │  │ Course │  │ Course │  │ Course │           │
│  │ Card 5 │  │ Card 6 │  │ Card 7 │  │ Card 8 │           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
│  [... more courses ...]                                     │
│                                                              │
│  [Load More Button] or [Pagination: 1 2 3 ... 10 Next]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EMPTY STATE (No Results)                  │
│  [Icon: Search with X]                                       │
│  H2: No courses found                                        │
│  P: Try adjusting your filters or search terms               │
│  [Clear All Filters Button]                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   LOADING STATE                              │
│  [Skeleton screens for course cards]                         │
│  [Animated shimmer effect]                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  [Standard footer layout - same as landing page]            │
└─────────────────────────────────────────────────────────────┘
```

## Course Card Component Detail

```
┌────────────────────────────────────┐
│         Course Card                │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │       [Course Image]         │ │
│  │       16:9 aspect ratio      │ │
│  │                              │ │
│  │  [Badge: Bestseller]         │ │
│  │  [Badge: New]                │ │
│  └──────────────────────────────┘ │
│                                    │
│  H3: Course Title (2 lines max)    │
│  P: Instructor Name                │
│                                    │
│  ★★★★★ 4.8 (125 reviews)           │
│                                    │
│  [Tech Tag] [Tech Tag] [Tech Tag]  │
│                                    │
│  📚 24 Lessons | ⏱️ 12 hours       │
│  📊 Beginner Level                 │
│                                    │
│  ───────────────────────────────   │
│                                    │
│  $99.99  [Enroll Now Button]       │
│  or FREE if already purchased      │
│                                    │
│  [Progress Bar 45%] (if enrolled)  │
└────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (1024px+)

- Sidebar filters visible
- 3-4 column grid for courses
- Hover effects on cards
- All filter options expanded

### Tablet (768px-1023px)

- Filter sidebar becomes modal
- 2 column grid for courses
- Filter button in header
- Horizontal scrolling for active filters

### Mobile (320px-767px)

- Single column layout
- Filter modal (bottom sheet)
- Stacked course cards
- Touch-optimized filters
- Bottom navigation visible

## Filter Modal (Mobile)

```
┌─────────────────────────────────────┐
│  Filters                    [× Close]│
├─────────────────────────────────────┤
│  [Search within filters]            │
│                                     │
│  ▼ Category                         │
│     □ Web Development               │
│     □ Mobile Development            │
│     □ Data Science                  │
│                                     │
│  ▼ Level                            │
│     □ Beginner                      │
│     □ Intermediate                  │
│     □ Advanced                      │
│                                     │
│  ▼ Price Range                      │
│     □ Free                          │
│     □ $0-$50                        │
│     □ $50-$100                      │
│                                     │
│  [Clear All] [Apply Filters (3)]    │
└─────────────────────────────────────┘
```

## Accessibility Features

### Keyboard Navigation

- Tab through course cards
- Enter to view course details
- Arrow keys for pagination
- ESC to close filter modal
- Focus trapping in modals

### Screen Reader Support

```tsx
<section aria-labelledby="courses-heading">
  <h1 id="courses-heading">Explore Our Courses</h1>

  <div role="search" aria-label="Course search">
    <input type="search" aria-label="Search courses by keyword" />
  </div>

  <aside aria-label="Course filters">
    <h2>Filter Courses</h2>
    {/* Filter checkboxes with labels */}
  </aside>

  <div role="status" aria-live="polite" aria-atomic="true">
    Showing 24 of 48 courses
  </div>

  <ul role="list" aria-label="Course list">
    <li>
      <article aria-labelledby="course-1-title">
        <h3 id="course-1-title">Course Title</h3>
        {/* Course details */}
      </article>
    </li>
  </ul>
</section>
```

### ARIA Labels

- Course cards: `aria-labelledby` for title
- Filters: `role="group"`, `aria-labelledby`
- Status messages: `role="status"`, `aria-live="polite"`
- Loading: `role="status"`, `aria-busy="true"`
- Pagination: `nav`, `aria-label="Pagination"`

## Data Requirements

### Course Data (from Firebase)

```typescript
interface Course {
  id: string;
  title: string; // from i18n
  description: string; // from i18n
  instructor: string;
  thumbnail: string; // optimized image URL
  category: string[];
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  currency: string;
  duration: number; // in hours
  lessonsCount: number;
  rating: number; // calculated from reviews
  reviewsCount: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Filter State

```typescript
interface FilterState {
  search: string;
  categories: string[];
  levels: string[];
  priceRange: [number, number];
  duration: string;
  sortBy: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
}
```

## Performance Optimizations

### Initial Load

- Server-side render first 12 courses
- Lazy load images (loading="lazy")
- Skeleton screens for loading state
- Virtualized list for 100+ courses

### Filtering

- Debounced search (300ms)
- Client-side filtering after initial load
- URL params for filter state (shareable URLs)
- Optimistic UI updates

### Images

- Next.js Image component
- WebP format with fallbacks
- Responsive images (srcset)
- Blur placeholder

## SEO Optimization

### Meta Tags

```html
<title>Web Development Courses | Cursuri Platform</title>
<meta name="description" content="Browse 50+ courses..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<link rel="canonical" href="/courses" />
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Courses",
  "description": "Browse our collection of courses",
  "numberOfItems": 48,
  "itemListElement": [
    {
      "@type": "Course",
      "name": "Full Stack Web Development",
      "provider": {
        "@type": "Organization",
        "name": "Cursuri Platform"
      }
    }
  ]
}
```

## Error States

### Network Error

```
[Icon: WiFi X]
H2: Connection Lost
P: Please check your internet connection
[Retry Button]
```

### Server Error

```
[Icon: Server Alert]
H2: Something Went Wrong
P: We're working to fix the issue
[Try Again] [Go Home]
```

## Performance Targets

- **Initial Load**: < 2s
- **Filter Response**: < 100ms
- **Scroll Performance**: 60fps
- **Image Load**: Progressive (blur → full)

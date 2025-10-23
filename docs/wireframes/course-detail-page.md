# Course Detail Page Wireframe

## Page Overview

The Course Detail page provides comprehensive information about a specific course, including curriculum, instructor details, reviews, and enrollment options. This page is critical for conversion and must clearly communicate value.

---

## Layout Structure (Desktop 1280px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER (Fixed, Global Navigation)                                          │
│ Logo | Courses | About | Contact | [Search] [EN/RO] [Theme] [User Menu]  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ BREADCRUMBS                                                                 │
│ Home > Courses > [Course Category] > [Course Name]                         │
└─────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────┬──────────────────────────────────┐
│ HERO SECTION (Course Overview)           │ SIDEBAR (Sticky)                 │
│                                           │                                  │
│ ┌──────────────────────────────────────┐ │ ┌──────────────────────────────┐ │
│ │ [Course Thumbnail/Preview Video]     │ │ │ Course Card                  │ │
│ │ 16:9 Aspect Ratio                    │ │ │ ├─ Thumbnail Preview          │ │
│ │ Play icon overlay if video           │ │ │ ├─ Price: $49.99              │ │
│ └──────────────────────────────────────┘ │ │ ├─ [Buy Now] Primary Button   │ │
│                                           │ │ ├─ Or: [Access Course] (owned)│ │
│ <h1>Course Title Here</h1>               │ │ ├─ 30-day money-back guarantee│ │
│ By [Instructor Name] • ⭐ 4.8 (324)      │ │ ├─ Includes:                  │ │
│                                           │ │ │  ✓ 12 hours video content   │ │
│ [Beginner] [Intermediate] [Advanced]     │ │ │  ✓ 48 lessons               │ │
│ Updated: October 2025                    │ │ │  ✓ Certificate of completion│ │
│                                           │ │ │  ✓ Lifetime access          │ │
│ <p className="text-lg">Short description │ │ │  ✓ Mobile & desktop access  │ │
│ of course benefits and what students     │ │ └──────────────────────────────┘ │
│ will learn in 2-3 sentences.</p>         │ │                                  │
│                                           │ │ ┌──────────────────────────────┐ │
│ [💾 Save] [📤 Share]                     │ │ │ Share Course                 │ │
│                                           │ │ │ [📘 Facebook] [🐦 Twitter]   │ │
└──────────────────────────────────────────┤ │ [📧 Email]    [🔗 Copy Link]   │ │
│ WHAT YOU'LL LEARN SECTION                │ │ └──────────────────────────────┘ │
│ ┌────────────────────────────────────┐   │ │                                  │
│ │ ✓ Learning objective 1               │ │ ┌──────────────────────────────┐ │
│ │ ✓ Learning objective 2               │ │ │ Course Features              │ │
│ │ ✓ Learning objective 3               │ │ │ 🎓 Skill level: Intermediate │ │
│ │ ✓ Learning objective 4               │ │ │ 🕒 Duration: 12h 30min       │ │
│ │ ✓ Learning objective 5               │ │ │ 📚 Lessons: 48               │ │
│ │ ✓ Learning objective 6               │ │ │ 🌍 Language: English/Romanian│ │
│ └────────────────────────────────────┘   │ │ │ 📱 Mobile optimized          │ │
└──────────────────────────────────────────┤ │ 📜 Certificate included      │ │
│ TABS NAVIGATION (Sticky on Scroll)       │ │ └──────────────────────────────┘ │
│ [Curriculum] [Instructor] [Reviews] [FAQ]│ │                                  │
└──────────────────────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ CURRICULUM TAB (Active by Default)                                          │
│                                                                              │
│ <h2>Course Curriculum</h2>                                                  │
│ 48 lessons • 12h 30min total duration                                       │
│                                                                              │
│ ┌─ Section 1: Introduction (3 lessons, 45min) ──────────[Expand/Collapse]─┐│
│ │ ├─ ▶️ 1. Welcome to the Course (10:24) [FREE PREVIEW]                    ││
│ │ ├─ 🔒 2. Course Structure Overview (15:30)                               ││
│ │ └─ 🔒 3. Setting Up Your Environment (19:06)                             ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌─ Section 2: Getting Started (5 lessons, 1h 30min) ───[Expand/Collapse]──┐│
│ │ ├─ 🔒 4. Lesson Title Here (18:24)                                       ││
│ │ ├─ 🔒 5. Another Lesson (22:15)                                          ││
│ │ ├─ 🔒 6. Hands-on Exercise (15:00)                                       ││
│ │ ├─ 🔒 7. Quiz: Test Your Knowledge (10:00)                               ││
│ │ └─ 🔒 8. Project: Build Your First... (25:00)                            ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ [... Additional sections collapsed ...]                                     │
│                                                                              │
│ ┌─ Section 10: Final Project (4 lessons, 2h 15min) ───[Expand/Collapse]───┐│
│ │ ├─ 🔒 45. Project Requirements (20:00)                                   ││
│ │ ├─ 🔒 46. Building the Project (60:00)                                   ││
│ │ ├─ 🔒 47. Testing & Deployment (25:00)                                   ││
│ │ └─ 🔒 48. Course Wrap-up & Next Steps (10:00)                            ││
│ └───────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ INSTRUCTOR TAB                                                               │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐│
│ │ ┌────────┐  Instructor Name                                              ││
│ │ │ Avatar │  Senior Developer & Educator                                  ││
│ │ │ Image  │  ⭐ 4.9 Instructor Rating • 15,234 Students                   ││
│ │ │ 120x120│  📚 12 Courses • 🎓 5 Years Teaching Experience               ││
│ │ └────────┘                                                                ││
│ │                                                                            ││
│ │ <p>Comprehensive instructor bio describing their expertise,              ││
│ │ professional background, teaching philosophy, and passion for            ││
│ │ helping students succeed. 3-4 paragraphs of detailed information.</p>    ││
│ │                                                                            ││
│ │ 🔗 [Website] [GitHub] [LinkedIn] [Twitter]                                ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ <h3>Other Courses by This Instructor</h3>                                   │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                                   │
│ │ Course 1 │  │ Course 2 │  │ Course 3 │                                   │
│ │ Thumbnail│  │ Thumbnail│  │ Thumbnail│                                   │
│ │ ⭐ 4.7   │  │ ⭐ 4.9   │  │ ⭐ 4.8   │                                   │
│ │ $39.99   │  │ $49.99   │  │ $44.99   │                                   │
│ └──────────┘  └──────────┘  └──────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REVIEWS TAB                                                                  │
│                                                                              │
│ <h2>Student Reviews</h2>                                                    │
│ ⭐ 4.8 out of 5 (324 ratings)                                               │
│                                                                              │
│ ┌─ Rating Distribution ────────────────────────────────────────────────────┐│
│ │ 5 ⭐ ██████████████████████████████████████ 85% (275)                    ││
│ │ 4 ⭐ ████████████ 10% (32)                                                ││
│ │ 3 ⭐ ██ 3% (10)                                                           ││
│ │ 2 ⭐ █ 1% (4)                                                             ││
│ │ 1 ⭐ █ 1% (3)                                                             ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ [Filter: All Reviews ▼] [Sort: Most Recent ▼]                              │
│                                                                              │
│ ┌─ Review Card 1 ──────────────────────────────────────────────────────────┐│
│ │ ┌────┐ John Doe • ⭐⭐⭐⭐⭐ 5.0 • 2 days ago                           ││
│ │ │👤 │ Verified Purchase                                                  ││
│ │ └────┘                                                                    ││
│ │ <h4>Excellent course! Highly recommended</h4>                             ││
│ │ <p>Detailed review text explaining what the student liked, what they     ││
│ │ learned, and how it helped their career. 2-3 paragraphs.</p>             ││
│ │ 👍 Helpful (24) • 💬 Reply                                                ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ [... 9 more review cards ...]                                               │
│                                                                              │
│ [Load More Reviews] Button                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FAQ TAB                                                                      │
│                                                                              │
│ <h2>Frequently Asked Questions</h2>                                         │
│                                                                              │
│ ┌─ ❓ What are the prerequisites for this course? ──────────[Expand/Collapse]┐│
│ │ Answer explaining prerequisites...                                        ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ ┌─ ❓ How long do I have access to the course? ─────────[Expand/Collapse]──┐│
│ │ Answer explaining lifetime access...                                      ││
│ └───────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│ [... 8 more FAQ items ...]                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ REQUIREMENTS & AUDIENCE SECTION                                             │
│                                                                              │
│ ┌───────────────────────────────┬────────────────────────────────────────┐  │
│ │ <h3>Requirements</h3>         │ <h3>Who This Course Is For</h3>       │  │
│ │ • Basic HTML knowledge        │ • Aspiring web developers             │  │
│ │ • JavaScript fundamentals     │ • Frontend engineers                  │  │
│ │ • Computer with internet      │ • Career switchers                    │  │
│ │ • Code editor (VS Code)       │ • Self-taught programmers             │  │
│ └───────────────────────────────┴────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ RELATED COURSES SECTION                                                     │
│                                                                              │
│ <h2>Students Also Bought</h2>                                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│ │ Course 1 │  │ Course 2 │  │ Course 3 │  │ Course 4 │                    │
│ │ Card     │  │ Card     │  │ Card     │  │ Card     │                    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ FOOTER (Global)                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Layout (320px - 767px)

```
┌───────────────────────────────┐
│ HEADER (Sticky)               │
│ [☰] Logo [Search] [User]     │
└───────────────────────────────┘
┌───────────────────────────────┐
│ COURSE THUMBNAIL              │
│ [▶️ Preview Video]            │
└───────────────────────────────┘
┌───────────────────────────────┐
│ <h1>Course Title</h1>         │
│ By Instructor • ⭐ 4.8 (324)  │
│ [Beginner Badge]              │
│ Updated: Oct 2025             │
└───────────────────────────────┘
┌───────────────────────────────┐
│ STICKY BUY BAR (Bottom)       │
│ $49.99 | [Buy Now] Button     │
└───────────────────────────────┘
┌───────────────────────────────┐
│ Short Description             │
│ [💾 Save] [📤 Share]         │
└───────────────────────────────┘
┌───────────────────────────────┐
│ WHAT YOU'LL LEARN (Accordion) │
│ ✓ Objective 1                 │
│ ✓ Objective 2                 │
│ [Show More]                   │
└───────────────────────────────┘
┌───────────────────────────────┐
│ TABS (Swipeable)              │
│ [Curriculum|Instructor|Reviews│
│  FAQ]                         │
└───────────────────────────────┘
┌───────────────────────────────┐
│ TAB CONTENT                   │
│ (Currently Active Tab)        │
└───────────────────────────────┘
┌───────────────────────────────┐
│ RELATED COURSES (Horizontal   │
│ Scroll)                       │
└───────────────────────────────┘
┌───────────────────────────────┐
│ FOOTER                        │
└───────────────────────────────┘
```

---

## Accessibility Features (WCAG 2.1 AA)

### Semantic HTML

```tsx
<main role="main" id="main-content">
  <nav aria-label="Breadcrumb navigation">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      // Breadcrumb items
    </ol>
  </nav>

  <article itemscope itemtype="https://schema.org/Course">
    <header>
      <h1 itemprop="name">Course Title</h1>
      <meta itemprop="educationalLevel" content="Intermediate" />
    </header>

    <section aria-labelledby="learning-objectives">
      <h2 id="learning-objectives">What You'll Learn</h2>
      <ul role="list">// Learning objectives</ul>
    </section>

    <div role="tabpanel" id="curriculum-panel" aria-labelledby="curriculum-tab">
      // Curriculum content
    </div>
  </article>
</main>
```

### Keyboard Navigation

- **Tab Order**: Header → Breadcrumbs → Hero CTA → Sidebar CTA → Tab Navigation → Tab Content
- **Tab Panel**: Arrow keys navigate between tabs, Tab enters content
- **Accordion Sections**: Space/Enter to expand/collapse, Arrow keys to navigate
- **Lesson List**: Up/Down arrows, Enter to select, Home/End for first/last

### Screen Reader Support

```tsx
// Video Preview
<button
  aria-label={t('course.playPreview')}
  aria-describedby="preview-duration"
>
  <span id="preview-duration" className="sr-only">
    3 minute preview
  </span>
</button>

// Lesson Status
<li aria-label={t('course.lesson.locked')}>
  <span aria-hidden="true">🔒</span>
  Lesson Title
</li>

// Rating Display
<div aria-label={t('course.rating', { rating: 4.8, count: 324 })}>
  <span aria-hidden="true">⭐ 4.8 (324)</span>
</div>

// Price Information
<div aria-live="polite" aria-atomic="true">
  <span className="sr-only">{t('course.price.label')}</span>
  <span aria-label={t('course.price.amount', { amount: 49.99 })}}>
    $49.99
  </span>
</div>
```

### Focus Management

- Focus trap within modals (video player, share dialog)
- Skip to curriculum link for quick navigation
- Focus indicator visible on all interactive elements
- Focus returns to trigger element on modal close

---

## Data Requirements

### TypeScript Interfaces

```typescript
interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  previewVideo?: string;
  price: number;
  currency: string;
  instructor: Instructor;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string[];
  duration: number; // minutes
  lessonsCount: number;
  sectionsCount: number;
  rating: number;
  ratingsCount: number;
  studentsEnrolled: number;
  lastUpdated: Date;
  tags: string[];
  categories: string[];
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  curriculum: CourseSection[];
  reviews: Review[];
  faqs: FAQ[];
  certificateIncluded: boolean;
  lifetimeAccess: boolean;
  mobileAccess: boolean;
  moneyBackGuarantee: number; // days
  relatedCourses: string[]; // course IDs
  metadata: {
    seoTitle: string;
    seoDescription: string;
    ogImage: string;
  };
}

interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  duration: number; // minutes
  isCollapsed: boolean;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number; // minutes
  type: 'video' | 'quiz' | 'exercise' | 'project';
  isFree: boolean;
  isCompleted: boolean;
  resources?: Resource[];
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  verified: boolean;
  helpful: number;
  replies?: ReviewReply[];
}

interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  rating: number;
  studentsCount: number;
  coursesCount: number;
  yearsTeaching: number;
  socialLinks: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}
```

### Firebase Query

```typescript
// Fetch course with all details
const fetchCourseDetail = async (courseId: string): Promise<CourseDetail | null> => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));

    if (!courseDoc.exists()) return null;

    const courseData = courseDoc.data() as CourseDetail;

    // Fetch related data
    const [instructor, reviews, curriculum] = await Promise.all([
      fetchInstructor(courseData.instructorId),
      fetchCourseReviews(courseId),
      fetchCourseCurriculum(courseId),
    ]);

    return {
      ...courseData,
      instructor,
      reviews,
      curriculum,
    };
  } catch (error) {
    console.error('Error fetching course detail:', error);
    return null;
  }
};

// Check if user owns course
const checkCourseOwnership = async (userId: string, courseId: string): Promise<boolean> => {
  const purchasesQuery = query(
    collection(db, 'purchases'),
    where('userId', '==', userId),
    where('courseId', '==', courseId),
    where('status', '==', 'completed')
  );

  const snapshot = await getDocs(purchasesQuery);
  return !snapshot.empty;
};
```

---

## State Management

### Component States

```typescript
interface CourseDetailState {
  course: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'curriculum' | 'instructor' | 'reviews' | 'faq';
  expandedSections: Set<string>;
  userOwned: boolean;
  isPreviewPlaying: boolean;
  shareDialogOpen: boolean;
}

// Actions
const handleBuyCourse = async () => {
  // Redirect to Stripe Checkout
  const session = await createCheckoutSession(course.id);
  window.location.href = session.url;
};

const handleAccessCourse = () => {
  router.push(`/courses/${course.id}/lessons/${firstLessonId}`);
};

const toggleSection = (sectionId: string) => {
  setExpandedSections((prev) => {
    const next = new Set(prev);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    return next;
  });
};
```

---

## Performance Optimization

### Targets

- **LCP**: <2.5s (Hero image/video)
- **FID**: <100ms (Tab switching, accordion)
- **CLS**: <0.1 (Lazy-loaded images, dynamic content)

### Techniques

```typescript
// Image Optimization
<Image
  src={course.thumbnail}
  alt={course.title}
  width={1280}
  height={720}
  priority
  placeholder="blur"
  blurDataURL={course.thumbnailBlur}
/>

// Code Splitting
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
  loading: () => <Skeleton className="aspect-video" />
});

// Data Prefetching
<Link
  href={`/courses/${course.id}`}
  prefetch={true}
>
```

---

## SEO & Structured Data

### Meta Tags

```tsx
<Head>
  <title>{course.metadata.seoTitle}</title>
  <meta name="description" content={course.metadata.seoDescription} />
  <meta property="og:title" content={course.title} />
  <meta property="og:description" content={course.shortDescription} />
  <meta property="og:image" content={course.metadata.ogImage} />
  <meta property="og:type" content="website" />
  <link rel="canonical" href={`https://cursuri.dev/courses/${course.slug}`} />
</Head>
```

### JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Course Title",
  "description": "Course description",
  "provider": {
    "@type": "Organization",
    "name": "Cursuri",
    "sameAs": "https://cursuri.dev"
  },
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "324"
  },
  "instructor": {
    "@type": "Person",
    "name": "Instructor Name"
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: October 24, 2025  
**Responsive**: Yes (Mobile-first, 320px+)  
**Accessibility**: WCAG 2.1 AA Compliant  
**Performance**: Core Web Vitals Optimized

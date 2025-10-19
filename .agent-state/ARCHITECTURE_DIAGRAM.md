# 🏛️ Cursuri Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CURSURI PLATFORM                                   │
│                    Next.js 15 + React 19 + TypeScript 5                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         React 19 Components                              │  │
│  │  ┌────────────┬────────────┬────────────┬────────────┬────────────────┐  │  │
│  │  │   Header   │   Course   │   Lesson   │   Admin    │    Profile    │  │  │
│  │  │   (Nav)    │  (Display) │  (Video)   │ (Dashboard)│  (Dashboard)  │  │  │
│  │  └────────────┴────────────┴────────────┴────────────┴────────────────┘  │  │
│  │                                  ↓                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │  │
│  │  │                  AppContext (Central State)                      │    │  │
│  │  │  - useReducer + React Context                                    │    │  │
│  │  │  - User auth, courses, lessons, modals, theme                   │    │  │
│  │  │  - Caching, progress tracking, admin state                      │    │  │
│  │  └──────────────────────────────────────────────────────────────────┘    │  │
│  │                                  ↓                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │  │
│  │  │                     Modular Contexts                             │    │  │
│  │  │  useAuth | useModal | useTheme | useCourse | useLesson          │    │  │
│  │  └──────────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      UI Layer (TailwindCSS + HeroUI)                     │  │
│  │  - Responsive design (mobile/tablet/desktop)                             │  │
│  │  - Dark/Light mode + 8 color schemes                                     │  │
│  │  - Framer Motion animations                                              │  │
│  │  - Modal system (reusable, stackable)                                    │  │
│  │  - Toast notifications                                                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                                   HTTPS
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 SERVER LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      App Router (Next.js 15)                             │  │
│  │  ┌────────────┬────────────┬────────────┬────────────┬────────────────┐  │  │
│  │  │   /        │  /courses  │  /profile  │   /admin   │   /api/*      │  │  │
│  │  │ (Homepage) │ (Dynamic)  │ (Protected)│ (Protected)│  (5 routes)   │  │  │
│  │  └────────────┴────────────┴────────────┴────────────┴────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      Middleware (Security)                               │  │
│  │  - Security headers (CSP, X-Frame-Options, etc.)                         │  │
│  │  - API request validation                                                │  │
│  │  - Content-Type checking                                                 │  │
│  │  - Payload size limits (10MB)                                            │  │
│  │  - Environment validation                                                │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                         API Routes (5)                                   │  │
│  │  ┌────────────────┬────────────────┬────────────────┬──────────────┐    │  │
│  │  │  /api/captions │ /api/certificate│  /api/invoice │ /api/sync-* │    │  │
│  │  │  (Azure Speech)│  (PDF Gen)      │  (PDF Gen)    │ (Utilities) │    │  │
│  │  └────────────────┴────────────────┴────────────────┴──────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                             Multiple Connections
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Firebase Services (Google Cloud)                      │  │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐  │  │
│  │  │ Firebase Auth│   Firestore  │    Storage   │  Firebase Extensions │  │  │
│  │  │ (Email/Pass) │   (NoSQL)    │   (Media)    │  (Stripe Integration)│  │  │
│  │  └──────────────┴──────────────┴──────────────┴──────────────────────┘  │  │
│  │                                                                          │  │
│  │  Firestore Collections:                                                 │  │
│  │  - courses/ (with lessons/ and reviews/ sub-collections)                │  │
│  │  - users/ (profiles, preferences, permissions)                          │  │
│  │  - customers/ (with payments/ sub-collection from Stripe)               │  │
│  │  - products/ (Stripe product catalog)                                   │  │
│  │                                                                          │  │
│  │  Security Rules:                                                         │  │
│  │  - firestore.rules: Collection-level access control                     │  │
│  │  - storage.rules: File upload/download permissions                      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    Stripe Payment Processing                             │  │
│  │  via Firewand (wrapper around @invertase/firestore-stripe-payments)     │  │
│  │                                                                          │  │
│  │  Flow:                                                                   │  │
│  │  1. createCheckoutSession() → Stripe Checkout Page                      │  │
│  │  2. User completes payment on Stripe                                    │  │
│  │  3. Webhook updates Firestore (customers/{userId}/payments)             │  │
│  │  4. Client-side refreshes purchase state                                │  │
│  │                                                                          │  │
│  │  Supported:                                                              │  │
│  │  - One-time payments ✅                                                  │  │
│  │  - Promo codes ✅                                                        │  │
│  │  - Invoice generation ✅                                                 │  │
│  │  - Subscriptions (planned) ⚠️                                           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │               Azure Cognitive Services (Speech SDK)                      │  │
│  │  - Speech-to-text transcription                                         │  │
│  │  - Caption generation (10 languages)                                     │  │
│  │  - Video subtitle creation                                               │  │
│  │  🚨 API Key exposed client-side (needs server-side migration)           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌────────────┐    Login Request    ┌──────────────┐    verifyIdToken    ┌──────────────┐
│   Client   │ ──────────────────> │  AppContext  │ ──────────────────> │ Firebase Auth│
│  (Browser) │                     │  (Context)   │                     │              │
└────────────┘                     └──────────────┘                     └──────────────┘
      │                                    │                                    │
      │                                    │ <────── User Token ────────────────┘
      │                                    │
      │                                    │ Fetch User Profile
      │                                    │ ──────────────────────────────────>
      │                                    │                            ┌──────────────┐
      │                                    │ <────── User Data ──────── │  Firestore   │
      │                                    │                            │ (users/{uid})│
      │ <────── Auth State Update ─────────┘                            └──────────────┘
      │
      ▼
┌────────────┐
│  Protected │
│   Routes   │
│  Rendered  │
└────────────┘
```

### 2. Course Purchase Flow

```
┌────────────┐   Click Purchase   ┌──────────────┐  createCheckoutSession  ┌────────────┐
│   Client   │ ─────────────────> │  AppContext  │ ──────────────────────> │  Firewand  │
│  (Course)  │                    │              │                         │  (Stripe)  │
└────────────┘                    └──────────────┘                         └────────────┘
      │                                   │                                       │
      │                                   │ <───── Checkout Session URL ──────────┘
      │                                   │
      │ <───── Redirect to Stripe ────────┘
      │
      ▼
┌────────────┐   Complete Payment   ┌────────────┐    Webhook Event     ┌──────────────┐
│   Stripe   │ ──────────────────>  │  Firebase  │ ──────────────────>  │  Firestore   │
│  Checkout  │                      │ Extension  │                      │ (customers/) │
└────────────┘                      └────────────┘                      └──────────────┘
      │                                                                         │
      │ <───── Success/Cancel URL ──────────────────────────────────────────────┘
      │
      ▼
┌────────────┐   Fetch Purchases    ┌──────────────┐    Query Firestore   ┌──────────────┐
│   Client   │ ──────────────────>  │  AppContext  │ ──────────────────>  │  Firestore   │
│  (Course)  │                      │              │                      │ (customers/) │
└────────────┘                      └──────────────┘                      └──────────────┘
      │                                   │                                       │
      │                                   │ <───── Purchase Records ───────────────┘
      │ <───── Access Granted ────────────┘
      │
      ▼
┌────────────┐
│  Lessons   │
│  Unlocked  │
└────────────┘
```

### 3. Lesson Content Delivery

```
┌────────────┐   Request Lesson    ┌──────────────┐  Check Access Rights  ┌──────────────┐
│   Client   │ ─────────────────>  │  AppContext  │ ──────────────────>  │  Firestore   │
│  (Lesson)  │                     │              │                      │ (purchases)  │
└────────────┘                     └──────────────┘                      └──────────────┘
      │                                   │                                       │
      │                                   │ <───── Access Verified ────────────────┘
      │                                   │
      │                                   │ Fetch Lesson Data
      │                                   │ ──────────────────────────────────>
      │                                   │                            ┌──────────────┐
      │                                   │ <────── Lesson Data ────── │  Firestore   │
      │                                   │                            │ (lessons/)   │
      │                                   │                            └──────────────┘
      │                                   │
      │                                   │ Fetch Video URL
      │                                   │ ──────────────────────────────────>
      │                                   │                            ┌──────────────┐
      │                                   │ <────── Video URL ──────── │   Firebase   │
      │                                   │                            │   Storage    │
      │ <────── Lesson Content ────────────┘                           └──────────────┘
      │
      ▼
┌────────────┐   Video Progress    ┌──────────────┐   Save Progress      ┌──────────────┐
│   Video    │ ─────────────────>  │  AppContext  │ ──────────────────>  │  Firestore   │
│   Player   │                     │              │                      │ (progress/)  │
└────────────┘                     └──────────────┘                      └──────────────┘
```

### 4. Admin Course Management

```
┌────────────┐   Add/Edit Course   ┌──────────────┐   Verify Admin       ┌──────────────┐
│   Admin    │ ─────────────────>  │  AppContext  │ ──────────────────>  │  Firestore   │
│  Dashboard │                     │              │                      │ (users/)     │
└────────────┘                     └──────────────┘                      └──────────────┘
      │                                   │                                       │
      │                                   │ <───── Admin Verified ─────────────────┘
      │                                   │
      │                                   │ Upload Course Data
      │                                   │ ──────────────────────────────────>
      │                                   │                            ┌──────────────┐
      │                                   │ <────── Success ────────── │  Firestore   │
      │                                   │                            │ (courses/)   │
      │                                   │                            └──────────────┘
      │                                   │
      │                                   │ Upload Media (if any)
      │                                   │ ──────────────────────────────────>
      │                                   │                            ┌──────────────┐
      │                                   │ <────── Upload URL ─────── │   Firebase   │
      │                                   │                            │   Storage    │
      │                                   │                            └──────────────┘
      │                                   │
      │                                   │ Create Stripe Product
      │                                   │ ──────────────────────────────────>
      │                                   │                            ┌──────────────┐
      │                                   │ <────── Product ID ─────── │   Firewand   │
      │                                   │                            │  (Stripe)    │
      │ <────── Course Created ────────────┘                           └──────────────┘
      │
      ▼
┌────────────┐
│   Course   │
│   Live on  │
│  Platform  │
└────────────┘
```

## Component Hierarchy

```
App (Root Layout)
├── Providers
│   └── AppContextProvider
│       ├── ThemeProvider
│       ├── ModalProvider
│       └── AuthProvider
│
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── NavLink (Home)
│   │   ├── NavLink (Courses)
│   │   ├── NavLink (About)
│   │   └── NavLink (Contact)
│   ├── UserMenu (if authenticated)
│   │   ├── Profile Link
│   │   ├── Admin Link (if admin)
│   │   └── Logout Button
│   ├── ThemeToggle
│   └── MobileNav (responsive)
│
├── Page Content (Dynamic based on route)
│   ├── Homepage
│   │   ├── HeroSection
│   │   ├── FeaturedCoursesSection
│   │   ├── StatisticsSection
│   │   ├── WhyChooseUsSection
│   │   ├── TechStackSection
│   │   ├── InstructorHighlightsSection
│   │   ├── FeaturedReviewsSection
│   │   ├── CallToActionSection
│   │   └── LearningPathSection
│   │
│   ├── Courses (/courses)
│   │   ├── SearchBar
│   │   ├── FilterPanel
│   │   │   ├── CategoryFilter
│   │   │   ├── PriceFilter
│   │   │   └── LevelFilter
│   │   └── CourseGrid
│   │       └── CourseCard (multiple)
│   │           ├── CourseImage
│   │           ├── CourseInfo
│   │           ├── InstructorBadge
│   │           ├── Rating
│   │           └── PurchaseButton
│   │
│   ├── Course Detail (/courses/[id])
│   │   ├── CourseOverview
│   │   │   ├── CourseHeader
│   │   │   ├── CourseDescription
│   │   │   ├── CourseBenefits
│   │   │   └── CourseRequirements
│   │   ├── CourseContent
│   │   │   └── LessonList
│   │   │       └── LessonItem (multiple)
│   │   ├── Instructor
│   │   ├── Reviews
│   │   │   └── ReviewCard (multiple)
│   │   └── PurchaseSection
│   │
│   ├── Lesson (/courses/[id]/lessons/[lessonId])
│   │   ├── VideoPlayer
│   │   │   ├── VideoControls
│   │   │   └── CaptionSelector
│   │   ├── LessonContent
│   │   ├── LessonResources
│   │   ├── LessonSettings
│   │   │   ├── AutoPlayToggle
│   │   │   └── SaveProgressToggle
│   │   └── QASection
│   │       ├── QuestionForm
│   │       └── QuestionList
│   │
│   ├── Profile (/profile)
│   │   ├── ProfileHeader
│   │   ├── ProfileNav
│   │   └── ProfileContent
│   │       ├── Overview (default)
│   │       ├── Courses
│   │       │   └── PurchasedCourseCard (multiple)
│   │       ├── Progress
│   │       ├── Wishlist
│   │       └── Settings
│   │           ├── AccountSettings
│   │           ├── PreferenceSettings
│   │           └── NotificationSettings
│   │
│   └── Admin (/admin)
│       ├── AdminHeader
│       ├── AdminNav
│       └── AdminContent
│           ├── Dashboard (default)
│           │   ├── AnalyticsCards
│           │   ├── RevenueChart
│           │   └── PopularCoursesTable
│           ├── Courses
│           │   ├── CourseTable
│           │   └── AddCourseButton
│           ├── Lessons
│           │   ├── LessonTable
│           │   └── AddLessonButton
│           ├── Users
│           │   └── UserTable
│           └── Settings
│               └── AdminSettingsForm
│
├── Modal Container (rendered conditionally)
│   └── Modal (multiple, based on state)
│       ├── ModalHeader
│       ├── ModalBody (dynamic content)
│       └── ModalFooter
│
├── Toast Container
│   └── Toast (multiple, based on state)
│
└── Footer
    ├── FooterLinks
    ├── SocialMedia
    └── Copyright
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 1: Client-Side Security                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - Environment variable validation (utils/security/envValidation.ts)      │  │
│  │ - Input sanitization (utils/security/sanitization.ts)                    │  │
│  │ - Form validation (utils/validators.ts)                                  │  │
│  │ - HTTPS enforcement                                                       │  │
│  │ - XSS prevention (React automatic escaping)                              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Layer 2: Transport Security                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - HTTPS/TLS 1.3                                                          │  │
│  │ - Secure cookies (httpOnly, secure, sameSite)                            │  │
│  │ - Security headers (middleware.ts)                                       │  │
│  │   • Content-Security-Policy                                              │  │
│  │   • X-Content-Type-Options: nosniff                                      │  │
│  │   • X-Frame-Options: SAMEORIGIN                                          │  │
│  │   • X-XSS-Protection: 1; mode=block                                      │  │
│  │   • Referrer-Policy: strict-origin-when-cross-origin                     │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Layer 3: Server-Side Security                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - API request validation (middleware.ts)                                 │  │
│  │ - Content-Type validation                                                │  │
│  │ - Payload size limits (10MB max)                                         │  │
│  │ - Firebase Admin SDK (server-side only)                                  │  │
│  │ 🚨 NEEDS: Rate limiting, audit logging                                   │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Layer 4: Authentication & Authorization                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - Firebase Authentication (email/password)                               │  │
│  │ - JWT token verification                                                 │  │
│  │ - Role-Based Access Control (user/admin/super_admin)                     │  │
│  │ - Permission validation (utils/firebase/adminAuth.ts)                    │  │
│  │ 🚨 NEEDS: Replace hardcoded admin emails with Firestore roles           │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Layer 5: Data Security                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - Firestore Security Rules (firestore.rules)                             │  │
│  │   • Public read for active courses                                       │  │
│  │   • Authenticated write for reviews                                      │  │
│  │   • Owner-only read for purchases                                        │  │
│  │   • Admin-only write for courses/lessons                                 │  │
│  │ - Storage Security Rules (storage.rules)                                 │  │
│  │   • Public read for course media                                         │  │
│  │   • Authenticated upload for user content                                │  │
│  │   • Admin-only for system files                                          │  │
│  │   • File size and type validation                                        │  │
│  │ 🚨 NEEDS: Data encryption at rest, secure cache encryption              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Caching Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CACHING SYSTEM                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Level 1: Memory Cache (React Context)                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - In-memory state (AppContext)                                           │  │
│  │ - Fast access, no I/O                                                    │  │
│  │ - Lifetime: Component lifecycle                                          │  │
│  │ - Storage: courses, lessons, reviews, user data                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Level 2: Browser Storage (localStorage)                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ - Optional persistent cache                                              │  │
│  │ - Configurable TTL (default 5 minutes)                                   │  │
│  │ - Automatic expiration                                                   │  │
│  │ - Storage: User preferences, theme, bookmarks                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                          │
│  Cache Management                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ Functions:                                                               │  │
│  │ - clearCache(key?) → Clear specific or all cache                         │  │
│  │ - getCacheStatus(key) → Get cache state (idle/loading/success/error)    │  │
│  │ - generateCacheKey() → Generate unique cache keys                        │  │
│  │ - isCacheExpired() → Check TTL expiration                               │  │
│  │                                                                          │  │
│  │ Cache Options:                                                           │  │
│  │ - ttl: Time to live (milliseconds)                                       │  │
│  │ - persist: Enable localStorage persistence                               │  │
│  │ - cacheKey: Custom cache key                                            │  │
│  │ - forceRefresh: Bypass cache                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: October 19, 2025  
**For**: Next agent in development workflow

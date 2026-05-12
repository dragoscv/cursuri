# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.0] - 2026-05-12

### Removed

- **Dead components deleted**: `components/FeaturedCoursesSection.tsx`
  (138 lines), `components/RecommendedCoursesSection.tsx` (182 lines),
  `components/InstructorHighlightsSection.tsx` (75 lines). Audit confirmed
  none of these were imported anywhere in the app — pure dead weight.
  RecommendedCoursesSection's logic was already mirrored inline inside
  `Home/LatestLessonsSection.tsx` (which is the actually-mounted version).

### Changed

- **`Home/LatestLessonsSection.tsx`**: replaced the bare `<h2>` heading
  block with the shared `<SectionHeading>`. Section background now
  `editorial-surface` with a top gold rim divider — matches the
  StatisticsSection / WhyChooseUs / LearningPath language. Body content
  (the lesson list + recommended sidebar with all its data fetching)
  intentionally left alone — it's solid.

- **`Home/SubscriptionSection.tsx`**: same treatment. Removed the two
  large blur-orb backgrounds (primary + secondary at 100–120px blur
  radius across 400–500px ellipses) that blew out the editorial calm.
  Removed the duplicated `t('title')` between the pill badge and the
  display headline (the same bug pattern we fixed in WhyChooseUs and
  LearningPath at v0.8.0). Now uses `<SectionHeading>` with proper
  `subscription.eyebrow` key.

- **`AvailableCoursesSection.tsx`**: removed two hardcoded English
  strings (`eyebrow="Catalog"` and the `description="Browse every
available course…"` literal) — was breaking the RO experience. Both
  now route through `useTranslations('home.availableCourses')` with new
  `eyebrow` and `description` keys.

### Added

- New i18n keys (EN + RO parity): `subscription.eyebrow`,
  `home.latestLessons.eyebrow`, `home.availableCourses.eyebrow`,
  `home.availableCourses.description`.

## [0.8.0] - 2026-05-12

### Added

- **`<SectionHeading>`** shared primitive
  (`components/shared/SectionHeading.tsx`) — unified eyebrow + display
  title + subtitle block, used by all four redesigned home sections.
  Eyebrow is the new editorial signature: 11px, semibold, 0.22em tracking,
  uppercase, primary color.
- New i18n keys (EN + RO parity): `home.whyChooseUs.eyebrow`,
  `home.techStack.eyebrow`, `home.learningPath.eyebrow`.

### Changed

- **WhyChooseUsSection rewritten** (61 → 56 lines, plus 34-line
  `FeatureCard.tsx` deleted and inlined). Editorial surface background,
  proper eyebrow (was duplicating `t('title')` as both badge and headline
  — a real bug, not just polish), unified card styling, motion via
  `Reveal` + `Stagger` + `fadeUp`.

- **TechStackSection rewritten** (51 → 60 lines, plus 40-line
  `TechItem.tsx` deleted and inlined). Added eyebrow, dropped per-card
  spring delay variants in favor of shared `Stagger`. Tighter card
  paddings, tabular icon rail.

- **LearningPathSection rewritten** (91 → 76 lines). Same headline
  duplication bug as WhyChooseUs fixed. Step number now an oversized
  faded numeral in the corner (editorial flourish) instead of a colored
  badge. Connector dot rail uses a 1px gold-fade line.

- **StatisticsSection rewritten** (283 → 178 lines). Removed:
  `useScroll` parallax `y` that was computed but never applied; pre-baked
  `particles` array of 20 floating dots that was computed but never
  rendered; deterministic `pseudoRandom` helpers tied to those particles;
  background blur orbs; per-card hover boxShadow object. Kept all live
  data fetching (course count, total content hours, average review
  rating, admin-only paying-user count via `customers/*/payments`
  collectionGroup query). KPI cards now use clamp display numerals with
  tabular-nums and uppercase tracking labels — reads like a financial
  report, not a marketing dashboard.

### Removed

- `components/WhyChooseUsSection/FeatureCard.tsx` (inlined).
- `components/TechStackSection/TechItem.tsx` (inlined).

## [0.7.0] - 2026-05-12

### Changed

- **Header refinement** (`components/Header.tsx`). Calmed the scrolled
  state to match the new editorial language:
  - Removed the multi-color shimmer hairline (it referenced a
    `header-shimmer` keyframe that didn't actually exist — dead animation).
  - Removed the radial primary-color glow halo that bled across the page.
  - Replaced with a single 1px gold `cinematic-rim-divider` that fades in
    only on scroll, plus a clean card-border hairline.
  - Backdrop opacity raised slightly (0.85 vs 0.75) so the title text
    behind never bleeds through.

- **CallToActionSection rewritten** (`components/CallToActionSection.tsx`,
  184 → 165 lines):
  - Removed full-bleed indigo → violet → pink gradient that conflicted with
    the editorial surface.
  - Removed dead `gridOpacities` and `floatingOrbs` memos (computed but
    never rendered — pure waste).
  - Removed duplicate-labelled buttons (both said `t('button')`).
  - New treatment: a single bordered card sitting on the editorial surface
    with an inset gradient wash, top gold rim, eyebrow + display headline
    - dual CTAs (primary inverted + ghost secondary going to `/book-a-call`).
  - Trust badges now an inline list with a single emerald check icon
    each, separated by elegant middle dots.

### Added

- New i18n keys `home.cta.{eyebrow,secondaryButton}` in EN + RO with parity.

## [0.6.0] - 2026-05-12

### Changed

- **Hero v2 — editorial split layout** (`components/HeroSection.tsx`).
  Reverted the v0.5 cinematic atmosphere (animated starfield + glow orbs)
  per user feedback. The new hero is a calm, premium-editorial spread
  (Stripe / Vercel / Linear feel):
  - Background is intentionally **static**: a soft top-radial wash + an
    ultra-faint masked SVG grid + a 1px gold rule at the very top.
  - Left 7/12 column: oversized typographic statement (clamp 2.75 → 5.5rem,
    tracking-[-0.025em]), gold hand-drawn underline accent that draws in
    once, three CTAs (primary inverted, secondary outlined, ghost), mentor
    1-on-1 link, and a refined social-proof + rating row.
  - Right 5/12 column: new **`<CodeTyper>`** widget — a fake editor with
    traffic lights, line numbers, status bar, and a typing animation that
    cycles through 3 snippets (`prompt.md`, `agent.ts`, `workflow.yml`).
    Pauses when offscreen, freezes the first snippet under reduced motion,
    no external libraries.
  - Removed Hero atmosphere primitives entirely (`Starfield2D`,
    `GlowOrb2D`, `HeroAtmosphere`).

- **Theme system collapsed from 8 variants to 3 curated themes**
  (`app/globals.css`, `types/index.d.ts`, `components/AppContext.tsx`,
  `components/Profile/ThemeSelector.tsx`):
  - `cinematic` — indigo / violet (default)
  - `ivory` — warm amber on parchment (editorial premium)
  - `terminal` — emerald on charcoal (developer-bold accent)
  - Removed: `modern-purple`, `black-white`, `green-neon`, `blue-ocean`,
    `brown-sunset`, `yellow-morning`, `red-blood`, `pink-candy`.
  - `AppContext` migration: legacy color-scheme values stored in user
    preferences are coerced to `cinematic` at runtime, so existing users
    aren't broken.
  - `ThemeSelector` redesigned as 3 large preview cards with descriptions
    instead of an 8-tile grid.

### Added

- `.editorial-surface`, `.editorial-grid`, `@keyframes cursor-blink`,
  `.animate-cursor-blink` design utilities in `globals.css`.
- New i18n keys `profile.themes.{cinematic,cinematicDescription,ivory,
ivoryDescription,terminal,terminalDescription}` in EN + RO with parity.
- `components/Home/CodeTyper.tsx` — typed-snippet editor primitive,
  reusable wherever we need a "live code" demo.

### Removed

- `components/CacheStatus.tsx` — unused; the `CacheStatus` _type_ in
  `types/index.d.ts` is unaffected.
- `components/three/` directory and `components/Home/HeroAtmosphere.tsx`
  — R3F-replacement Canvas/SVG primitives no longer needed.

## [0.5.0] - 2026-05-12

### Added

- **Cinematic AI-lab design language (Batch 1: foundation + hero + footer)**.
  First batch of a multi-batch heavy redesign of the entire site.

  **New design tokens** (`app/globals.css`):
  - OKLCH-based cinematic atmosphere tokens — deep indigo base in dark,
    parchment-ivory in light, both readable per WCAG AA.
  - Rim-light (gold) and cool counter-light tokens for 3-point feel.
  - `--shadow-cinematic`, `--shadow-glow-primary`, `--shadow-glow-rim`
    semantic shadows.
  - Utility classes: `.cinematic-atmosphere`, `.cinematic-starfield-static`,
    `.cinematic-rim-divider`, `.orb-breath` (all reduced-motion aware).

  **New motion primitives** (`components/motion/`):
  - `presets.ts` — shared `cosmic`/`mystic`/`drift` easings, `fadeUp`,
    `fadeIn`, `scaleIn`, `stagger`, `heroOverture` choreography.
  - `<Reveal>` — entrance primitive with reduced-motion fallback.
  - `<Stagger>` — sequenced-children wrapper.
  - `<TiltCard>` — pointer-driven 3D tilt with directional highlight.

  **New atmosphere primitives** (`components/three/`):
  - `<Starfield2D>` — Canvas 2D drifting starfield (220 stars,
    5-color palette, ~3 KB, prefers-reduced-motion safe).
  - `<GlowOrb2D>` — SVG emissive orb with breathing animation.
  - (Canvas 2D + SVG chosen over R3F to avoid the JSX-intrinsic-element
    type augmentation breaking HeroUI's complex prop unions.)

  **Hero redesign** (`components/HeroSection.tsx` — full rewrite):
  - Removed: DOM-particle effect system (10–30 spawned `<div>`s), inline
    blur-orb gradient blobs, Unsplash photo, hard-coded English fallback
    "GitHub Copilot Pro included" string.
  - Added: lazy-loaded `<HeroAtmosphere>` (Canvas starfield + 3 glow
    orbs at calibrated thirds), 7/12 + 5/12 rule-of-thirds grid,
    `clamp(2.5rem,6vw,5.25rem)` display type with rim-lit gradient on
    line 2, 3-act entrance choreography (atmosphere → copy → console),
    glass console panel on the right showing 6 AI-tool "specimens" with
    cool/warm tone variants, refined social-proof + rating row.
  - All strings via `useTranslations('home.hero')`. New keys
    (`console.title`, `console.specimens`, `console.tools`, `loading`)
    added to both `messages/en/home.json` and `messages/ro/home.json`
    with full parity.

  **Footer redesign** (`components/Footer.tsx` — full rewrite):
  - Opens with `cinematic-rim-divider` (gold-rim 1px line) — the closing
    credits motif.
  - 4-column grid with eyebrow labels, brand block including breathing
    "Live" status orb, gradient wordmark.
  - Legal block preserves every Romanian compliance link (ANPC, ODR,
    GDPR, DSA, cookie, refund, legal notice). External links surface a
    subtle `↗` glyph on hover.
  - Refined social buttons with on-hover glow shadow.
  - New i18n key `common.footer.statusLive` added in both languages.

### Changed

- `components/HeroSection.tsx` reduced from ~800 lines to ~430.
- All entrance animations now route through the shared motion presets,
  so every section reveal feels like the same film.

### Removed

- `components/HeroSection.tsx`: DOM-particle `useEffect`, `gridOpacities`
  / `nodePoints` / `connectionLines` dead memos, Unsplash hero photo,
  hard-coded English copilot fallback string.

## [0.4.4] - 2026-05-12

### Fixed

- **Wasted hero-image preload on every route**. `app/preload-links.tsx`
  emitted a hand-rolled `<link rel="preload" as="image">` for the
  homepage hero from the root layout, so the preload fired on every
  page (catalog, course, lesson, profile, ...) even though the image
  only renders on the home page hero, and only at the `lg` breakpoint.
  The custom `imageSrcSet` (640w/1080w) also didn't match the `sizes=
"50vw"` srcset that Next.js generates for the actual `<Image>`, so
  the browser warned "preloaded but not used within a few seconds" on
  every load. Removed the hand-rolled preload entirely — `<Image
priority fetchPriority="high">` in `HeroSection.tsx` already emits a
  correctly matched preload, scoped to the home page only.
- **Listener leak on lesson pages**. `LessonDetailComponent.tsx` and
  `ClientLessonWrapper.tsx` both called `getCourseLessons(courseId)`
  from `useEffect` without awaiting the returned `Promise<unsubscribe>`
  or returning a cleanup. Each lesson page visit added a permanent
  Firestore `onSnapshot` listener that never released. Converted both
  call sites to `{ realtime: false }` (one-shot `getDocs`) — lessons
  don't change while a user reads them, and the one-shot path returns
  a no-op unsub so leaks are impossible.

## [0.4.3] - 2026-05-12

### Fixed

- **Homepage Firestore listener explosion**. The anonymous homepage was
  opening ~30 simultaneous Firestore `Listen` long-poll channels — roughly
  4 per visible course card (`Course.tsx` subscribed to lessons + reviews
  for every catalog tile) plus `FeaturedReviews` subscribing to every
  course's reviews again, plus base AppContext listeners. On flaky mobile
  networks the concurrent streams competed for connection slots and
  produced "content isn't loading" behaviour. Added a `realtime?: boolean`
  option to `CacheOptions`; when `false`, `getCourseLessons` and
  `getCourseReviews` use a one-shot `getDocs` HTTP read instead of
  `onSnapshot`. `Course.tsx` (catalog card) and `FeaturedReviews.tsx` now
  opt in to one-shot mode. Expected to drop the homepage channel count
  from ~30 to <10.
- **Listener leak in `Course.tsx` and `FeaturedReviews.tsx`**. Both
  components called `getCourseReviews`/`getCourseLessons` (which return
  `Promise<unsubscribe>`) from `useEffect` without ever awaiting the
  promise or returning a cleanup, so every mount permanently leaked a
  Firestore listener. Cleanup is now properly wired with a `cancelled`
  flag pattern so listeners stop on unmount even with the existing
  `onSnapshot` callers.

## [0.4.2] - 2026-05-12

### Fixed

- Auth flow no longer blocks the UI on slow side-effects. `onAuthStateChanged`
  now sets `user` and clears `authLoading` synchronously; audit POSTs, login
  streak updates, the `adminAuth` dynamic import, and Firestore profile reads
  run as fire-and-forget background tasks. Audit `fetch` calls use
  `AbortController` (4 s timeout) + `keepalive`, so a hung backend can no
  longer freeze the app for >60 s on flaky mobile networks.
- `NotFoundError: The object can not be found here.` on `removeChild` while
  navigating courses/lessons. Removed three useless `<AnimatePresence mode="wait">`
  wrappers around static-keyed `motion.div` children inside HeroUI `<Tab>`
  panels in `components/Course/CourseDetails.tsx`. They deferred exit
  animations and made framer-motion try to detach nodes from already-removed
  parents during tab/route teardown.
- Hardened the root layout against browser auto-translation, which is a
  known cause of the same `removeChild` crash (especially iOS Safari +
  `ro-RO`). Added `<meta name="google" content="notranslate" />` and
  `translate="no"` on `<body>`.

### Added

- `DebugErrorPanel` now captures **app version**, **online status**, and
  **network info** (`effectiveType`, `downlink`, `rtt`) in the copyable
  report — exactly what's needed to diagnose "stuck loading" user reports.
  Added an **Email support** mailto button with the markdown report
  prefilled.
- `NEXT_PUBLIC_APP_VERSION` is now auto-derived at build time in
  `next.config.js` from `VERCEL_GIT_COMMIT_SHA` → `npm_package_version` →
  local `git rev-parse --short HEAD` → `'dev'`. No Vercel project setting
  required; the value is inlined into the client bundle.
- Sentry telemetry: a `auth-stuck-loading` warning is captured when
  `authLoading` stays true for more than 15 s, so future hangs leave a
  traceable fingerprint.

## [0.4.1] - 2026-05-11

### Fixed

- Admin role no longer gets silently wiped to `user` on transient Firestore
  read failures during sign-in. `getUserProfile()` now throws on read errors
  and returns `null` only when the document is verified to not exist.
  `createOrUpdateUserProfile()` only refreshes auth-derived fields
  (`email`, `displayName`, `photoURL`, `emailVerified`) on existing docs and
  never touches `role`, `permissions`, `isActive`, or `createdAt`.
- The auth handler in `AppContext` bails out on profile read errors instead
  of recreating the profile, and no longer resets `isAdmin` to `false` on
  transient errors.
- `ClientLessonWrapper` waits for `authLoading` to settle before deciding
  access, so admins no longer briefly see "Access denied" while the auth
  handler is still loading the user profile.
- Add missing `PublicConfig` and `AdminAnalytics.totalSalesCount` type
  members, plus `refreshProducts.recurring`, to fix TypeScript build errors.
- Resolve pre-existing `no-useless-escape` lint errors in
  `components/Lesson/LessonForm.tsx` and `utils/security/envValidation.ts`,
  and silence `no-constant-binary-expression` on the intentionally-disabled
  audio block in `LessonAIContent`.

## [0.4.0] - 2026-05-08

### Added

- Husky-based pre-commit and pre-push checks at `.husky/pre-commit` and
  `.husky/pre-push`. Pre-commit runs `lint-staged`, project-wide
  `tsc --noEmit`, `eslint .` (errors block, warnings are reported), and the
  new version + CHANGELOG guard. Pre-push runs the full `next build`.
- `scripts/typecheck.mjs` — human-readable wrapper around `tsc --noEmit`
  with a leading `✓`/`✖` summary suitable for hooks.
- `scripts/check-version-bump.mjs` — when application source is staged
  (`app/`, `components/`, `utils/`, `hooks/`, `services/`, `config/`, `i18n/`,
  `messages/`, `types/`, `proxy.ts`, `next.config.js`, `tailwind.config.ts`),
  requires a `package.json` version bump and a matching `## [X.Y.Z]` entry
  in `CHANGELOG.md`. Bypass with `SKIP_VERSION_CHECK=1` (not recommended).
- New npm scripts: `typecheck`, `lint:strict`, `check:version`, `precommit`.
- `CHANGELOG.md` initialized with prior `0.1.0`–0.4.0` entries.

### Changed

- `eslint.config.js` excludes `scripts/**/*.mjs` so Node-only helper scripts
  don’t trip the project’s TypeScript-aware lint rules.

### Added

- Comprehensive activity logging across the platform.
  - `utils/clientAudit.ts` unified client helper that posts auth and activity
    events to `/api/audit/auth-event`.
  - Login, registration, and all five logout sites now produce audit entries.
  - `AppContext.markLessonComplete` fires lesson completion analytics, Firestore
    counters, per-user activity, and detects full-course completion.
  - `SearchBar` reports debounced search queries (>= 2 chars) to GA and
    Firestore.
- Server-side audit logging for Stripe webhooks
  (`/api/stripe/github-webhook`, `/api/stripe/meetings-webhook`).
- New audited admin endpoints: `PATCH /api/admin/users/[userId]`,
  `/api/admin/github-accounts` (POST/PATCH/PUT/DELETE), and
  `PATCH /api/admin/meetings/[id]`.
- New per-user activity timeline:
  `GET /api/admin/users/[userId]/activity` plus
  `components/Admin/UserActivityTimeline.tsx`, surfaced as a new tab in
  `UserDetailView`.

### Changed

- `UserDetailView` profile saves now go through the audit-logged PATCH
  endpoint instead of writing Firestore directly.

## [0.2.0] - 2026-05-08

### Added

- Tier-based subscriptions split into Courses and Copilot plans.
- Intro offer support via Stripe coupons and promotion codes.
- Comprehensive legal coverage: terms, privacy, GDPR, cookies, refund,
  legal notice, and DSA.
- `config/legal.ts` as the single source of truth for operator identity.

### Changed

- Footer and cookie banner copy updated for ANPC/ODR compliance.
- Operator display reduced to first/middle name only — no address or CUI.

## [0.1.0] - 2025-XX-XX

### Added

- Initial public release of the StudiAI course platform.

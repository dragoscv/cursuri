# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.18.0] - 2026-05-12

### Changed — full editorial pass on the homepage

Brought every above-the-fold homepage section in line with the same
editorial language used on the lesson, legal and course-detail surfaces.
Killed the remaining purple→pink→amber rainbow accents, replaced HeroUI
`Button color="primary"` instances with native `<button>`/`<Link>` pills
(so className actually wins over data-attribute styles), and removed the
backdrop-blur translucent card chrome in favor of flat bordered cards.

- `HeroSection.tsx`: the second display headline line now renders as
  solid `text-[color:var(--ai-foreground)]` (gradient text removed); the
  three primary CTAs are now native pills — solid foreground "Începe să
  Înveți →", ghost foreground "Explorează Cursurile AI", muted ghost
  "Alătură-te Discord". The Copilot eyebrow chip's "NOU" pill is now
  amber on background, and the `bookACall` hover goes to amber. Dropped
  the now-unused HeroUI Button import.
- `CallToActionSection.tsx`: replaced the two HeroUI Buttons with
  matching native pills (solid foreground + ghost border), and swapped
  the primary radial wash for an amber-only wash + amber eyebrow.
- `FeaturedReviews.tsx`: the eyebrow micro-copy is now solid
  `text-amber-500` (no gradient text), and the "View all" CTA is a
  native `<Link>` pill.
- `StatisticsSection.tsx`, `WhyChooseUsSection/index.tsx`,
  `TechStackSection/index.tsx`: stat / value / tech cards now flat
  `bg-[color:var(--ai-card-bg)]` with amber hover-border (no
  backdrop-blur, no primary tint). Icon tiles on Why/Tech use a thin
  bordered chip with amber glyph.
- `LearningPathSection.tsx`: step numerals and connector lines now use
  amber instead of primary.
- `Home/LatestLessonsSection.tsx`: hover/focus background, fallback
  thumbnail icon, hover title color, "subscribe to watch" pill and
  recommended-card "view details" link all moved off primary onto amber
  / foreground.
- `Subscriptions/SubscriptionPlans.tsx`: the two price displays no
  longer use `bg-clip-text` gradient text; intro price is solid emerald,
  regular price is solid foreground.

### Changed — error panel editorial pills

`shared/DebugErrorPanel.tsx`: the four action buttons (Try again,
Reload, Go home, Email support) are now editorial pills — solid
foreground primary + three ghost-bordered secondaries — replacing the
previous tinted color variants.

## [0.17.1] - 2026-05-12

### Fixed — course page crash on tab switching

The four `<motion.span>` tab underlines in `Course.tsx` shared
`layoutId="tab-indicator"` so Framer Motion ran a shared-layout
animation between them when the user switched tabs. Under React 19 that
pattern crashes with `NotFoundError: Failed to execute 'removeChild' on
'Node': The node to be removed is not a child of this node.` Replaced
all four with plain static `<span>` underlines.

## [0.17.0] - 2026-05-12

### Changed — course detail page (Conținut tab) editorial pass

After the lesson and legal-page passes, the `/courses/[id]` route still
rendered the purple primary gradient throughout its content tab. Brought
the page in line with the editorial design language:

- `Course.tsx` tabs (Conținut / Prezentare Generală / Recenzii /
  Resurse): active state and underline are now solid amber instead of
  the primary-to-secondary gradient; selected text uses the solid
  foreground token.
- `CourseContent.tsx`:
  - "Your Progress" and "Some content locked" cards now wear the
    editorial card chrome (border + 3px gold left rail, no gradient,
    no backdrop-blur).
  - Module / additional-lessons / flat-list headers now use the gold
    left rail; the lessons-count chip is a muted bordered pill instead
    of a purple-tinted fill.
  - `LessonItem` was rebuilt: gold left rail for completed lessons,
    foreground hover → amber on the title, no ring/ribbon flourishes,
    badges are uppercase eyebrow-style bordered pills.
- `LessonsList.tsx` (used elsewhere in the app): same editorial chrome
  for the list container, header, and lesson cards.

## [0.16.3] - 2026-05-12

### Fixed — lesson-page button regressions

Multiple lesson-page buttons that were patched in v0.15.0 still rendered
the HeroUI primary purple gradient because the underlying `<Button>`
component's `color` and `variant` props win over `className`. Replaced
with native `<button>` elements wearing the editorial pill template:

- `LessonNavigation`: previous / back-to-course / next-lesson buttons.
- `Notes`: hide-toggle pill (now ghost text) and Save Notes pill.
- `AskQuestionForm` / `AnswerForm`: cancel + submit pair.

## [0.16.2] - 2026-05-12

### Fixed

- Header on course/lesson pages between md (768) and lg (1024) had the
  desktop nav links and the in-brand breadcrumbs colliding in the same
  row. The desktop nav now waits until `lg` on those routes, and the
  mobile breadcrumbs row + brand-pinned breadcrumbs now share the same
  `lg` cutoff so exactly one breadcrumb surface is visible per width.
- `OfflineButton`: the HeroUI `default` / `bordered` Button rendered
  with the framework's primary purple, breaking the lesson hero. Now a
  native ghost pill (solid-foreground border, hover invert) with an
  emerald state when the lesson is downloaded.
- Missing i18n key `common.videoPlayer.retry` (en + ro) that surfaced
  as a raw `common.videoPlayer.retry` label inside the video error
  fallback.

## [0.16.1] - 2026-05-12

### Fixed

- `LessonChaptersPanel`: removed the `AnimatePresence` wrapper around the
  chapters list. Children carried stable `c.id` keys + `exit` animations,
  which under React 19 / framer-motion 12 raced the parent unmount on
  navigation and crashed the page with `NotFoundError: Failed to execute
'removeChild' on 'Node'`. Same root cause as `ce88dce`. Entrance
  animation on each `motion.li` is preserved; only the redundant exit
  choreography was dropped.

## [0.16.0] - 2026-05-12

### Changed — legal pages editorial pass

Full pass over the seven legal surfaces (privacy, terms, cookies,
refund, GDPR, legal-notice, DSA). All pages share a single
`PolicyPage` shell, so the entire chain shifts in one move.

- `PolicyPage`: dropped the wrapping `Card` + `CardBody` chrome,
  `shadow-xl`, and the gradient `bg-clip-text` headline. Container
  narrowed to a readable `max-w-3xl` editorial column.
- New header: thin amber leader rule + gold eyebrow (`Legal`),
  solid-foreground display headline at editorial scale
  (`text-3xl md:text-5xl`), `tabular-nums` last-updated stamp.
- New article surface: themed Tailwind Typography (`prose-neutral` /
  `prose-invert`) with editorial overrides — `h2` carries a 3px gold
  left rail, `h3` is restrained, paragraphs and list items inherit the
  muted token, links use a gold underline accent.
- New related-docs nav: replaced the centered link strip with a top-bordered
  section, eyebrow label, and a flex grid of bordered pill chips. "Back to
  home" promoted to a solid-foreground pill.
- `PolicyContent`: removed hard-coded heading classes from
  `PolicySection` / `PolicySubsection` so the prose theme drives
  hierarchy. Lists gained `space-y-1.5`; paragraphs gained
  `leading-relaxed`.

### Added — i18n (en + ro)

- `common.policyEyebrow` ("Legal" / "Legal")
- `common.relatedLegal` ("Related documents" / "Documente conexe")

## [0.15.0] - 2026-05-12

### Changed — lesson page editorial pass

Full editorial sweep across the student lesson surface
(`/courses/[id]/lessons/[lid]`) and every panel it composes.

- `LessonContent`: dropped `GradientCard` hero + radial backdrop, gradient
  h1, four HeroUI `Chip` color slots, and the gradient quiz CTA. Now a
  flat bordered card with a 2px gold top accent rule, solid-foreground
  headline, custom bordered status pills (emerald / rose / amber /
  neutral), and a solid-foreground pill quiz button. Loading skeleton,
  navigation, content, and quiz cards all dropped `shadow-xl` +
  `backdrop-blur`.
- `ClientLessonWrapper`: access-denied + render-error gradient buttons →
  solid-foreground / ghost pills; card `shadow-lg` → flat rounded-2xl.
- `LessonHeader`: gradient panel + gradient h1 + three HeroUI chips →
  flat bordered card with gold top rule, solid-foreground title, custom
  bordered status pills.
- `LessonAIContent`: dropped `backdrop-blur` / `shadow-xl` + gradient
  header. AI badge gradient tile → bordered amber pill. Hardcoded
  English ("Lesson briefing", "Listen to the audio", "Download MP3", "In
  short", "What you'll learn", "Read the full transcript") moved to
  `lessons.aiContent.*` (en + ro).
- `LessonChaptersPanel`: dropped `shadow-xl` / `backdrop-blur` + gradient
  header. Now flat with a 3px gold rail. "Chapters" + section count
  i18n'd via `lessons.chapters.*`.
- `LessonAIProcessor` + `LessonAIProgressModal`: AI tile gradient →
  bordered amber pill. Progress bar gradient → gold (failed = rose).
- `AIFillButton`: enabled state gradient → flat amber.
- `ResumeVideoModal`: progress bar gradient → gold; Resume + Start
  buttons → solid-foreground / ghost pills (rounded-full).
- `LessonSettings`: `backdrop-blur` + `shadow-lg` → flat rounded-2xl.
  Mark Complete gradient HeroUI Button → solid-foreground pill.
- `LessonNavigation`: header gradient → flat + 3px gold rail. Next
  Lesson gradient + scale-on-hover → solid-foreground pill. Active
  list-item primary→secondary gradient + ring → amber-tinted background.
- `Notes` / `LessonNotes` / `QASection`: card chrome flattened. Header
  gradient → flat + 3px gold rail.
- `Notes` / `AskQuestionForm` / `AnswerForm`: gradient submit buttons →
  solid-foreground pills.
- `QuestionItem`: HeroUI success Chip → bordered emerald pill.
- `LessonDetailComponent` (legacy alt container): four `shadow-lg` cards
  flattened; off-palette indigo / blue / green buttons → editorial pills.

### Added — i18n (en + ro)

- `lessons.lessonsDone`
- `lessons.chapters.{title,sectionsCount}`
- `lessons.aiContent.{briefing,listenAudio,downloadMp3,inShort,whatYouLearn,readTranscript}`

### Out of scope

- `LessonForm` (admin editor) and the `Video/*` media chrome are
  intentionally left in place; admin surfaces and media controls follow
  a different visual contract.

## [0.14.0] - 2026-05-12

### Changed — course detail page editorial pass

Full pass over the `/courses/[courseId]` chain. The detail page was the
most maximalist surface left: gradient text headlines, gradient stat
pills, gradient module headers, gradient buy button with a shimmer
overlay + animated corners + glow blur + scale-1.03 hover, and 10
identical gradient icon tiles with `group-hover:scale-110`.

- **`CourseHeader`**: dropped `GradientCard` wrapper + radial `radial-gradient` decorative backdrop. Replaced gradient-text
  `text-extrabold bg-clip-text` headline with solid foreground
  `font-semibold tracking-[-0.02em]`. Replaced HeroUI `<Chip
color="warning|success|primary|secondary" variant="flat">` badges with
  flat bordered `<Pill>` (amber for featured/new, neutral for level/cert).
  StatPill now uses a flat amber icon (no gradient tile background) +
  hover-darken border. Rating block uses solid foreground tabular-nums
  instead of gradient text.

- **`CourseDetails`**: dropped HeroUI `Card` `shadow-lg backdrop-blur-sm`
  in favor of flat bordered card. Tab indicator switched from
  `from-[--ai-primary] to-[--ai-secondary]` 0.5px line with `width: 0%
→ 100%` animation to the standard 2px gold underline
  `from-amber-400 to-amber-500` (matches `/courses` filter chips and
  Header navbar). Cleaned up the static-modules fallback: dropped
  `bg-gradient-to-r ...card-bg/50 to /80 border-l-4 border-primary`
  module header in favor of a flat 3px gold left rail + neutral fill,
  and replaced `shadow-sm hover:shadow-md` with border-color hover.

- **`CourseEnrollment`** (largest cleanup):
  - Top success bar `h-1.5 from-success via-primary to-success` and top
    animated `background-animate` rainbow bar both replaced with a calm
    2px gold accent rule.
  - Header: HeroUI `Chip color="success" variant="flat"` enrollment
    status replaced with bordered emerald uppercase pill. Check icon
    no longer wrapped in a `bg-success/10` rounded chip.
  - Progress card: dropped `bg-gradient-to-br ...success/10
via-primary/5 to-success/10 backdrop-blur-sm shadow-sm hover:shadow-md`
    in favor of a flat bordered panel.
  - **Continue button**: removed `whileHover scale-1.03`, `blur-lg` glow
    overlay, and gradient `from-success to-primary py-6 shadow-md
hover:shadow-lg`. Now a solid foreground pill (h-12, rounded-full,
    opacity-only hover).
  - **Buy button** (the worst offender): removed the entire wrapper
    chrome — `whileHover scale-1.03`, animated corner brackets, shimmer
    overlay (`absolute -inset-[200%] animate-[shimmer_5s_linear_infinite]`),
    rotate-12 cart icon, tracking-wider on hover, gradient text shadow.
    Now a solid foreground pill (matches Continue, the homepage CTAs,
    and the rest of the editorial language).
  - **Loading state**: `LoadingButton` no longer carries
    `bg-gradient-to-r ...primary via-secondary to-primary py-6 shadow-lg`
    — just neutral default.
  - **Discount chip**: `<Chip color="danger" variant="flat">` → bordered
    rose pill matching the new pill system.
  - **Feature icon tiles**: bulk replace via PowerShell on 10 identical
    `w-10 h-10 rounded-xl bg-gradient-to-br ...primary/10 to ...secondary/10
group-hover:scale-110 shadow-sm` instances → flat amber 9x9 icons.
  - **Instructor card**: dropped `bg-gradient-to-br ...primary/5
to ...secondary/5` panel + `bg-gradient-to-r ...primary to ...secondary
text-white` avatar circle in favor of flat bordered panel + neutral
    avatar circle. Hardcoded `"Instructor"` heading now i18n.
  - **Login prompt**: dropped tri-color gradient panel for flat
    bordered panel.
  - **Price text**: gradient `bg-clip-text text-transparent` → solid
    foreground tabular-nums.
  - **Accent line**: thin primary→secondary 0.5px line above benefits
    heading → thin gold 2px line. Heading style changed to gold-style
    eyebrow (`text-[10px] uppercase tracking-[0.18em]`).
  - i18n: added `courses.enrollment.processingPayment` and
    `instructorLabel` (en + ro) — was hardcoded "Processing payment..."
    and `"Instructor"`.

- **`Reviews`** (course detail nested): dropped
  `bg-gradient-to-r ...primary/10 via-secondary/10 to-transparent`
  section headers in favor of flat fill with a 3px gold left rail.
  Submit button gradient + `hover:scale-[1.02]` → solid foreground pill
  (rounded-full). Author avatar circles dropped gradient bg + white
  text → flat bordered initial. Quote-rail accent shifted to amber.

- **`LatestLessonsSection`** (homepage, sidebar course card): removed
  the lingering `hover:shadow-lg hover:shadow-[--ai-primary]/5` and
  `hover:border-[--ai-primary]/40` on the recommended-course card —
  now uses the same neutral border-darken as everywhere else.

### Added — i18n keys (course detail)

- `courses.stats.duration` / `lessonsLabel` / `studentsLabel` /
  `certificateLabel` / `certificateIncluded` / `certificateOnRequest`
  (en + ro) — stat pill labels were hardcoded English.
- `courses.enrollment.processingPayment` (en + ro)
- `courses.enrollment.instructorLabel` (en + ro)

## [0.13.0] - 2026-05-12

### Changed — homepage editorial pass (sub-hero sections)

Audit found most homepage sections (Statistics, TechStack, LearningPath,
WhyChooseUs) already in editorial language. Real offenders were the
pricing band, the reviews band, and the latest-lessons surface.

- **`SubscriptionSection`** (367 → 290 lines): full editorial rewrite.
  Replaced HeroUI `Card` + `border-2 border-[--ai-primary] shadow-2xl`
  with a flat extracted `<PlanCard>` component. Recommended plan now
  marked by a 3px gold left rail (`from-amber-400 to-amber-500`) +
  a gold gradient-text eyebrow — not a floating gradient "Popular" pill
  with white-on-color and `shadow-lg`. Yearly badge dropped to a quiet
  muted eyebrow. Price text now solid foreground tabular-nums (was
  `bg-clip-text text-transparent` gradient — the worst offender). Check
  glyphs flat amber (no rounded color tile background). CTAs now ghost
  pills (h-11, rounded-full, border + hover-fill) for non-recommended
  and a solid foreground pill for the recommended plan — dropping the
  dual gradient backgrounds + `shadow-md hover:shadow-xl
hover:-translate-y-0.5` chrome.

- **`FeaturedReviews`** (header + cards + CTA): swapped pill-shaped
  border badge for the standard gold eyebrow + `text-3xl md:text-5xl
font-semibold tracking-[-0.02em]` headline. Course-type badge moved
  from `bg-[--ai-primary]/8` rounded-lg pill to a calm bordered amber
  uppercase chip. Review cards lose `whileHover y:-6` + `hover:shadow-lg`
  — now just border-color hover. Final "View all" CTA replaced gradient
  primary button with the same solid foreground pill we use elsewhere.

- **`LatestLessonsSection`**: removed the two decorative top/bottom
  fade-gradient overlays and the panel `shadow-sm` — the scroll list now
  just lives inside a clean bordered card.

### Added — i18n keys (no more hardcoded fallbacks)

- `home.reviews.anonymousUser` / `home.reviews.defaultRole` (en + ro)
  — was hardcoded "Anonymous User" / "Course Participant"
- `home.latestLessons.untitledLesson` (en + ro) — was hardcoded
  "Untitled lesson"

## [0.12.0] - 2026-05-12

### Changed — /courses catalog editorial overhaul

User screenshot showed the catalog page still wearing leftover
maximalist chrome: ambient blur blobs, gradient KPI cards in 4 colors,
a full-bleed gradient subscription banner with a bevelled icon tile and
translate-on-hover CTA, a pill-in-pill filter bar with colored icon
boxes, and course cards loaded with emoji-decorated colored badges.
Full editorial pass:

- **`CoursesPage`** (179 → 145 lines): dropped the two `blur-3xl` ambient
  blobs, replaced `<SectionShell>` + `<MetricCard>` quad + `<GradientCard
tone="primary" glow>` with a typographic hero (eyebrow + headline +
  lede) and an inline `<dl>` 4-stat row. Subscription card is now a
  flat panel with a 3px gold accent rail on the left, gold eyebrow,
  calm headline, plain bullet checks, and a ghost-pill CTA that fills
  on hover (no shadow, no translate). Saved 4 levels of wrapper nesting.

- **`CoursesFilter`** (203 → 196 lines): dropped the rounded-2xl outer
  pill chrome with `bg-[color:var(--ai-card-bg)]/80 backdrop-blur-xl`,
  the two colored 40×40 icon boxes (search + filter), and the gradient
  active pill (`from-[color:var(--ai-primary)] to-...`) with shadow.
  Replaced with: native `<input type="search">` with a leading 16px icon,
  flat chip row with a 2px gold underline (animated `layoutId=
"courses-cat-underline"`) for the active category, and calm bordered
  active-filter chips. Mirrors the new NavbarLinks active state.

- **`CoursesList`** (card visuals only): dropped the heavy emoji-laden
  badge colour map (⭐ ✅ 🆕 🔥 🎁 ⏰) for plain amber
  uppercase pills. Difficulty pill compacted (h-6, uppercase, no
  HeroUI Chip). Image overlay gradient lightened (from `from-black/70
via-black/30` to `from-black/60 via-black/10`). Bottom info chips no
  longer sit on `bg-black/50 backdrop-blur` rounded boxes — plain
  white-on-shadow text. Card border now hover-darkens to foreground/40
  instead of jumping to primary/50; dropped `shadow-md/hover:shadow-lg`
  and `whileHover y:-5` (calmer than the editorial language allows).
  Image still does a subtle 1.03 scale on hover for tactility. Bottom
  row now has a price + "View details" link affordance separated by a
  thin top border.

- **`CoursesHeader.tsx`**: deleted (orphan — only `AdminCoursesHeader`
  is referenced anywhere).

### Added — i18n stat labels

- `courses.header.statCourses` / `statLessons` / `statHours` /
  `statRating` in both `en` and `ro`. The previous code used hardcoded
  English ("Lessons", "Hours", "Avg rating") and a hacky
  `tHeader('exploreSubtitle')?.split(' ')[0]` for the first column —
  causing EN/RO mixing on the RO locale.

## [0.11.1] - 2026-05-12

### Fixed — Header bugs from v0.11.0

- **UserDropdown / MobileMenu trapped clicks after closing**: both menus
  used HeroUI Dropdown with `backdrop="opaque"` and a `fixed inset-0
w-screen h-screen` overlay class. After closing, the overlay node
  occasionally lingered and intercepted pointer events on header items
  (search, theme toggle, login button). Switched both to `backdrop=
"transparent"` and removed the custom backdrop class. Outside-click
  still closes the menu via HeroUI's internal logic, no overlay needed.
- **Missing `cursor: pointer` on header triggers**: the new native
  `<button>` elements (UserDropdown avatar, MobileMenu hamburger,
  ThemeToggle, LanguageSwitcher segments, AuthActions login,
  AdminActions admin) inherit `cursor: default` under Tailwind v4's
  preflight. Added `cursor-pointer` to all of them.

## [0.11.0] - 2026-05-12

### Changed — Header overhaul finish (UserDropdown + MobileMenu)

Finishes the header pass started in v0.10.0. Both menus now use the same
calm chrome system as the rest of the redesigned header.

- **`UserDropdown`** (302 → 196 lines): replaced the gradient dropdown
  base (`bg-gradient-to-br from-[color:var(--ai-card-bg)] to-...`),
  duplicated HeroUI `data-[hover=true]` styling layers, and inflated
  per-item padding with a single rounded-xl panel + plain rows + one
  hover state. Avatar trigger now uses a thin neutral border (no
  primary-color halo), 32px to match the icon rail. Dropped the
  `SocialIcons` row and the always-commented `suggestions` row — dead
  weight inside an already-deep menu. Profile-info row now uses an
  uppercase eyebrow over the name (matches editorial typography
  elsewhere). Sections: Account → Navigation → Admin (if applicable) →
  Mobile Utilities (md:hidden) → Logout.

- **`MobileMenu`** (218 → 154 lines): same chrome system. Hamburger
  trigger now icon-only 32px ghost button instead of HeroUI flat
  Button. **Removed the duplicate gradient "Sign Up" row** (login modal
  handles signup) — same dead-CTA cleanup as AuthActions in v0.10.0.
  Single inverted-fill Login button at the bottom of the sheet.

## [0.10.0] - 2026-05-12

### Changed — Header overhaul (full)

User feedback: the header still felt busy / dense / cluttered, with
icons too large, the right cluster a visual mess, and the active nav
state (gradient pill with shadow inside a backdrop-blur container) was
framing-within-framing. Top-padding on every page (`pt-20 md:pt-24`)
left awkward dead space below the now-shorter header. Full pass:

- **`Header.tsx`**: removed orphan `header-shimmer` styled-jsx keyframe
  (the usage was already gone, the keyframe lingered). Snapper scroll
  transition (200ms vs 400ms). Right cluster now a single rail with a
  thin vertical separator between Search and the icon group. Slightly
  larger gap (4 vs 3 lg:gap-8 vs 6) gives the brand and nav more breathing
  room.

- **`NavbarBrand`** (62 → 47 lines): dropped the 3-color gradient logo
  background, the rotating spring on hover, the animated bg-clip-text
  gradient on the wordmark, and the absolute halo on hover. Now: a
  single bordered "S" monogram (8×8 rounded-lg, foreground type) plus
  the brand name in plain editorial weight. Wordmark hides on `<sm`.

- **`NavbarLinks`** (53 → 51 lines): dropped the rounded-full pill
  container with `backdrop-blur-sm` and the `bg-gradient-to-r` active
  pill with primary-color shadow. Replaced with flat row + a 2px gold
  underline (`from-amber-400 to-amber-500`) for active route, animated
  via `layoutId="nav-active-underline"`. Reads like a magazine masthead.

- **`ThemeToggle`** (62 → 71 lines, but icon shrunk 20→16px and hit
  target 36→32px): removed scale spring + drop shadow + ring on hover;
  now opacity-only. Same animation budget as the rest of the new rail.

- **`LanguageSwitcher`** (58 → 65 lines): replaced two competing solid
  pill buttons (each with their own primary fill on active) with a
  single segmented EN/RO toggle. Active state uses a sliding
  `layoutId="lang-switch-pill"` background. Letters are uppercase 11px
  with letter-spacing — matches the eyebrow typography.

- **`AuthActions`** (92 → 56 lines): dropped the duplicate "Sign Up"
  gradient button. The login modal handles both signin and signup
  internally, so the second CTA was dead UX weight. Single inverted-fill
  "Login" button (foreground bg, background text), 32px tall to match
  the rail.

- **`AdminActions`** (58 → 31 lines): removed a 22-line block of
  commented-out `Add Course` button code. Single compact ghost "Admin"
  button at 32px, uppercase tracking-wide.

- **`HideOnAdmin > ContentArea`**: page top-padding tightened from
  `pt-20 md:pt-24` to `pt-16 md:pt-20` to match the new compact header
  height. Eliminates the dead band that opened up below it.

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

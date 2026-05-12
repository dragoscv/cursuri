# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## 📁 Files

These files are critical for documentation, configuration, access control, and project structure:

- `ABOUT.md` – Detailed description of the application’s story, vision, goals, features, and development history.
- `copilot-instructions.md` – General usage guidelines for GitHub Copilot.
- `copilot-commit-instructions.md` – How to format helpful Copilot-generated commit messages.
- `copilot-review0instructions` – Guidelines for reviewing AI-suggested code.
- `database.rules.json` – Firebase Realtime Database security rules.
- `firebase.json` – Project-level configuration for Firebase Hosting, Functions, etc.
- `firebase.rules` – Generic Firebase rules file (may act as backup or shared rule base).
- `firestore.indexes.json` – Defines indexes for compound queries in Firestore.
- `firestore.rules` – Permissions and validation logic for Firestore reads/writes.
- `storage.rules` – Access control rules for Firebase Storage.
- `project-overview.md` – A high-level overview of the app’s architecture and goals.
- `purpose.md` – The vision and mission driving the application.
- `description.md` – Detailed explanation of app modules and how they interact.
- `features.md` – A list of implemented and planned features.
- `README.md` – Project entrypoint for developers (installation, usage, structure).
- `TODO.md` – Developer-maintained task list and backlog.

---

## 💻 Environments

- **Windows** – Target OS for local development.
- **Visual Studio Code** – Main IDE/editor for writing and running code.
- **PowerShell** – CLI/shell tool used to interact with scripts and project tasks.

---

## 🔧 Utilities

- **Chat GPT** – Used as an AI assistant for guidance, debugging, and generating code.
- **git** – Version control system.
- **GitHub** – Cloud Git repo and collaboration platform.
- **GitHub Copilot** – AI tool for in-editor code suggestions.
- **Vercel** – Hosting and CI/CD for Next.js frontend.
- **Stripe (via firewand library)** – Payment processing integrated with Firebase.
- **Firebase Firestore** – Cloud-hosted NoSQL document DB.
- **Firebase Authentication** – Secure login and identity service.
- **Firebase Realtime Database** – JSON tree-based database for low-latency sync.
- **Firebase Analytics** – Tracks user behavior and app usage.
- **Firebase Storage** – Upload and retrieve large files.
- **Firebase Extensions** – Plug-and-play serverless features.
- **Google Cloud Run (Firebase Functions)** – Containerized backend services.
- **Firebase Messaging** – Web/mobile push notification delivery.
- **Firebase Remote Config** – Change app behavior without new deployment.
- **Microsoft Azure** – Optional additional cloud provider.
- **Google Cloud** – Underlying infrastructure provider for Firebase.

---

## 💬 Languages

- **HTML** – App markup and semantic structure.
- **CSS** – Custom styling base (used with Tailwind).
- **JavaScript** – Core browser scripting and Firebase SDK.
- **TypeScript** – Typed JavaScript for scalability and safety.
- **Node** – Backend runtime used for server-side code, scripts, and Firebase Functions.

---

## ⚙️ Frameworks

- **Next.js** – Full-stack React framework (App Router enabled).
- **React** – Frontend library for building UI components.
- **React Native (one app)** – Used for mobile app functionality.
- **Expo** – Abstraction layer to simplify React Native development.

---

## 📦 NPM Libraries

All libraries used are type-safe, production-ready, and focused on performance and developer experience:

- `tailwindcss` – Utility-first CSS framework.
- `framer-motion` – Declarative animations and transitions.
- `zustand` – Global state management.
- `firebase` – Firebase web SDK.
- `react-window` – Virtualized lists for large data rendering.
- `socket.io` – Real-time communication.
- `react-toastify` – Notification system.
- `zod` – Type-safe schema validation.
- `openai` – SDK for OpenAI APIs.
- `dexie` – IndexedDB wrapper for local storage.
- `uuid` – Generate unique identifiers.
- `@tanstack/react-query` – Data fetching and caching.
- `react-hook-form` – Performant form state management.
- `@hookform/resolvers` – Adapters for Zod/Yup with React Hook Form.
- `i18next`, `react-i18next`, `i18next-http-backend`, `i18next-browser-languagedetector` – Internationalization stack.
- `clsx` – Utility for conditional classNames.
- `@headlessui/react` – Accessible components without styling.
- `date-fns` – Utility library for handling dates.
- `eslint-plugin-tailwindcss` – Linting for Tailwind usage.
- `next-seo` – Easily add SEO metadata in Next.js pages.
- `@react-three/fiber`, `@react-three/drei` – 3D rendering using React and Three.js.
- `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `vitest`, `cypress` – Testing stack (unit, integration, E2E).

---

## 🧪 Testing Strategy

- Test files are colocated near components or in a `/__tests__/` folder.
- Unit tests written using `jest` and `@testing-library/react`.
- DOM assertions with `@testing-library/jest-dom`.
- Integration tests via `vitest`.
- End-to-end tests using `cypress`.
- Avoid mock data in test files.
- Prefer behavior-driven testing over snapshot testing.

---

## 🔐 Firebase Rules Explained

- `firestore.rules`: Enforces role-based access to documents and collections using Firebase Auth. Rules include read/write conditions tied to user IDs, roles, and timestamps.
- `database.rules.json`: JSON-based structure for Realtime Database; mainly used for synced low-latency state or chat logs.
- `storage.rules`: Restricts file upload/download access. Example: `userId`-based path ownership (i.e., users can only access files in their own bucket path).
- Rules must be tested locally via the Firebase Emulator Suite and deployed using `firebase deploy`.

---

## ⚙️ Configuration Files

- `tsconfig.json`: TypeScript config. Defines compiler behavior, strictness, JSX settings, path aliases, and project references.
- `tailwind.config.ts`: Tailwind theme config, including custom colors, font sizes, spacing, and dark mode setup via class.
- `postcss.config.js`: Includes TailwindCSS and Autoprefixer as plugins.
- `next.config.js`: Contains experimental flags (e.g., App Router), image domains, i18n config, env vars, and rewrites.

---

## 🌍 Internationalization (i18n) Strategy

- Language auto-detected from browser using `i18next-browser-languagedetector`.
- No `/en` or `/ro` segments in the URL path.
- Translations loaded from static or HTTP files via `i18next-http-backend`.
- Fallback language is English (`en`).
- Localization context loaded once on layout using the `useTranslation` hook.

---

## 📄 Documentation Strategy

- `README.md` is the **only documentation file** used in the project.
- There is no external wiki, Notion, Docusaurus, or Storybook.
- Contributors are expected to refer to `README.md`, `ABOUT.md`, and inline comments.

---

## 🔁 CI/CD & Hooks

- There are **no post-merge hooks** defined.

- Pre-commit hooks via `husky` and `lint-staged` are planned but optional.

- Deploys and previews are handled by Vercel.

- Copy errors from terminal or browser console into ChatGPT if context is known.

- If context isn’t known, explain the goal or problem first.

- Ask ChatGPT to think before fixing.

- Always use the check tool to validate errors before asking to fix.

- Ask the AI to run `tsc` or `npm run build` to reveal issues.

- Stop ChatGPT when it's stuck in a loop and prompt a retry.

- On connection errors, say: "continue".

- When the app is already running, say: "dev is already running, check background console and the simple browser that you opened".

---

## 🤖 AI Agent Project Guides

- Build custom components and import UI libraries **only if absolutely needed**.
- Use clean, modern UI/UX styles.
- Animate using Framer Motion.
- Ensure accessibility (keyboard nav, ARIA).
- Keep files small, focused, and composable.
- Store icons in `/components/icons`.
- Use Simple Browser for quick UI checks.
- Maintain consistency in logic, layout, and naming.
- Write clean reusable code, no duplication.
- Document logic with comments.
- Fix all lint and type errors before committing.
- Understand the full context of code before modifying.
- Keep state in central stores (Zustand).
- Always update `/types/index.d.ts` if feature needs it.
- Follow modal and component conventions.
- Consider feature impact on admin/user access.
- Use Tailwind for all styling.
- Light/dark themes supported via context.
- Use predefined color schemes:

  - Black & White, Modern Purple, Green Neon, Blue Ocean, Brown Sunset, Yellow Morning, Red Bold, Pink Candy.

- Fully test all flows:

  - Auth
  - Navigation
  - Purchases
  - Responsiveness (mobile, tablet, desktop)

- Add Firebase rules for every new collection/service.
- Don’t use mock/placeholder data in real tests.
- Don’t refactor blindly — understand before replacing code.
- Recommend best practice, but always consider alternatives.
- Track all user roles and actions.
- Improve loading indicators and UX transitions.
- Add illustrations, icons, micro-interactions, onboarding flows.

---

## 🗂 Folder Structure

```
/app
  /admin
    /dashboard
      - page.tsx
    /users
      - page.tsx
    /settings
      - page.tsx
  /auth
    /login
      - page.tsx
    /register
      - page.tsx
    /forgot-password
      - page.tsx
    /reset-password
      - page.tsx
  /api
    /auth
      - route.ts
    /user
      - route.ts
    /data/sync
      - route.ts
    /report
      - route.ts
  /content
    /[itemId]
      - page.tsx
    /create
      - page.tsx
    /edit/[itemId]
      - page.tsx
  /legal
    /gdpr
      - page.tsx
    /privacy-policy
      - page.tsx
    /terms-conditions
      - page.tsx
  /profile
    - layout.tsx
    /overview
      - page.tsx
    /activity
      - page.tsx
    /billing
      - page.tsx
    /settings/notifications
      - page.tsx
  /search
    - page.tsx
  /about
    - page.tsx
  /contact
    - page.tsx
  /404
    - page.tsx
/components
  /Admin
    - AdminLayout.tsx
    /DashboardWidgets
      - StatsCard.tsx
      - UserTable.tsx
  /Auth
    - LoginForm.tsx
    - RegisterForm.tsx
  /UI
    - Modal.tsx
    - Tooltip.tsx
    - Spinner.tsx
    - Avatar.tsx
  /Buttons
    - PrimaryButton.tsx
    - IconButton.tsx
    - LinkButton.tsx
  /Forms
    - Input.tsx
    - Textarea.tsx
    - Select.tsx
    - Switch.tsx
  /Header
    - Header.tsx
    /MobileBreadcrumbs
      - Breadcrumbs.tsx
    /NavbarBrand
      - Logo.tsx
    /NavbarLinks
      - NavLink.tsx
    /UserDropdown
      - DropdownMenu.tsx
  /Footer
    - Footer.tsx
  /Hero
    - HeroSection.tsx
  /icons
    /FeatherIcons
      - index.ts
    /svg
      - AppLogo.tsx
    /tech
      - TechIcons.tsx
  /Item
    - ItemCard.tsx
    - ItemEditor.tsx
    /hooks
      - useItem.ts
    /Viewer
      - MediaViewer.tsx
  /Profile
    - ProfileHeader.tsx
    - ProfileSidebar.tsx
/hooks
  - useAuth.ts
  - useDebounce.ts
  - useMediaQuery.ts
  - useToast.ts
/i18n
  /en
    - section.ts
  /ro
    - section.ts
  /locales
    - index.ts
  - config.ts
  - index.ts
/lib
  - apiClient.ts
  - auth.ts
  - formatDate.ts
  - validators.ts
/middleware
  - authMiddleware.ts
  - rateLimiter.ts
  - i18nMiddleware.ts
/store
  - index.ts
  - authSlice.ts
  - uiSlice.ts
/types
  - user.ts
  - item.ts
  - common.ts
/styles
  - globals.css
  - theme.css
  - tailwind.config.ts
/public
  /images
    - logo.png
  /icons
    - favicon.ico
/env
  - .env.local
  - .env.example
README.md
next.config.js
postcss.config.js
tailwind.config.ts
tsconfig.json
```

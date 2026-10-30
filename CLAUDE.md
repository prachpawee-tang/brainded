# CLAUDE.md — Project Constitution

> Single source of truth for how this project is built. Read this fully before any task.
> If a request conflicts with this file, stop and ask. Update this file (in the same PR) when a rule changes.

## 0. Product

- **What**: A personal "second brain" app. One shell, many **modules** (pets, finance, health, notes, …) added over time.
- **Who**: Primarily the owner (single user), but every table/API is multi-user ready.
- **Where**: Web + iOS + Android from one codebase.
- **Feel**: Minimal and calm by default, playful in the details (motion, mascot, copy, empty states).
- **Brand name**: TBD (see §13). Code uses the internal codename **`brain`** (`@brain/*`) so the brand can change without refactors.
- **First module**: `pets`.

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Fast, cached tasks, affected-only runs |
| Language | TypeScript (strict) everywhere | One language FE/BE, shared types |
| App (web+mobile) | Expo + Expo Router (universal) | One UI codebase → iOS, Android, Web |
| Styling | Uniwind (Tailwind v4 for RN) + design tokens | Works on native + web, Tailwind v4 CSS-first theme; NativeWind v4 is still on Tailwind v3 |
| Motion | react-native-reanimated (+ Moti) | "Fun" micro-interactions, 60fps |
| API | GraphQL Yoga on Hono (`graphql` **v16**) | Runtime-agnostic (Cloudflare Workers / Node / Docker). v17 not used yet (dual ESM/CJS issues) |
| Schema | Pothos (code-first). Now: errors, relay. Add when needed: scope-auth (Phase 1), dataloader, zod | End-to-end type safety, no schema/resolver drift |
| GraphQL client | Apollo Client + GraphQL Code Generator (client preset) | Normalized cache, typed documents, `MockedProvider` for tests |
| DB | PostgreSQL (Neon free tier) | Standard Postgres = portable anywhere |
| ORM / driver | Drizzle ORM + drizzle-kit · `pg` (node-postgres) | Neon's recommendation for Node servers and for Cloudflare Workers via Hyperdrive. Import `sql`/`eq`/… from `@brain/db`, never `drizzle-orm` directly (keeps one instance) |
| Auth | Better Auth | Google, Facebook, Apple, username/password, account linking, Expo plugin |
| Files | Neon Object Storage (S3 API) via `@brain/storage` | Same provider/branching as the DB, no extra account; S3 API = swap to R2/AWS S3 by env only |
| Validation | Zod (shared between FE/BE) | One schema per input |
| i18n | i18next + react-i18next + expo-localization | Namespaced per module |
| AI (later) | Claude API via `packages/ai` | Vision for pet body/photo analysis |
| Lint/format | Biome | One fast tool, enforces naming rules |
| Tests | Vitest (node packages, api, modules/*/api) · Jest + jest-expo + RNTL v14 (`packages/ui`, `apps/app`, modules/*/app) · PGlite for DB integration · Playwright / Maestro later | See §8 |
| Scripts | `tsx` | Run TS scripts (codegen, theme build) |
| Commits | Commitizen (cz-git) + commitlint + husky + lint-staged | See §9 |
| CI | GitHub Actions | Free |

Versions at scaffold (Oct 2026): Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6.0, pnpm 11, Node 24.
In `apps/app`, add packages with `pnpm expo install <pkg>` (picks SDK-compatible versions). Read `apps/app/AGENTS.md` before touching Expo APIs: Expo changes a lot between SDKs, so use the versioned docs and don't rely on memory.

### Hosting (free now, portable later)

| Piece | Now (free) | Escape hatch |
|---|---|---|
| Web | Cloudflare Pages (`expo export -p web`) | Any static host / Vercel |
| API | Cloudflare Workers | `apps/api` also builds a Node server + `Dockerfile` → Fly/Railway/AWS |
| DB | Neon Postgres (project `winter-frost-81729253`, branch `production`, ap-southeast-1, PG 18) | Any Postgres (Supabase, RDS): only `DATABASE_URL` changes |
| Files | Neon Object Storage, bucket `brain-files` (private; presigned GET URLs) | R2 / AWS S3 / MinIO: change `AWS_*` env + `STORAGE_BUCKET` |
| Mobile | EAS Build free tier + EAS Update (OTA) | Same |

Rule: **no vendor-specific API in domain code**. Vendor access lives behind an adapter in `packages/*` (e.g. `storage`, `mailer`, `ai`).

## 2. Repository structure

```
.
├── apps/
│   ├── app/                 # Expo universal app (web + iOS + Android)
│   │   └── src/
│   │       ├── app/         # Expo Router routes ONLY (thin re-exports). `sign-in`, `sign-up` (signed-out),
│   │       │                #   `(app)/…` (signed-in, guarded by Stack.Protected in _layout.tsx)
│   │       ├── features/    # app-shell features (home, settings…): screens/ graphql/ __tests__/
│   │       ├── graphql/generated/  # codegen output (committed, never edit)
│   │       ├── lib/         # config (API_ORIGIN), auth-client, apollo, i18n, modules (registry + accent)
│   │       ├── locales/     # `app` namespace {en,th}.json
│   │       ├── providers/   # AppProviders (SafeArea → i18n → Apollo)
│   │       ├── test/        # createTestProviders, createAuthClientMock, viewer fixtures
│   │       └── global.css   # Tailwind + Uniwind + @brain/ui/theme.css + @source
│   └── api/                 # GraphQL server (Yoga + Hono)
│       └── src/             # app.ts (createApp), schema.ts, modules.ts (registry), server.ts (Node),
│                            # core/ (health, viewer: preferences + module toggles), test/createTestApp
├── packages/
│   ├── config/              # tsconfig presets (base/node/react-native), vitest preset
│   ├── ui/                  # design system: tokens → theme.css, atomic components (§6)
│   ├── i18n/                # createI18n, `common` locales, key-parity helpers
│   ├── db/                  # createDb, ownedColumns/notDeleted, migrations, createTestDb (PGlite)
│   ├── graphql/             # createBuilder (Pothos), AppError family, context, schema.graphql
│   ├── auth/                # createAuth (Better Auth: email+username+password, Google, Expo plugin)
│   ├── core/                # `.`: ModuleManifest (isomorphic) · `./server`: timeline + attachments primitives (DB)
│   ├── storage/             # ObjectStorage adapter: createS3Storage, createMemoryStorage, buildObjectKey
│   └── ai/                  # (Phase 4) AI adapter
├── modules/
│   ├── pets/                # @brain/module-pets  (§3)
│   └── colors/              # @brain/module-colors: Wada color combinations (static MIT dataset + favorites)
├── docs/
│   ├── adr/                 # Architecture Decision Records: NNNN-title.md
│   └── modules/             # one spec per module: <module>.md
├── CLAUDE.md
└── turbo.json / pnpm-workspace.yaml / biome.json / commitlint.config.ts
```

Dependency direction (enforced by review, later by lint rule):
`apps → modules → packages`. Modules **never** import other modules; cross-module interaction goes through `packages/core` (links, events).

## 3. Module architecture

Every module is a package in `modules/<name>` with the same shape:

```
modules/pets/
├── src/manifest.ts, src/locales.ts   # `./manifest`, `./locales` (isomorphic)
├── shared/validation.ts     # `./shared` zod schemas + error codes, used by BOTH api and app
├── codegen.ts               # module's own GraphQL codegen → app/graphql/generated (not apps/app's)
├── api/
│   ├── db/schema.ts         # drizzle tables (prefixed: pets_*), builders from `@brain/db/pg-core`
│   ├── lib/                 # context (toServiceContext, parseOrThrow, global ids, cursors), loaders (DataLoader)
│   ├── test/                # harness: composed schema + PGlite + memory storage
│   ├── features/
│   │   ├── profile/         # one folder per feature
│   │   │   ├── profile.schema.ts     # Pothos types/queries/mutations
│   │   │   ├── profile.service.ts    # business logic (pure, testable)
│   │   │   ├── profile.repository.ts # DB access only
│   │   │   ├── profile.validation.ts # zod inputs
│   │   │   └── __tests__/
│   │   └── medication/ ...
│   └── index.ts             # registerPetsModule(builder)
├── app/
│   ├── lib/                 # services context (host-injected, e.g. uploadPhoto), labels, format
│   ├── test/                # renderPets (i18n + MockedProvider + services), fixtures
│   ├── features/
│   │   └── profile/
│   │       ├── screens/     # page-level components (Atomic "pages")
│   │       ├── components/  # module-specific organisms/molecules
│   │       ├── graphql/     # operations via `graphql(\`…\`)` from the app's codegen (typed)
│   │       ├── hooks/
│   │       └── __tests__/
│   └── index.ts
├── locales/{en,th}.json     # namespace = "pets"
└── package.json             # "@brain/module-pets", exports "./api", "./app", "./manifest"
```

Rules:
- **Feature-sliced**: new capability = new folder under `features/`. Never grow one giant file.
- `apps/api/src/schema.ts` calls `registerXModule(builder)` for each module. `apps/app` imports `manifest` and screens, and adds the namespace to `APP_NAMESPACES` in `src/lib/i18n.ts`. Adding a module means creating the package, registering it in those places, adding route files, and adding the module id to `commitlint.config.ts` scopes and to `moduleColors`.
- Enabled modules per user stored in `user_modules` (module_id, enabled, settings jsonb).
- Feature flags in `manifest.features`; unfinished features ship behind a flag.
- Each module has `docs/modules/<name>.md` (scope, entities, roadmap) written **before** code.
- **Module ↔ app boundary**: modules never import `apps/app`. Things only the host can do (upload with the session cookie, …) are injected through a module services provider (`PetsServicesProvider`) in the module's route `_layout.tsx`. Shared layout comes from `@brain/ui` (`ScreenLayout`).
- Module tests: Vitest for `shared/` + `api/` (`vitest.config.ts`), Jest for `app/` (`jest.config.js`). `pnpm test` runs both.
- File uploads: `POST /api/files` (apps/api, auth, `image/*` ≤ 5 MB) → `{ key }` under `<ownerId>/uploads/`. Services must check the key starts with the owner id before attaching it.

## 4. Core primitives (`packages/core`) — the extensibility backbone

Modules reuse these instead of re-inventing them:

| Primitive | Purpose | Example in pets |
|---|---|---|
| `Reminder` | Date/time + optional RRULE recurrence + notification | Vet appointment, daily pill |
| `Task` | Todo with status/due date | "Buy flea treatment" |
| `Attachment` | File in storage, linked to any entity | Pet photos, vet receipts |
| `TimelineEvent` | Append-only history entry for any entity | "Weight 4.2 kg", "Vaccinated" |
| `Tag` | Free-form labels across modules | `#allergy` |
| `EntityLink` | Polymorphic link `(sourceType, sourceId) → (targetType, targetId)` | Pet ↔ note, pet ↔ expense |

Entity references use `entityType` strings in the form `<module>.<entity>` (e.g. `pets.pet`).

## 5. API (GraphQL) conventions

- Code-first with Pothos. No hand-written SDL. One builder from `createBuilder()` (`@brain/graphql`), passed to every `register*` function.
- Fields are **non-null by default** (`defaultFieldNullability: false`); opt in with `nullable: true`.
- `packages/graphql/schema.graphql` is generated by `pnpm --filter @brain/api codegen` (test fails if stale). Then `pnpm --filter @brain/app codegen` regenerates client types.
- **Relay style**: global `ID` via `Node` interface; lists are **connections** (`first/after`).
- Mutations: one `input` argument, return a `<Name>Payload`; expected failures are typed errors via the errors plugin (`union`), never thrown strings.
- Errors: throw `NotFoundError('PET_NOT_FOUND')`, `ForbiddenError`, `ValidationError(issues)` (or subclass `AppError`), and list them in `errors: { types: [...] }` on the field. The GraphQL `Error` interface exposes only `code`; the client translates codes via i18n. **The API never returns user-facing text.** Unexpected errors are masked by Yoga.
- Authorization with scope-auth on every field that touches user data; every query is scoped by `ownerId`.
- DataLoader for all relations (no N+1).
- Introspection and GraphiQL are off in production (`createApp({ isProduction })`). Add depth/complexity limits once nested relations exist.

## 6. Design system

**Principles**: minimal surface, playful motion. Calm neutrals + one accent per module. Generous whitespace. Rounded, soft. Delight in micro-moments (button press springs, success confetti/mascot, friendly empty states), never in clutter.

**Tokens** (`packages/ui/src/tokens/*.ts`) are the single source of truth. `pnpm --filter @brain/ui build:theme` generates `packages/ui/theme.css` (Tailwind v4 `@theme` + light/dark `@variant`s). A test fails if it is stale. Never edit theme.css by hand. Tests also enforce **WCAG AA contrast** for text/surface pairs; change colors only if those tests still pass.

Class names: colors `bg-bg`, `bg-surface`, `bg-surface-muted`, `border-border`, `text-text`, `text-text-muted`, `bg-primary`, `text-on-primary`, `bg-primary-soft`, `bg-success|warning|danger`, `bg-module-<id>`; fonts `font-sans`, `font-sans-medium`, `font-sans-bold`; radius `rounded-sm|md|lg|xl`. Merge classes with `cn()` from `@brain/ui`. Never use raw Tailwind palette colors (`bg-blue-500`).

- `color`: semantic only in components (`bg`, `surface`, `text`, `textMuted`, `border`, `primary`, `success`, `warning`, `danger`, `module.<id>`). Raw palette never used directly. Light + dark.
- `space`: 4-pt scale (`0,1,2,3,4,6,8,12,16` × 4px).
- `radius`: `sm 8`, `md 12`, `lg 20`, `full`.
- `font`: IBM Plex Sans Thai (400/500/700, loaded in `_layout.tsx`), sizes `xs…3xl` with Thai-friendly line heights.
- `motion`: durations `fast 120 / base 200 / slow 320`, spring presets `gentle`, `bouncy`. Respect reduce-motion.
- `elevation`: `0..3`.

**Atomic design** (`packages/ui/src/`):
- `atoms/` — ✅ Text, Button (optional `icon`), IconButton, Icon (lucide), Switch, Checkbox, Avatar, Badge, Skeleton
- `molecules/` — ✅ TextField, SegmentedControl, DateField (`.web.tsx` = `<input type=date>`), ListItem; next: SearchBar
- `organisms/` — ✅ Tile, EmptyState, Sheet (bottom sheet), LineChart (react-native-svg; colors from `moduleChartColors`, validated with the dataviz script)
- `templates/` — ✅ ScreenLayout (safe area, keyboard, max width, optional pinned `footer`)
- **pages** = `screens/` inside modules (not in `ui`).
- Shared `ui` components are domain-agnostic. Domain-specific components live in the module.
- Every component lives in `<level>/<name>/<name>.tsx` + `<name>.test.tsx`, is exported from `src/index.ts`, has typed props, is accessible (role/label), works in dark mode (semantic tokens only), and accepts `className`.
- Pressed/disabled feedback: Uniwind `active:` / `disabled:` on `Pressable` (e.g. `active:scale-95`).

## 7. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files & folders | kebab-case | `pet-card.tsx`, `profile.service.ts` |
| React components | PascalCase | `PetCard` |
| Hooks | `use` + camelCase | `usePetList` |
| Functions / variables | camelCase, verb-first for functions | `getPetById` |
| Booleans | `is/has/can/should` prefix | `isArchived` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_MB` |
| Types / interfaces | PascalCase, no `I` prefix | `Pet`, `CreatePetInput` |
| Zod schemas | camelCase + `Schema` | `createPetInputSchema` |
| DB tables | snake_case, plural, module-prefixed | `pets_pets`, `pets_weight_logs`, `core_reminders` |
| DB columns | snake_case | `owner_id`, `created_at` |
| GraphQL types | PascalCase | `Pet`, `PetConnection` |
| GraphQL fields/args | camelCase | `birthDate` |
| GraphQL enums | type PascalCase, values SCREAMING_SNAKE | `Species.CAT` |
| GraphQL mutations | `verbNoun` | `createPet`, `archivePet` |
| GraphQL operations (client) | PascalCase + suffix | `PetListQuery`, `CreatePetMutation`, `PetCard_PetFragment` |
| i18n keys | `namespace:feature.section.key`, camelCase segments | `pets:profile.form.nameLabel` |
| Env vars | SCREAMING_SNAKE, `EXPO_PUBLIC_` for client | `DATABASE_URL` |
| Packages | `@brain/<name>`, modules `@brain/module-<name>` | `@brain/ui` |
| Tests | `<file>.test.ts(x)` unit, `<file>.int.test.ts` integration | |
| Branches | `<type>/<scope>-<short-desc>` | `feat/pets-medication` |

Every table has: `id` (UUIDv7), `owner_id`, `created_at`, `updated_at`, `deleted_at` (soft delete).

## 8. Testing & TDD (non-negotiable)

**Workflow for every change — Red → Green → Refactor:**
1. Write/extend the failing test(s) first. Run them and confirm they fail for the right reason.
2. Implement the minimum to pass.
3. Refactor with tests green.
4. A task is **not done** until unit + integration tests for it exist and `pnpm test` passes.

**Layers:**
- **Unit** (`*.test.ts`): services, validation, utils, hooks, ui atoms/molecules. No network, no DB.
- **Integration** (`*.int.test.ts`):
  - API: execute real GraphQL operations against the composed Yoga schema with a real Postgres (PGlite in-process, migrations applied, fresh per test file). Test auth scopes + error codes.
  - App: `await render(<Screen />, { wrapper: await createTestProviders({ lng, mocks }) })` gives real i18n and an Apollo `MockedProvider`. Assert on what the user sees (roles and translated text).
- **RNTL v14 is async**: `await render(...)`, prefer `userEvent.setup()` + `await user.press(...)`, query with `getByRole` first, and use `findBy*` for async UI.
- DB integration: `const db = await createTestDb()` (`@brain/db/testing`) gives in-memory Postgres (PGlite) with migrations applied. Create one per test or file and never share state.
- API integration: `createApp({ db, isProduction })` then `app.request('/graphql', …)`.
- Locale parity: every namespace has a test that en/th have identical keys (`findMissingKeys`).
- **E2E** (later): Playwright for web critical paths, Maestro for mobile.

**Rules:** coverage threshold ≥ 80% lines/branches on `packages/*` and `modules/*`; test names describe behavior (`it("returns PET_NOT_FOUND when pet belongs to another user")`); factories in `packages/db/test` instead of ad-hoc fixtures; no snapshot-only tests.

## 9. Git & commits

- Conventional Commits via **Commitizen** (`pnpm commit`). commitlint enforces on `commit-msg`.
- Format: `<type>(<scope>): <subject>` — imperative, lowercase, ≤ 72 chars.
- Types: `feat fix refactor perf test docs style build ci chore revert`.
- Scopes: `app api ui i18n db auth graphql core storage ai config ci deps docs` + module ids (`pets`, …). Add new module ids to `commitlint.config.ts`.
- Hooks: `pre-commit` → lint-staged (biome check --write, related tests); `commit-msg` → commitlint; `pre-push` → `turbo run typecheck test --affected`.
- Small commits; tests in the same commit as the code they cover.
- Never commit secrets. `.env.example` lists every var.

## 10. i18n

- Languages: `th` (default for owner), `en`. Fallback `en`.
- **No hard-coded user-facing strings** anywhere — UI, validation messages, error codes all go through i18n.
- Namespaces: `common` (packages/i18n) + one per module (`pets`). Module locales live in the module.
- Dates/numbers via `Intl` with current locale (Buddhist calendar optional per user setting).
- Adding a key = add to **both** `en.json` and `th.json` (a test checks key parity).

## 11. Auth

- Providers: Google, Facebook, Apple (required by App Store when social login exists), username + password.
- Instagram: **not supported** — Meta shut down Instagram Basic Display API (Dec 2024); consumer IG login no longer exists. Facebook covers Meta accounts.
- Account linking: one user ↔ many `accounts`; link/unlink providers in Settings; prevent unlinking the last method.
- Sessions: secure cookies on web, secure storage (expo-secure-store) on mobile.

## 12. Commands

```bash
pnpm dev                              # all apps (turbo)
pnpm --filter @brain/app web          # app in the browser (port 8081)
pnpm --filter @brain/api dev          # API on :4000 (needs DATABASE_URL, see .env.example)
pnpm test                             # all tests (turbo)
pnpm test:coverage                    # with 80% thresholds (what CI runs)
pnpm test:int                         # integration only
pnpm lint / pnpm lint:fix             # biome
pnpm typecheck
pnpm --filter @brain/api codegen      # → packages/graphql/schema.graphql
pnpm --filter @brain/app codegen      # → apps/app/src/graphql/generated
pnpm --filter @brain/ui build:theme   # tokens → packages/ui/theme.css
pnpm --filter @brain/db db:generate   # drizzle migration from schema changes
pnpm commit                           # commitizen (cz-git)
```

## 12a. Environment & secrets

- Repo root `.env.local` is **managed by Neon** (`npx neon@latest env pull`): `DATABASE_URL` (pooled, for app traffic) and `DATABASE_URL_UNPOOLED` (direct, **migrations only**). Don't hand-edit it.
- `apps/api/.env.local` holds API secrets (Google OAuth, later Facebook/Apple). The API dev/start scripts load both files.
- Every key is documented in `.env.example`. All `.env*` files except the example are gitignored. Never print secret values in chat or logs.
- `neon.ts` declares Neon services, and `.neon` links the project. Run `npx neon@latest deploy` after changing `neon.ts`.

## 11a. Auth implementation notes

- Server: `createAuth()` in `packages/auth`, mounted by `apps/api` at `/api/auth/*`. The GraphQL context resolves `viewer` from the session (`auth.api.getSession`).
- Tables `auth_users|sessions|accounts|verifications` live in `packages/db/src/schema/auth.ts`. They were generated by `pnpm dlx auth@latest generate`, then adapted. Re-run and merge when adding Better Auth plugins that need schema.
- Preferences (`locale`, `theme`) are columns on `auth_users`, changed via GraphQL `updatePreferences` (not by the client's `updateUser`). The app applies them in `(app)/_layout.tsx` (`usePreferencesSync`).
- Per-user module state: `core_user_modules` + GraphQL `viewer.modules` / `setModuleEnabled`. No row means enabled.
- Linked accounts use the Better Auth client directly (`listAccounts`, `linkSocial`, `unlinkAccount({ accountId })`). Better Auth blocks unlinking the last method.
- Apollo on native attaches the cookie from `authClient.getCookie()`. Web relies on `credentials: include`. The Apollo cache is cleared whenever the session user changes.
- Map Better Auth error codes through `authErrorKey()` and never show server messages.

## 12b. Gotchas (learned during setup)

- **pnpm 11** blocks dependency build scripts: allow them in `pnpm-workspace.yaml` → `allowBuilds`. It also enforces `minimumReleaseAge`, so very fresh versions get added to `minimumReleaseAgeExclude`.
- **GraphQL in Vitest**: GraphQL libs must be inlined (`server.deps.inline` in the vitest preset), otherwise ESM and CJS copies of `graphql` collide ("from another module or realm").
- **graphql-scalars DateTime** serializes to a `Date`. Over HTTP it becomes an ISO string, so tests should compare JSON-round-tripped results.
- **Uniwind types**: `className` typing comes from `node_modules/uniwind/types.d.ts` (referenced in `apps/app/src/env.d.ts` and `packages/ui/uniwind-env.d.ts`). `src/uniwind-types.d.ts` is generated by Metro and gitignored.
- **SafeAreaProvider** renders nothing without metrics. Tests pass `TEST_SAFE_AREA_METRICS`.
- Node can't run `.ts` imports without extensions, so use `tsx` for scripts.
- Yoga's built-in CORS reflects any origin, so it is disabled (`cors: false`). CORS is enforced by Hono with the `APP_ORIGINS` allowlist.
- `pg` warns about `sslmode=require`. `createDb` and drizzle.config rewrite it to `verify-full` (`withStrictSsl`), which is the same behavior pg uses today.
- **Better Auth turns off origin/CSRF checks when `NODE_ENV=test`**. `createAuth` sets `advanced.disableOriginCheck: false`, so tests behave like production.
- **Uniwind in Jest**: it ships untranspiled ESM, so `apps/app/__mocks__/uniwind.ts` mocks its JS API (`Uniwind.setTheme`, `useUniwind`).
- **Apollo 4 + MockedProvider** need `__typename` in mock results. Codegen uses `nonOptionalTypename: true`, so fixtures must include it (`src/test/viewer-fixture.ts`).
- **Typed routes are off**: they are generated only by `expo start` into the gitignored `.expo/`, which would break CI typecheck.
- A RN `View` with `accessibilityRole` isn't queryable by RNTL `getByRole` unless it is `accessible`. Assert on the children (e.g. radios) instead.
- Migrations: `pnpm --filter @brain/db db:generate` creates them and `pnpm --filter @brain/db db:migrate` applies them to Neon (direct URL). drizzle.config reads core tables and `modules/*/api/db/schema.ts`. Neon's `production` branch currently has `0000_init`, `0001_pets_and_timeline` and `0002_pets_health`; `0003_core_tasks`, `0004_pets_lab_v2`; `0005_hide_deleted_lab_history` (data fix); `0006_colors_favorites` is generated but must still be applied.
- Pothos relay connection typenames come from the field, not the node: `QueryPetsConnection(Edge)`, `PetTimelineConnection(Edge)`. Mock fixtures must use them.
- `@brain/core` root export must stay isomorphic (the app imports it). DB code goes in `@brain/core/server`.
- Jest configs set `testTimeout: 30_000` and the Vitest preset sets 30s, because PGlite/screen tests are slow when turbo runs packages in parallel.
- Thai `th-TH` `Intl` dates use the Buddhist year automatically (2569 = 2026).
- **Icons**: lucide-react-native through `Icon`/`IconButton` only (semantic tones, `aria-hidden`). Never pass RN-only a11y props like `importantForAccessibility` to SVG, because they leak to the DOM on web. Jest maps `lucide-react-native` to its CJS build (its RN entry is `.mjs`). After installing a package, restart Metro, because it caches the file map and fails with "Unable to resolve ./icons/…".
- **Never call `router.back()` directly.** On web a reload or deep link leaves no history, so it throws "GO_BACK was not handled". Use `goBack(parentHref)` (`app/lib/navigation.ts` in modules, `@/lib/navigation` in the app). `HeaderBar` requires `fallbackHref`. Router mocks in tests need `canGoBack: () => true`.
- **i18n keys must not contain `:`**, because it is i18next's namespace separator (`meds.timePresets.08:00` breaks). Key by name (`morning`) instead.
- Refetch with operation names (`refetchQueries: ['PetTimeline', 'PetWeights']`) to refresh every active query of that operation, whatever its variables are.
- The Apollo cache merges entities by id. Fixtures that reuse an id (e.g. one medication across two doses) must give it identical fields.
- **Reminders** are local notifications planned on the device: modules expose a hook returning `ReminderItem[] | null` (`null` = data unknown, keep the schedule), and the app's `ReminderSync` replaces the whole schedule. `expo-notifications` is only imported from `features/reminders/notifications.ts`; `notifications.web.ts` is the no-op web twin. Reminder settings are per device (AsyncStorage), not on the server.
- Module typecheck is `pnpm typecheck` (runs `tsconfig.json` **and** `tsconfig.app.json`). `tsc -p .` alone skips the app code.
- Apollo 4 `MockedProvider`: to match loosely, pass `request.variables` as a callback `(vars) => boolean` (there is no `variableMatcher`).
- GraphQL `ValidationError.issues.path` is `[String]`, so array indexes come back as strings (`['values', '0', 'value']`).
- Vet results: the catalog (`shared/lab-catalog.ts`) never ships reference ranges; the editor prefills them from the pet's previous value of the same test (`Pet.labTrend`).
- Data-driven swatch colors (colors module) use inline `style` + `readableTextOn()`; that is the only exception to semantic-token classes.
- `HeaderBar` and `goBack` are copied into each module (modules can't import each other). Moving them into `@brain/ui` with an `onBack` prop is a pending refactor.
- Jest mocks AsyncStorage globally via `apps/app/__mocks__/@react-native-async-storage/`.
- After `expo install` changes peers, pnpm may leave stale links (e.g. "Cannot find package 'drizzle-orm'"). Run `pnpm install` at the root.
- Inputs that need typed validation errors take strings (e.g. appointment `scheduledAt: String`) and validate them with the shared zod schema. A GraphQL scalar would fail at coercion before the zod check runs.

## 13. Open decisions

- [ ] Brand name (internal codename stays `brain`)
- [ ] Confirm hosting choice before first deploy

## 14. Roadmap

Full plan with scope per phase: **`docs/roadmap.md`** (agreed 2026-10-30). Summary:

| Phase | Scope |
|---|---|
| 0. Foundation ✅ | Monorepo, tooling, CI, tokens, ui atoms, i18n, test harness, API health, app home |
| 1. Shell + Auth ✅ | Login (username/email + password, Google), account linking, module tiles, settings. **Later:** Facebook, Apple, email verification, password reset |
| 2. Pets MVP ✅ | Pet profile, weight log, timeline (core `TimelineEvent`), photo upload |
| 3a. Pets health ✅ | Weight chart + stats, vet results (core `Attachment`), medications + doses, appointments |
| 3b. Pets reminders ✅ | To-dos (core `Task`) + on-device notifications (planned from data, `expo-notifications`) |
| 4. Vet results v2 ✅ | Sections, qualitative values, unit multipliers, species test catalog + Thai names, per-test trends, edit |
| 5. AI foundation | `packages/ai`, input safety, cost caps, lab-report import (photo/text → reviewed draft), pet body analysis |
| 6a. Colors module ✅ | Wada color combinations: browse, search, nearest color (ΔE OKLab), copy codes, favorites. **6b next:** pick a color from a photo |
| 7. Nutrition module | Meal log, targets from body profile, macro progress; 7b meal-photo AI |
| 8. AI chat + core | Read-only tools per module, cited answers; quick capture, global search, tags, links |
| 9. People module | Plain personal CRM: people, topic facts, typed relationships, filters (no bubble/gamification) |
| 10. Launch | Deploy, PDPA, billing (freemium), onboarding |

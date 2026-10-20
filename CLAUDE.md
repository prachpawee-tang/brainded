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
| Files | Cloudflare R2 (S3 API) | 10 GB free, S3 API = swap to AWS S3 later |
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
| Files | Cloudflare R2 | Any S3-compatible |
| Mobile | EAS Build free tier + EAS Update (OTA) | Same |

Rule: **no vendor-specific API in domain code**. Vendor access lives behind an adapter in `packages/*` (e.g. `storage`, `mailer`, `ai`).

## 2. Repository structure

```
.
├── apps/
│   ├── app/                 # Expo universal app (web + iOS + Android)
│   │   └── src/
│   │       ├── app/         # Expo Router routes ONLY (thin: `export { XScreen as default }`)
│   │       ├── features/    # app-shell features (home, settings…): screens/ graphql/ __tests__/
│   │       ├── graphql/generated/  # codegen output (committed, never edit)
│   │       ├── lib/         # apollo, i18n, detect-language
│   │       ├── locales/     # `app` namespace {en,th}.json
│   │       ├── providers/   # AppProviders (SafeArea → i18n → Apollo)
│   │       ├── test/        # createTestProviders (real i18n + MockedProvider)
│   │       └── global.css   # Tailwind + Uniwind + @brain/ui/theme.css + @source
│   └── api/                 # GraphQL server (Yoga + Hono)
│       └── src/             # app.ts (createApp), schema.ts (composes modules), server.ts (Node), core/
├── packages/
│   ├── config/              # tsconfig presets (base/node/react-native), vitest preset
│   ├── ui/                  # design system: tokens → theme.css, atomic components (§6)
│   ├── i18n/                # createI18n, `common` locales, key-parity helpers
│   ├── db/                  # createDb, ownedColumns/notDeleted, migrations, createTestDb (PGlite)
│   ├── graphql/             # createBuilder (Pothos), AppError family, context, schema.graphql
│   ├── auth/                # (Phase 1) Better Auth server config + client
│   ├── core/                # (Phase 3) core domain primitives shared by all modules (§4)
│   ├── storage/             # (Phase 2) file storage adapter (R2/S3)
│   └── ai/                  # (Phase 4) AI adapter
├── modules/
│   └── pets/                # @brain/module-pets  (§3)
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
├── manifest.ts              # id, nameKey, icon, color, routes, nav entry, feature flags
├── api/
│   ├── db/schema.ts         # drizzle tables (prefixed: pets_*)
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
- `atoms/` — ✅ Text, ✅ Button; next: Icon, Input, Avatar, Badge, Switch…
- `molecules/` — (create folder when the first one lands) FormField, ListItem, SearchBar, DatePickerField…
- `organisms/` — Card lists, Forms, Header, EmptyState, ModuleTile…
- `templates/` — layout skeletons (ScreenLayout, ListDetailLayout).
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

## 12b. Gotchas (learned during setup)

- **pnpm 11** blocks dependency build scripts: allow them in `pnpm-workspace.yaml` → `allowBuilds`. It also enforces `minimumReleaseAge`, so very fresh versions get added to `minimumReleaseAgeExclude`.
- **GraphQL in Vitest**: GraphQL libs must be inlined (`server.deps.inline` in the vitest preset), otherwise ESM and CJS copies of `graphql` collide ("from another module or realm").
- **graphql-scalars DateTime** serializes to a `Date`. Over HTTP it becomes an ISO string, so tests should compare JSON-round-tripped results.
- **Uniwind types**: `className` typing comes from `node_modules/uniwind/types.d.ts` (referenced in `apps/app/src/env.d.ts` and `packages/ui/uniwind-env.d.ts`). `src/uniwind-types.d.ts` is generated by Metro and gitignored.
- **SafeAreaProvider** renders nothing without metrics. Tests pass `TEST_SAFE_AREA_METRICS`.
- Node can't run `.ts` imports without extensions, so use `tsx` for scripts.
- Yoga's built-in CORS reflects any origin, so it is disabled (`cors: false`). CORS is enforced by Hono with the `APP_ORIGINS` allowlist.
- `pg` warns about `sslmode=require`. `createDb` rewrites it to `verify-full` (`withStrictSsl`), which is the same behavior pg uses today.

## 13. Open decisions

- [ ] Brand name (internal codename stays `brain`)
- [ ] Confirm hosting choice before first deploy

## 14. Roadmap

| Phase | Scope |
|---|---|
| 0. Foundation ✅ | Monorepo, tooling, CI, tokens, ui atoms, i18n, test harness, API health, app home |
| 1. Shell + Auth | Login (all providers), account linking, home dashboard of module tiles, settings (language, theme, modules) |
| 2. Pets MVP | Pet profile (name, species, breed, birthday, sex, photo), weight log, history timeline |
| 3. Pets v2 | Medication, vet appointments, todos — built on core `Reminder`/`Task` + push notifications |
| 4. Pets AI | Photo/body-condition analysis via `packages/ai` |
| 5. Second-brain core | Quick capture, global search, tags, cross-module links, timeline view |

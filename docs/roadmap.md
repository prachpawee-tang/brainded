# Roadmap

Agreed with the owner on 2026-10-30. Order: **3b → 4 → 5 → 6 → 7 → 8 → 9 → 10**.
Each phase gets a spec in `docs/modules/<module>.md` (or a section in it) before code. Sizes are rough: S ≈ days, M ≈ 1–2 weeks, L ≈ several weeks.

| Phase | Theme | Size | Depends on |
|---|---|---|---|
| 0–3a ✅ | Foundation, auth, pets MVP, pets health | — | — |
| 3b | Pets to-dos + on-device reminders | S–M | 3a |
| 4 | Vet results v2 (from real lab reports) | M | 3a |
| 5 | AI foundation + input safety + lab-report import | L | 4 |
| 6 | Colors module (Wada combinations) | S–M | — |
| 7 | Nutrition module | L | 5 (7b only) |
| 8 | Cross-module AI chat + second-brain core | L | 5, 7 |
| 9 | People module (plain personal CRM) | M–L | core `EntityLink` |
| 10 | Launch readiness (deploy, PDPA, billing) | M–L | — (can start early) |

## 3b — Pets to-dos + reminders
- **To-dos** per pet on the core `Task` primitive: title, optional due date and note, done/undone. Shown in "Today" when due or overdue.
- **Local notifications** for medication doses, appointments (lead time), and due to-dos. They are planned on the device from the data (no server push) via `expo-notifications`. The schedule is re-synced on app open and after changes. Tapping a notification opens the pet. Settings: a master switch plus one switch per kind. Web shows reminders in the app only.

## 4 — Vet results v2
Learned from a real lab report (Vet & Vitro Central Lab) and a vet's LINE summary:
- **Sections** inside a result: CBC, blood morphology, blood parasite, blood chemistry (+ custom).
- **Qualitative values** next to numbers: `1+`, `Few`, `Not Found`, `Positive`.
- **Units with multipliers**: `12,200` and `12.2 ×10³ cell/mm³` must compare as the same value. Normalize per test.
- **Per-species test catalog** with default reference ranges (e.g. feline WBC 5.5–19.5 ×10³), standard names, and the **Thai names vets use** ("ค่าไต" = Creatinine, "ค่าถุงน้ำดี" = ALP, "ค่าของเสียในเลือด" = BUN, "เม็ดเลือดแดง" in summaries = HCT).
- **Report remark** and the **vet's interpretation** stored with the result.
- **Trend per test** across results (e.g. ALT over time), using the existing `LineChart`.
- **Edit** an existing result.

## 5 — AI foundation + safety + lab-report import
- `packages/ai`: provider adapter (Claude via API; swappable), usage metering, per-user cost cap, rate limits.
- **Input safety**: treat all user text, images, and pasted messages as untrusted. Defend against prompt injection, cap file size/type, validate model output with the shared zod schemas, and never write data without explicit user confirmation.
- **Lab-report import**: a photo of a report or pasted vet text → a structured draft (sections, values, units, ranges, flags) → the user reviews, then saves. First AI feature.
- Move the "AI pet body-condition analysis" feature here.

## 6 — Colors module
- Wada's *A Dictionary of Color Combinations*: its colors (Japanese/English name, HEX, RGB, CMYK) and the 348 combinations.
- Search by name or HEX. Find the nearest color (ΔE in OKLab). Pick a color from a photo and get matching combinations. Save favorites and copy codes.
- **Data source**: use an existing open dataset of the book's color values (verify its license). Do not extract images from the scanned PDF.

## 7 — Nutrition module
- **7a**:
  - Log meals from a food database (Thai FCD / INMU, USDA FoodData Central) or as custom entries.
  - Daily targets from weight, height, age, sex, and activity (BMR/TDEE; protein g/kg).
  - Progress bars for kcal, protein, carbs, and fat, showing "left today" or "over".
  - Needs a personal body profile (weight, height). Reuse the weight-log and chart patterns.
- **7b**: meal photo → AI estimate of items and macros → the user corrects it, then saves.

## 8 — Cross-module AI chat + second-brain core
- Each module registers **read-only tools** for the assistant (e.g. "what did I eat today", "Os's latest ALT", "next vet visit"). Answers cite their source records and never guess.
- Includes the former "second-brain core": quick capture, global search, tags, cross-module links.

## 9 — People module (plain personal CRM)
**Decision (2026-10-30): plain recording only.** No bubble/mind-map UI, no avatar, no gamification. The visual, game-like version will be a separate app later.
- **Person**: name(s) and nickname, photo, birthday, importance star, relationship type(s), known-since date, links (e.g. social profiles).
- **Facts by topic**: free-form notes grouped in sections the user creates (e.g. personal, food likes/dislikes, work, plans, …). Each fact has an optional date, so it can also show as a timeline.
- **Relationships between people** (core `EntityLink`, typed: family, partner, friend, colleague, …) so you can follow from one person to their family and friends. Nested groups like "mother's side" can be modeled as relationship labels.
- **Lists and filters**: by relationship type, importance, and known-since range. Search across names and facts.
- **Privacy**: this is sensitive data about third parties. Encrypt notes at rest, keep it out of AI features unless the user explicitly opts in per module, and support export/delete (needed for PDPA).

## 10 — Launch readiness
- Deploy (Cloudflare Pages + Workers, Neon), backups, monitoring.
- PDPA: privacy policy, consent, data export and deletion, third-party data guidance (people module).
- Billing (freemium: core free, AI features + extra storage paid; no ads), onboarding, a landing page.
- Go-to-market wedge: lead with **pet health** (AI lab import + trends). Make it shareable: a pet profile link for sitters and vets, and a PDF export for clinics.

# Module: Pets (`pets`)

Status: **Phase 2 MVP ✅ · Phase 3a ✅ · Phase 3b ✅ · Phase 4 ✅** (vet results v2). Phase 3a scope confirmed 2026-10-20.

## Job

The owner (later, anyone who signs up) has 1–5 pets, mostly dogs and cats. They use the module in three moments:

1. **Quick capture:** log a weight or a note with one hand in a few seconds.
2. **Lookup at the vet:** see the key facts on one screen without scrolling.
3. **Sit-down review:** read the pet's history.

Mode: **Operate.**

Success:
- Adding a pet takes under 30 seconds. Only name and species are required.
- Logging a weight takes about 2 taps.
- At the vet, the key facts fit on one screen without scrolling.

## Scope (MVP)

### Screens
1. **`/pets` — overview.** One card per pet: photo (or the species emoji on Apricot), name, species · age, and latest weight. The last card is "add pet". With only one pet, the screen is still a list.
   - **Empty state:** "Add your first pet", with dog / cat / other shortcut buttons.
2. **`/pets/[id]` — profile.** Sections, top to bottom:
   1. **Hero:** photo, name, species · breed · sex.
   2. **Key facts:** age (computed from the birthday, with the exact date), latest weight with the change since the previous log, and important notes (highlighted).
   3. **Quick log:** "+ weight" and "+ note" buttons, sticky at the bottom (The Thumb Rule).
   4. **Timeline:** newest first, grouped by month, paginated.
   - Leave room for future sections (medication, appointments) without a redesign.
3. **Add / edit pet.**
   - Required fields: name, species (dog / cat / other, with free text for "other").
   - Optional fields: breed, sex (male / female / unknown), birthday (can be unknown), photo, important notes (one free-text field).
4. **Log weight (bottom sheet).** kg with one decimal place. The date defaults to today. Optional note. On save, a small spring animation and a "Saved" message.
5. **Log note (bottom sheet).** Text, date, and a type: `GENERAL`, `VET_VISIT`, `VACCINE`, or `GROOMING`. Types are an enum so more can be added later.

### States
- Loading skeletons. Offline / error state with a retry button.
- Archive a pet: soft delete, after a confirmation.
- Validation: weight 0.1–200 kg, birthday not in the future, name 1–60 characters. Thai names must never clip.

## Data model

| Table | Columns (besides `ownedColumns`) |
|---|---|
| `pets_pets` | `name`, `species` (`DOG`/`CAT`/`OTHER`), `species_other`, `breed`, `sex` (`MALE`/`FEMALE`/`UNKNOWN`), `birth_date` (date, nullable), `photo_key` (object storage key), `notes` |
| `pets_weight_logs` | `pet_id` → `pets_pets`, `weight_grams` (int), `measured_on` (date), `note` |
| `core_timeline_events` (core primitive) | `entity_type` (`pets.pet`), `entity_id`, `kind` (`pets.weight`, `pets.note.vet_visit`, …), `occurred_on`, `title`, `body`, `data` jsonb |

- Store weight as integer **grams** and display it in kg.
- Every weight log also writes a timeline event, so the timeline is the single history feed.
- Photos go to object storage (`packages/storage`, S3 API). Postgres stores only the key. The API returns a short-lived presigned URL on read.

## API (GraphQL)

- `Pet` implements `Node`.
- `Query.pets(first, after)` returns a connection. `Query.pet(id)` returns one pet or null.
- `Pet.latestWeight`, `Pet.previousWeight`, `Pet.timeline(first, after)` (a connection), `Pet.photoUrl`.
- Mutations: `createPet`, `updatePet`, `archivePet`, `logPetWeight`, `addPetNote`. Each takes an `input` argument and returns typed errors: `PET_NOT_FOUND`, `VALIDATION_FAILED`, `UNAUTHENTICATED`.
- Photos are uploaded with `POST /api/files` (authenticated; `image/*` only; up to 5 MB). It returns `{ key }`, which the client passes as `photoKey`.

## Phase 3a

### Weight trend
- Show a line chart on the profile (one series, in the module chart color). Range selector: 3M / 6M / 1Y / All (default 6M).
- Show these stats for the selected range: average, minimum, maximum, and change (last − first).
- Press-and-drag on the chart shows the nearest point (crosshair + readout). Every value can also be reached as text (stats plus "All weights" list), so the chart never hides data.
- API: `Pet.weights(since)` returns weight logs in ascending order. The client computes the stats.

### Vet results (lab results)
- One result = date, title (e.g. "Blood test"), optional clinic and note, a list of **values**, and optional **photos** of the report.
- A value has name, number, unit, and an optional reference range (low/high). The flag is computed (`LOW` / `NORMAL` / `HIGH` / `UNKNOWN`). The result shows its abnormal count.
- The value editor has quick-add presets for common tests (HCT, WBC, PLT, BUN, CREA, ALT, ALP, GLU) with default units. Presets are only suggestions, never required.
- Photos use the core **Attachment** primitive (`core_attachments`, entity `pets.lab_result`). Upload through `POST /api/files`.
- Adding a result writes a timeline event (`LAB_RESULT`, with the title in the body).
- Screens: the results list (`/pets/[id]/labs`), result detail (`/pets/[id]/labs/[labId]`), and a new result editor (`/pets/[id]/labs/new`). Delete is available from the detail screen. Editing a result is planned for later.

### Medications
- A medication has name, dosage (free text), daily times (`HH:MM`, 1–6 times), repeat (`everyDays`: 1 = daily, 7 = weekly, …), start date, optional end date, and a note.
- **Today's doses** come from the schedule. Each dose can be marked as taken or not taken (`pets_medication_doses`).
- An ended medication (end date in the past) stays in the history list.
- Adding a medication writes a timeline event (`MEDICATION_STARTED`).

### Appointments
- An appointment has date-time (timestamptz), clinic, reason, note, and status (`SCHEDULED` / `DONE` / `CANCELLED`).
- The profile shows the next upcoming appointment. Marking it done writes a timeline event (`APPOINTMENT_DONE`) and offers "add results".

### Profile layout (top to bottom)
**Decision (2026-10-30): the profile shows only what is needed now; depth lives on its own pages.**
Hero, key facts, **Today** (doses and due to-dos to tick + next appointment), then **Details**: one row per page with a one-line summary — Weight (chart + stats + log), Vet results (latest, abnormal badge), Medications (active count), Appointments (next), To-dos (open count), History (timeline). The quick-log bar stays pinned.
A ticked to-do stays struck through for ~1.5 s before it leaves Today.

## Phase 3b — to-dos + reminders

### To-dos
- Built on the core **Task** primitive (`core_tasks`, entity `pets.pet`). A to-do has a title, an optional due date and note, and a done state (`completedAt`).
- **Profile → To-dos** section lists open to-dos (overdue first, then by due date, then undated). Tick to complete, tap to edit or delete, and use + to add (sheet).
- A list screen `/pets/[id]/tasks` shows open and done to-dos.
- **Today** also shows open to-dos due today or overdue, tickable.

### Reminders (local notifications)
- **Planned on the device from data**, with no server push and no server-side reminder table. A pure planner (`shared/reminders.ts`) turns active medications, upcoming appointments, and open dated to-dos into reminder items for the next 7 days:
  - **Dose:** at the dose time, on dosing days.
  - **Appointment:** 1 day before and 2 hours before. Both are skipped if already past.
  - **To-do:** at 09:00 on the due date.
- The app schedules them with `expo-notifications` (DATE triggers), sorted by time and capped at 60 (iOS keeps ~64). It re-syncs whenever the planned set changes (after app open, mutations, settings). Tapping a notification opens the pet's profile.
- **Settings → Notifications**: a master switch (asks for permission when turned on) plus one switch each for doses, appointments, and to-dos. Settings are stored **per device**, because notifications are per device.
- Web: reminders are visible in the app (Today) only; the settings section says notifications work in the mobile app.
- The app shell owns scheduling (`ReminderSync`). Modules only expose a hook that returns reminder items (`usePetsReminderItems`), so future modules can add their own.


## Phase 4 — vet results v2

Learned from a real lab report (sections CBC / morphology / parasite / chemistry) and a vet's LINE summary.

### Result
- A result gains a **report remark** (printed by the lab) and the **vet's interpretation** (what the vet said), next to the owner's own note.
- **Edit** an existing result (`/pets/[id]/labs/[labId]/edit`, same editor). Saving replaces its values; photos can be added or removed.

### Values
- Each value belongs to a **section**: `CBC`, `MORPHOLOGY`, `PARASITE`, `CHEMISTRY`, `URINE`, `OTHER`. The detail screen groups by section in that order.
- A value is **numeric** (`value`) or **qualitative** (`textValue`: `1+`, `Few`, `Not Found`, `Positive`, …). The editor has one input. If the text parses as a number, it is numeric. Otherwise it is qualitative.
- **Number input**: a comma followed by exactly 3 digits is a thousands separator (`12,200` → 12200, `1,234.5` → 1234.5). Otherwise a comma is a decimal point (`4,5` → 4.5).
- **Flags**:
  - Numeric values are `LOW` / `NORMAL` / `HIGH` against the range, or `UNKNOWN` without one.
  - Qualitative values are `NORMAL` when the catalog lists the answer as normal (e.g. parasite `Not Found` / `Negative`). They are `ABNORMAL` when it lists the answer as abnormal (`Positive`, `Found`, `1+`…`4+`). Otherwise they are `UNKNOWN`.
  - `abnormalCount` counts `LOW`, `HIGH` and `ABNORMAL`.

### Test catalog (`shared/lab-catalog.ts`)
- Per test:
  - code (e.g. `WBC`)
  - section
  - English name
  - **Thai names vets use** ("ค่าไต" = CREA, "ค่าถุงน้ำดี" = ALP, "ค่าของเสียในเลือด" = BUN, "ค่าตับ" = ALT, "เม็ดเลือดแดง" = HCT)
  - kind (numeric or qualitative)
  - canonical unit
  - unit aliases, each with a factor to the canonical unit
- The editor's "add test" search matches code, English and Thai names. Custom tests are always allowed: their code is the trimmed, upper-cased name.
- **No built-in reference ranges.** They differ by lab and analyser, and inventing medical numbers is unsafe. Instead the editor **prefills unit and range from this pet's latest value of the same test**. The report remains the source of truth.

### Units
- Values keep the unit as entered. For comparison, `normalizeLabValue(code, value, unit)` converts them to the catalog's canonical unit with the alias factor.
  - Example: `12,200 cells/µL` and `12.2 ×10³ cell/mm³` are both 12.2 ×10³/µL.
- An unknown unit is not converted and is charted separately (never silently mixed).

### Trend per test
- Tapping a value opens `/pets/[id]/labs/tests/[code]`. It shows a line chart of the normalized values over time, the latest range as text, and a list of every value (date, as entered, flag).
- API: `Pet.labTrend(code)` returns values with their result date, oldest first.

### Data
- `pets_lab_results` gains `remark` and `interpretation`.
- `pets_lab_values` gains `section`, `code` and `text_value`. `value` becomes nullable, with a check that exactly one of `value` / `text_value` is set.
- Existing rows get `code` = the upper-cased name and `section` = `OTHER`. Migration `0004`.

### Out of scope here
AI import from a photo or LINE text (Phase 5). Comparing with breed/age norms.

### Later
Comparing weight against age/breed norms (see `docs/roadmap.md`).

## Out of scope (later phases)

AI photo analysis, sharing a pet with another user, comparing weight against breed norms, and units other than kg.

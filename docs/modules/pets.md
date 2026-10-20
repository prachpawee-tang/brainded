# Module: Pets (`pets`)

Status: **Phase 2 MVP ✅ · Phase 3a in progress** (vet results, weight chart, medications, appointments). Phase 3a scope confirmed 2026-10-20.

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
Hero, key facts, **Today** (doses due + next appointment), **Weight** (chart + stats), **Vet results** (latest 2 + see all), **Medications** (active), **Appointments** (upcoming), timeline. The quick-log bar stays pinned.

### Deferred to Phase 3b
To-dos, and local notifications on the device for doses and appointments (built on the core `Reminder` primitive). Comparing weight against age/breed norms comes in a later phase.

## Out of scope (later phases)

AI photo analysis, sharing a pet with another user, comparing weight against breed norms, and units other than kg.

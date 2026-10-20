# Module: Pets (`pets`)

Status: **Phase 2 — MVP in progress.** Brief confirmed 2026-10-20.

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

## Out of scope (later phases)

Medication, appointments, reminders and notifications, AI photo analysis, sharing a pet with another user, weight charts, and units other than kg.

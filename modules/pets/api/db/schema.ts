import { authUsers, ownedColumns } from '@brain/db'
import {
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from '@brain/db/pg-core'

export const petSpecies = pgEnum('pets_species', ['DOG', 'CAT', 'OTHER'])
export const petSex = pgEnum('pets_sex', ['MALE', 'FEMALE', 'UNKNOWN'])

export const pets = pgTable(
  'pets_pets',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    species: petSpecies('species').notNull(),
    speciesOther: text('species_other'),
    breed: text('breed'),
    sex: petSex('sex').notNull().default('UNKNOWN'),
    birthDate: date('birth_date', { mode: 'string' }),
    photoKey: text('photo_key'),
    notes: text('notes'),
  },
  (table) => [index('pets_pets_owner_idx').on(table.ownerId, table.createdAt)],
)

export const petWeightLogs = pgTable(
  'pets_weight_logs',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    petId: uuid('pet_id')
      .notNull()
      .references(() => pets.id, { onDelete: 'cascade' }),
    weightGrams: integer('weight_grams').notNull(),
    measuredOn: date('measured_on', { mode: 'string' }).notNull(),
    note: text('note'),
  },
  (table) => [
    index('pets_weight_logs_pet_idx').on(table.petId, table.measuredOn.desc(), table.id.desc()),
  ],
)

const ownerReference = () =>
  uuid('owner_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' })
const petReference = () =>
  uuid('pet_id')
    .notNull()
    .references(() => pets.id, { onDelete: 'cascade' })

export const petLabResults = pgTable(
  'pets_lab_results',
  {
    ...ownedColumns(),
    ownerId: ownerReference(),
    petId: petReference(),
    takenOn: date('taken_on', { mode: 'string' }).notNull(),
    title: text('title').notNull(),
    clinic: text('clinic'),
    note: text('note'),
  },
  (table) => [
    index('pets_lab_results_pet_idx').on(table.petId, table.takenOn.desc(), table.id.desc()),
  ],
)

export const petLabValues = pgTable(
  'pets_lab_values',
  {
    ...ownedColumns(),
    ownerId: ownerReference(),
    labResultId: uuid('lab_result_id')
      .notNull()
      .references(() => petLabResults.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0),
    name: text('name').notNull(),
    value: doublePrecision('value').notNull(),
    unit: text('unit'),
    refLow: doublePrecision('ref_low'),
    refHigh: doublePrecision('ref_high'),
  },
  (table) => [index('pets_lab_values_result_idx').on(table.labResultId, table.position)],
)

export const petMedications = pgTable(
  'pets_medications',
  {
    ...ownedColumns(),
    ownerId: ownerReference(),
    petId: petReference(),
    name: text('name').notNull(),
    dosage: text('dosage'),
    /** Daily times, `HH:MM`, sorted. */
    times: text('times').array().notNull(),
    everyDays: integer('every_days').notNull().default(1),
    startOn: date('start_on', { mode: 'string' }).notNull(),
    endOn: date('end_on', { mode: 'string' }),
    note: text('note'),
  },
  (table) => [index('pets_medications_pet_idx').on(table.petId, table.startOn)],
)

export const petMedicationDoses = pgTable(
  'pets_medication_doses',
  {
    ...ownedColumns(),
    ownerId: ownerReference(),
    medicationId: uuid('medication_id')
      .notNull()
      .references(() => petMedications.id, { onDelete: 'cascade' }),
    scheduledOn: date('scheduled_on', { mode: 'string' }).notNull(),
    scheduledTime: text('scheduled_time').notNull(),
    takenAt: timestamp('taken_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('pets_medication_doses_slot_idx').on(
      table.medicationId,
      table.scheduledOn,
      table.scheduledTime,
    ),
  ],
)

export const petAppointmentStatus = pgEnum('pets_appointment_status', [
  'SCHEDULED',
  'DONE',
  'CANCELLED',
])

export const petAppointments = pgTable(
  'pets_appointments',
  {
    ...ownedColumns(),
    ownerId: ownerReference(),
    petId: petReference(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'date' }).notNull(),
    clinic: text('clinic'),
    reason: text('reason').notNull(),
    note: text('note'),
    status: petAppointmentStatus('status').notNull().default('SCHEDULED'),
  },
  (table) => [index('pets_appointments_pet_idx').on(table.petId, table.scheduledAt)],
)

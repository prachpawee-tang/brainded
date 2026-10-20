import { authUsers, ownedColumns } from '@brain/db'
import { date, index, integer, pgEnum, pgTable, text, uuid } from '@brain/db/pg-core'

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

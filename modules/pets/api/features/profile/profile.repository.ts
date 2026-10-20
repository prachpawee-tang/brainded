import { and, asc, type Database, eq, notDeleted, sql } from '@brain/db'
import { pets } from '../../db/schema'

export type PetRow = typeof pets.$inferSelect
export type NewPet = typeof pets.$inferInsert

export const findPet = async (
  db: Database,
  ownerId: string,
  id: string,
): Promise<PetRow | null> => {
  const [pet] = await db
    .select()
    .from(pets)
    .where(and(eq(pets.ownerId, ownerId), eq(pets.id, id), notDeleted(pets)))
  return pet ?? null
}

/** Oldest first (creation order), keyset-paginated on (created_at, id). */
export const listPets = async (
  db: Database,
  ownerId: string,
  { limit, after }: { limit: number; after: { createdAt: string; id: string } | null },
) => {
  const rows = await db
    .select()
    .from(pets)
    .where(
      and(
        eq(pets.ownerId, ownerId),
        notDeleted(pets),
        after
          ? sql`(${pets.createdAt}, ${pets.id}) > (${after.createdAt}::timestamptz, ${after.id}::uuid)`
          : undefined,
      ),
    )
    .orderBy(asc(pets.createdAt), asc(pets.id))
    .limit(limit + 1)
  return { rows: rows.slice(0, limit), hasNextPage: rows.length > limit }
}

export const insertPet = async (db: Database, values: NewPet): Promise<PetRow> => {
  const [pet] = await db.insert(pets).values(values).returning()
  if (!pet) throw new Error('Failed to insert pet')
  return pet
}

export const updatePetRow = async (
  db: Database,
  ownerId: string,
  id: string,
  values: Partial<NewPet>,
): Promise<PetRow> => {
  const [pet] = await db
    .update(pets)
    .set(values)
    .where(and(eq(pets.ownerId, ownerId), eq(pets.id, id)))
    .returning()
  if (!pet) throw new Error('Failed to update pet')
  return pet
}

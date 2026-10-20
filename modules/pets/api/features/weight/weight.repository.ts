import {
  and,
  asc,
  type Database,
  eq,
  getTableColumns,
  gte,
  inArray,
  notDeleted,
  sql,
} from '@brain/db'
import { petWeightLogs } from '../../db/schema'

export type WeightLogRow = typeof petWeightLogs.$inferSelect

export const insertWeightLog = async (db: Database, values: typeof petWeightLogs.$inferInsert) => {
  const [row] = await db.insert(petWeightLogs).values(values).returning()
  if (!row) throw new Error('Failed to insert weight log')
  return row
}

/** Latest two weights (by measured date) for each pet, in one query. */
export const findRecentWeights = async (
  db: Database,
  ownerId: string,
  petIds: readonly string[],
): Promise<Map<string, WeightLogRow[]>> => {
  const ranked = db
    .select({
      ...getTableColumns(petWeightLogs),
      rank: sql<number>`row_number() over (partition by ${petWeightLogs.petId} order by ${petWeightLogs.measuredOn} desc, ${petWeightLogs.id} desc)`.as(
        'rank',
      ),
    })
    .from(petWeightLogs)
    .where(
      sql`${petWeightLogs.ownerId} = ${ownerId} and ${petWeightLogs.deletedAt} is null and ${inArray(petWeightLogs.petId, [...petIds])}`,
    )
    .as('ranked')
  const rows = await db.select().from(ranked).where(sql`${ranked.rank} <= 2`)
  const byPet = new Map<string, WeightLogRow[]>()
  for (const { rank: _rank, ...row } of rows)
    byPet.set(row.petId, [...(byPet.get(row.petId) ?? []), row])
  for (const list of byPet.values())
    list.sort((a, b) => b.measuredOn.localeCompare(a.measuredOn) || b.id.localeCompare(a.id))
  return byPet
}

/** Weight history, oldest first, optionally from a date (for charts). */
export const findWeights = (db: Database, ownerId: string, petId: string, since: string | null) =>
  db
    .select()
    .from(petWeightLogs)
    .where(
      and(
        eq(petWeightLogs.ownerId, ownerId),
        eq(petWeightLogs.petId, petId),
        notDeleted(petWeightLogs),
        since ? gte(petWeightLogs.measuredOn, since) : undefined,
      ),
    )
    .orderBy(asc(petWeightLogs.measuredOn), asc(petWeightLogs.id))

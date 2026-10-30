import { and, desc, eq, notDeleted } from '@brain/db'
import { favoriteInputSchema } from '../../../shared/validation'
import { colorFavorites } from '../../db/schema'
import { type ColorsServiceContext, parseOrThrow } from '../../lib/context'

export type ColorFavoriteRow = typeof colorFavorites.$inferSelect

export const listFavorites = (context: ColorsServiceContext) =>
  context.db
    .select()
    .from(colorFavorites)
    .where(and(eq(colorFavorites.ownerId, context.ownerId), notDeleted(colorFavorites)))
    .orderBy(desc(colorFavorites.createdAt), desc(colorFavorites.id))

/** Idempotent: favoriting twice keeps one row; un-favoriting soft-deletes it. Returns the new list. */
export const setFavorite = async (context: ColorsServiceContext, input: unknown) => {
  const { kind, ref, isFavorite } = parseOrThrow(favoriteInputSchema, input)
  const match = and(
    eq(colorFavorites.ownerId, context.ownerId),
    eq(colorFavorites.kind, kind),
    eq(colorFavorites.ref, ref),
    notDeleted(colorFavorites),
  )
  if (isFavorite) {
    const [existing] = await context.db
      .select({ id: colorFavorites.id })
      .from(colorFavorites)
      .where(match)
    if (!existing)
      await context.db.insert(colorFavorites).values({ ownerId: context.ownerId, kind, ref })
  } else {
    await context.db.update(colorFavorites).set({ deletedAt: new Date() }).where(match)
  }
  return listFavorites(context)
}

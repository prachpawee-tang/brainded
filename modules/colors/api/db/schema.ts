import { authUsers, ownedColumns, sql } from '@brain/db'
import { index, pgTable, text, uniqueIndex, uuid } from '@brain/db/pg-core'

export const colorFavorites = pgTable(
  'colors_favorites',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    /** `COLOR` | `COMBINATION` */
    kind: text('kind').notNull(),
    /** Color slug or combination number, as text. */
    ref: text('ref').notNull(),
  },
  (table) => [
    index('colors_favorites_owner_idx').on(table.ownerId, table.createdAt.desc()),
    uniqueIndex('colors_favorites_unique_idx')
      .on(table.ownerId, table.kind, table.ref)
      .where(sql`${table.deletedAt} is null`),
  ],
)

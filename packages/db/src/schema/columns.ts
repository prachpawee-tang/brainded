import { isNull } from 'drizzle-orm'
import { type PgColumn, timestamp, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

/** Columns every user-owned table must have (CLAUDE.md §7). */
export const ownedColumns = () => ({
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  ownerId: uuid('owner_id').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamptz('deleted_at'),
})

/** `where` clause that hides soft-deleted rows. */
export const notDeleted = (table: { deletedAt: PgColumn }) => isNull(table.deletedAt)

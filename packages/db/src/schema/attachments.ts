import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from './auth'
import { ownedColumns } from './columns'

/**
 * Core primitive: a stored file linked to any entity (CLAUDE.md §4).
 * The bytes live in object storage; this row holds the key (`<ownerId>/...`).
 */
export const attachments = pgTable(
  'core_attachments',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    storageKey: text('storage_key').notNull(),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('core_attachments_entity_idx').on(
      table.ownerId,
      table.entityType,
      table.entityId,
      table.position,
    ),
  ],
)

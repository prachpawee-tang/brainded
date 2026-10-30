import { date, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from './auth'
import { ownedColumns } from './columns'

/** Core primitive: a to-do, optionally attached to an entity (CLAUDE.md §4). */
export const tasks = pgTable(
  'core_tasks',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    title: text('title').notNull(),
    note: text('note'),
    dueOn: date('due_on', { mode: 'string' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [index('core_tasks_entity_idx').on(table.ownerId, table.entityType, table.entityId)],
)

import { date, index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from './auth'
import { ownedColumns } from './columns'

/**
 * Core primitive: append-only history entries for any entity (CLAUDE.md §4).
 * `entity_type` is `<module>.<entity>` (e.g. `pets.pet`); `kind` is module-defined (e.g. `pets.weight`).
 */
export const timelineEvents = pgTable(
  'core_timeline_events',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    kind: text('kind').notNull(),
    occurredOn: date('occurred_on', { mode: 'string' }).notNull(),
    body: text('body'),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [
    index('core_timeline_events_entity_idx').on(
      table.ownerId,
      table.entityType,
      table.entityId,
      table.occurredOn.desc(),
      table.id.desc(),
    ),
  ],
)

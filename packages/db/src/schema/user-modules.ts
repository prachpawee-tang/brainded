import { boolean, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from './auth'
import { ownedColumns } from './columns'

/** Per-user module state. No row = module uses its default (enabled). */
export const userModules = pgTable(
  'core_user_modules',
  {
    ...ownedColumns(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    moduleId: text('module_id').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [uniqueIndex('core_user_modules_owner_module_idx').on(table.ownerId, table.moduleId)],
)

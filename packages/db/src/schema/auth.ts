// Better Auth core tables (+ username plugin, + user preferences).
// Generated with `pnpm dlx auth@latest generate`, then adapted to our conventions.
// If you add a Better Auth plugin that needs schema, regenerate and merge here.
import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const id = () => uuid('id').default(sql`gen_random_uuid()`).primaryKey()
const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })
const createdAt = () => timestamptz('created_at').defaultNow().notNull()
const updatedAt = () =>
  timestamptz('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()

export const authUsers = pgTable('auth_users', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  locale: text('locale').default('th'),
  theme: text('theme').default('system'),
})

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: id(),
    expiresAt: timestamptz('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
  },
  (table) => [index('auth_sessions_user_id_idx').on(table.userId)],
)

export const authAccounts = pgTable(
  'auth_accounts',
  {
    id: id(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamptz('access_token_expires_at'),
    refreshTokenExpiresAt: timestamptz('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('auth_accounts_user_id_idx').on(table.userId)],
)

export const authVerifications = pgTable(
  'auth_verifications',
  {
    id: id(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamptz('expires_at').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('auth_verifications_identifier_idx').on(table.identifier)],
)

/** Keys match Better Auth model names (passed to the drizzle adapter). */
export const authSchema = {
  user: authUsers,
  session: authSessions,
  account: authAccounts,
  verification: authVerifications,
}

import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { expo } from '@better-auth/expo'
import { authSchema, type Database } from '@brain/db'
import { betterAuth } from 'better-auth'
import { username } from 'better-auth/plugins'

export type OAuthCredentials = { clientId: string; clientSecret: string }

export type CreateAuthOptions = {
  db: Database
  /** BETTER_AUTH_SECRET — ≥ 32 random chars. */
  secret: string
  /** Public URL of the API (e.g. http://localhost:4000). */
  baseURL: string
  /** Browser origins + app deep-link schemes allowed to call auth endpoints. */
  trustedOrigins: string[]
  google?: OAuthCredentials
}

export const AUTH_BASE_PATH = '/api/auth'

export const createAuth = ({ db, secret, baseURL, trustedOrigins, google }: CreateAuthOptions) =>
  betterAuth({
    secret,
    baseURL,
    basePath: AUTH_BASE_PATH,
    trustedOrigins,
    database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
    advanced: {
      database: { generateId: 'uuid' },
      // Better Auth skips origin checks when NODE_ENV=test; force them on so tests match prod.
      disableOriginCheck: false,
    },
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    socialProviders: google ? { google } : {},
    account: {
      accountLinking: {
        enabled: true,
        // Users link extra providers from Settings; we don't silently merge on sign-in.
        trustedProviders: ['google'],
      },
    },
    user: {
      additionalFields: {
        locale: { type: 'string', required: false, defaultValue: 'th', input: false },
        theme: { type: 'string', required: false, defaultValue: 'system', input: false },
      },
    },
    plugins: [username(), expo()],
  })

export type Auth = ReturnType<typeof createAuth>

import { defineConfig } from 'drizzle-kit'

// Neon env vars live in the repo root .env.local (written by `neon env pull`).
try {
  process.loadEnvFile('../../.env.local')
} catch {
  // CI / other environments provide env vars directly.
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  casing: 'snake_case',
  // Migrations need a DIRECT (non-pooled) connection — PgBouncer transaction mode breaks them.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '' },
})

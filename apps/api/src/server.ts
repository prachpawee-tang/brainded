import { createDb } from '@brain/db'
import { serve } from '@hono/node-server'
import { appConfigFromEnv, createAppFromConfig } from './config'

// Node runtime (local dev, Docker). Cloudflare Workers use `worker.ts`.
const DEFAULT_PORT = 4000

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required (see .env.example)')

const port = Number(process.env.PORT ?? DEFAULT_PORT)
const app = createAppFromConfig(appConfigFromEnv(process.env), createDb(databaseUrl))

serve({ fetch: app.fetch, port }, ({ port: actual }) => {
  console.warn(`api ready → http://localhost:${actual}/graphql`)
})

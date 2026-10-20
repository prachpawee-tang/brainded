import { createDb } from '@brain/db'
import { serve } from '@hono/node-server'
import { createApp } from './app'

const DEFAULT_PORT = 4000

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required (see .env.example)')

const port = Number(process.env.PORT ?? DEFAULT_PORT)
const app = createApp({
  db: createDb(databaseUrl),
  isProduction: process.env.NODE_ENV === 'production',
})

serve({ fetch: app.fetch, port }, ({ port: actual }) => {
  console.warn(`api ready → http://localhost:${actual}/graphql`)
})

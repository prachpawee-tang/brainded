import { createAuth } from '@brain/auth'
import { createDb } from '@brain/db'
import { serve } from '@hono/node-server'
import { createApp } from './app'

const DEFAULT_PORT = 4000
const DEFAULT_APP_ORIGIN = 'http://localhost:8081'
const APP_SCHEME = 'brain://'
/** Expo Go / dev clients use exp:// with the machine's LAN IP. Dev only. */
const DEV_SCHEMES = ['exp://', 'exp://**']

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required (see .env.example)`)
  return value
}

const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT ?? DEFAULT_PORT)
const allowedOrigins = (process.env.APP_ORIGINS ?? DEFAULT_APP_ORIGIN).split(',')
const db = createDb(required('DATABASE_URL'))

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

const auth = createAuth({
  db,
  secret: required('BETTER_AUTH_SECRET'),
  baseURL: process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`,
  trustedOrigins: [...allowedOrigins, APP_SCHEME, ...(isProduction ? [] : DEV_SCHEMES)],
  ...(googleClientId && googleClientSecret
    ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
    : {}),
})

const app = createApp({ db, auth, isProduction, allowedOrigins })

serve({ fetch: app.fetch, port }, ({ port: actual }) => {
  console.warn(`api ready → http://localhost:${actual}/graphql`)
})

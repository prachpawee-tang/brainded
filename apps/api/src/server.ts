import { S3Client } from '@aws-sdk/client-s3'
import { createAuth } from '@brain/auth'
import { createDb } from '@brain/db'
import { createS3Storage } from '@brain/storage'
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

// S3-compatible object storage (Neon Object Storage now; R2/S3 later). Credentials, endpoint and
// region come from the standard AWS_* env vars written by `neon env pull`.
const storage = createS3Storage({
  bucket: process.env.STORAGE_BUCKET ?? 'brain-files',
  client: new S3Client({ forcePathStyle: true }),
})

const app = createApp({ db, auth, storage, isProduction, allowedOrigins })

serve({ fetch: app.fetch, port }, ({ port: actual }) => {
  console.warn(`api ready → http://localhost:${actual}/graphql`)
})

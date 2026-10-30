import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3'
import { createAuth } from '@brain/auth'
import type { Database } from '@brain/db'
import { createS3Storage } from '@brain/storage'
import { createApp } from './app'

// One place that turns environment variables into app settings, for both runtimes:
// Node (`server.ts`, process.env) and Cloudflare Workers (`worker.ts`, bindings).

export type ApiEnv = Partial<Record<string, string>>

const LOCAL_BASE_URL = 'http://localhost:4000'
const LOCAL_APP_ORIGIN = 'http://localhost:8081'
const APP_SCHEME = 'brain://'
/** Expo Go / dev clients use exp:// with the machine's LAN IP. Dev only. */
const DEV_SCHEMES = ['exp://', 'exp://**']

const required = (env: ApiEnv, name: string): string => {
  const value = env[name]
  if (!value) throw new Error(`${name} is required (see .env.example)`)
  return value
}

/**
 * `origin` is the request's own origin when hosted: web and API share one domain there, so it is
 * both the auth base URL and the only browser origin, unless env overrides them.
 */
export const appConfigFromEnv = (env: ApiEnv, { origin }: { origin?: string } = {}) => {
  const isProduction = env.NODE_ENV === 'production'
  const allowedOrigins = env.APP_ORIGINS?.split(',') ?? [origin ?? LOCAL_APP_ORIGIN]
  const s3: S3ClientConfig = { forcePathStyle: true }
  if (env.AWS_REGION) s3.region = env.AWS_REGION
  if (env.AWS_ENDPOINT_URL_S3) s3.endpoint = env.AWS_ENDPOINT_URL_S3
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    s3.credentials = {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
  }
  return {
    isProduction,
    secret: required(env, 'BETTER_AUTH_SECRET'),
    baseURL: env.BETTER_AUTH_URL ?? origin ?? LOCAL_BASE_URL,
    allowedOrigins,
    trustedOrigins: [...allowedOrigins, APP_SCHEME, ...(isProduction ? [] : DEV_SCHEMES)],
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
        : null,
    storageBucket: env.STORAGE_BUCKET ?? 'brain-files',
    s3,
  }
}

export type AppConfig = ReturnType<typeof appConfigFromEnv>

/** Wires auth + S3-compatible storage (Neon Object Storage now) + the Hono app. */
export const createAppFromConfig = (config: AppConfig, db: Database) => {
  const auth = createAuth({
    db,
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: config.trustedOrigins,
    ...(config.google ? { google: config.google } : {}),
  })
  const storage = createS3Storage({ bucket: config.storageBucket, client: new S3Client(config.s3) })
  return createApp({
    db,
    auth,
    storage,
    isProduction: config.isProduction,
    allowedOrigins: config.allowedOrigins,
  })
}

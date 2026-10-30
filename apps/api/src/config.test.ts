import { describe, expect, it } from 'vitest'
import { appConfigFromEnv } from './config'

const BASE = { BETTER_AUTH_SECRET: 'x'.repeat(32) }

describe('appConfigFromEnv', () => {
  it('needs the auth secret', () => {
    expect(() => appConfigFromEnv({})).toThrow('BETTER_AUTH_SECRET is required')
  })

  it('defaults to local development', () => {
    const config = appConfigFromEnv(BASE)
    expect(config).toMatchObject({
      isProduction: false,
      baseURL: 'http://localhost:4000',
      allowedOrigins: ['http://localhost:8081'],
      storageBucket: 'brain-files',
      google: null,
    })
    expect(config.trustedOrigins).toEqual([
      'http://localhost:8081',
      'brain://',
      'exp://',
      'exp://**',
    ])
  })

  it('serves its own origin when hosted (web and API on one domain)', () => {
    const config = appConfigFromEnv(
      { ...BASE, NODE_ENV: 'production', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' },
      { origin: 'https://brain.example.workers.dev' },
    )
    expect(config).toMatchObject({
      isProduction: true,
      baseURL: 'https://brain.example.workers.dev',
      allowedOrigins: ['https://brain.example.workers.dev'],
      google: { clientId: 'id', clientSecret: 'secret' },
    })
    expect(config.trustedOrigins).toEqual(['https://brain.example.workers.dev', 'brain://'])
  })

  it('lets env override the URL and origins', () => {
    const config = appConfigFromEnv(
      {
        ...BASE,
        BETTER_AUTH_URL: 'https://api.test',
        APP_ORIGINS: 'https://a.test,https://b.test',
      },
      { origin: 'https://ignored.test' },
    )
    expect(config.baseURL).toBe('https://api.test')
    expect(config.allowedOrigins).toEqual(['https://a.test', 'https://b.test'])
  })

  it('passes explicit S3 settings when present (Workers have no AWS_* process env)', () => {
    const config = appConfigFromEnv({
      ...BASE,
      AWS_ACCESS_KEY_ID: 'key',
      AWS_SECRET_ACCESS_KEY: 'secret',
      AWS_ENDPOINT_URL_S3: 'https://s3.test',
      AWS_REGION: 'ap-southeast-1',
    })
    expect(config.s3).toEqual({
      forcePathStyle: true,
      region: 'ap-southeast-1',
      endpoint: 'https://s3.test',
      credentials: { accessKeyId: 'key', secretAccessKey: 'secret' },
    })
    expect(appConfigFromEnv(BASE).s3).toEqual({ forcePathStyle: true })
  })
})

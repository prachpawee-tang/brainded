import { closeDb, createDb } from '@brain/db'
import { type ApiEnv, appConfigFromEnv, createAppFromConfig } from './config'

// Cloudflare Workers runtime: one Worker serves the web app (static assets) and the API on the
// same origin, so session cookies stay first-party. Postgres goes through Hyperdrive.

type WorkerEnv = ApiEnv & {
  HYPERDRIVE: { connectionString: string }
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}
type ExecutionContext = { waitUntil: (promise: Promise<unknown>) => void }

const API_PREFIXES = ['/api/', '/graphql', '/healthz']

/** Paths the Worker answers; everything else is the web app (keep in sync with wrangler.jsonc). */
export const isApiPath = (pathname: string) =>
  API_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix),
  )

// biome-ignore lint/style/noDefaultExport: the Workers runtime loads the module's default export
export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (!isApiPath(url.pathname)) return env.ASSETS.fetch(request)
    // I/O objects can't be shared across requests in Workers; Hyperdrive keeps the real pool.
    const db = createDb(env.HYPERDRIVE.connectionString)
    try {
      const app = createAppFromConfig(appConfigFromEnv(env, { origin: url.origin }), db)
      return await app.fetch(request)
    } finally {
      ctx.waitUntil(closeDb(db))
    }
  },
}

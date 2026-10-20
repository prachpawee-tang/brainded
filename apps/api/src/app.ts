import { AUTH_BASE_PATH, type Auth } from '@brain/auth'
import type { Database } from '@brain/db'
import type { GraphQLContext } from '@brain/graphql'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { createYoga } from 'graphql-yoga'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { buildApiSchema } from './schema'

export type AppDeps = {
  db: Database
  auth: Auth
  isProduction: boolean
  /** Exact origins allowed to call the API from a browser (the web app). */
  allowedOrigins: string[]
}

/** Runtime-agnostic app: the same instance runs on Node, Cloudflare Workers or Docker. */
export const createApp = ({ db, auth, isProduction, allowedOrigins }: AppDeps) => {
  const yoga = createYoga<Record<string, unknown>, GraphQLContext>({
    schema: buildApiSchema(),
    graphqlEndpoint: '/graphql',
    graphiql: !isProduction,
    maskedErrors: true,
    cors: false, // handled by Hono below with an explicit allowlist
    plugins: isProduction ? [useDisableIntrospection()] : [],
    context: async ({ request }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      return {
        db,
        viewer: session ? { id: session.user.id } : null,
        requestId: crypto.randomUUID(),
      }
    },
  })

  const app = new Hono()
  app.use(
    '*',
    cors({
      origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
      credentials: true,
    }),
  )
  app.on(['GET', 'POST'], `${AUTH_BASE_PATH}/*`, (c) => auth.handler(c.req.raw))
  app.get('/healthz', (c) => c.json({ status: 'ok' }))
  app.on(['GET', 'POST', 'OPTIONS'], '/graphql', (c) => yoga.fetch(c.req.raw))
  return app
}

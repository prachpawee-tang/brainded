import type { Database } from '@brain/db'
import type { GraphQLContext } from '@brain/graphql'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { createYoga } from 'graphql-yoga'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { buildApiSchema } from './schema'

export type AppDeps = {
  db: Database
  isProduction: boolean
  /** Exact origins allowed to call the API from a browser (the web app). */
  allowedOrigins: string[]
}

/** Runtime-agnostic app: the same instance runs on Node, Cloudflare Workers or Docker. */
export const createApp = ({ db, isProduction, allowedOrigins }: AppDeps) => {
  const yoga = createYoga<Record<string, unknown>, GraphQLContext>({
    schema: buildApiSchema(),
    graphqlEndpoint: '/graphql',
    graphiql: !isProduction,
    maskedErrors: true,
    cors: false, // handled by Hono below with an explicit allowlist
    plugins: isProduction ? [useDisableIntrospection()] : [],
    context: () => ({ db, viewer: null, requestId: crypto.randomUUID() }),
  })

  const app = new Hono()
  app.use(
    '*',
    cors({
      origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
      credentials: true,
    }),
  )
  app.get('/healthz', (c) => c.json({ status: 'ok' }))
  app.on(['GET', 'POST', 'OPTIONS'], '/graphql', (c) => yoga.fetch(c.req.raw))
  return app
}

import type { Database } from '@brain/db'
import type { GraphQLContext } from '@brain/graphql'
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection'
import { createYoga } from 'graphql-yoga'
import { Hono } from 'hono'
import { buildApiSchema } from './schema'

export type AppDeps = {
  db: Database
  isProduction: boolean
}

/** Runtime-agnostic app: the same instance runs on Node, Cloudflare Workers or Docker. */
export const createApp = ({ db, isProduction }: AppDeps) => {
  const yoga = createYoga<Record<string, unknown>, GraphQLContext>({
    schema: buildApiSchema(),
    graphqlEndpoint: '/graphql',
    graphiql: !isProduction,
    maskedErrors: true,
    plugins: isProduction ? [useDisableIntrospection()] : [],
    context: () => ({ db, viewer: null, requestId: crypto.randomUUID() }),
  })

  const app = new Hono()
  app.get('/healthz', (c) => c.json({ status: 'ok' }))
  app.on(['GET', 'POST', 'OPTIONS'], '/graphql', (c) => yoga.fetch(c.req.raw))
  return app
}

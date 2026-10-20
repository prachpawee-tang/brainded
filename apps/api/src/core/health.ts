import { sql } from '@brain/db'
import type { Builder } from '@brain/graphql'

const HealthStatus = { OK: 'OK' } as const

export const registerHealth = (builder: Builder) => {
  const HealthStatusEnum = builder.enumType('HealthStatus', { values: Object.values(HealthStatus) })

  const Health = builder.objectRef<{ time: Date }>('Health').implement({
    fields: (t) => ({
      status: t.field({ type: HealthStatusEnum, resolve: () => HealthStatus.OK }),
      time: t.field({ type: 'DateTime', resolve: (health) => health.time }),
      database: t.boolean({
        resolve: async (_health, _args, { db }) => {
          await db.execute(sql`select 1`)
          return true
        },
      }),
    }),
  })

  builder.queryField('health', (t) =>
    t.field({ type: Health, resolve: () => ({ time: new Date() }) }),
  )
}

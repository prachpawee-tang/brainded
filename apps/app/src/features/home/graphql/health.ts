import { graphql } from '@/graphql/generated'

export const ApiHealthQuery = graphql(`
  query ApiHealth {
    health {
      status
    }
  }
`)

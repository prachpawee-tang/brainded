import { useEffect, useRef } from 'react'

type CacheClient = { resetStore: () => Promise<unknown>; clearStore: () => Promise<unknown> }

/**
 * Never show one user's cached data to another. Runs only when the user actually changes:
 * sign-in / switch → `resetStore` (clears AND refetches active queries, so the screen fills in);
 * sign-out → `clearStore` (nothing to refetch).
 */
export const useCacheResetOnUserChange = (client: CacheClient, userId: string | undefined) => {
  const previous = useRef(userId)
  useEffect(() => {
    if (previous.current === userId) return
    previous.current = userId
    if (userId) client.resetStore()
    else client.clearStore()
  }, [client, userId])
}

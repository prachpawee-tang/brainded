import DataLoader from 'dataloader'

const cache = new WeakMap<object, Map<string, DataLoader<string, unknown>>>()

/** One DataLoader per (request context, name) — batches N+1 lookups within a request. */
export const contextLoader = <V>(
  context: object,
  name: string,
  batch: (keys: readonly string[]) => Promise<V[]>,
): DataLoader<string, V> => {
  let loaders = cache.get(context)
  if (!loaders) {
    loaders = new Map()
    cache.set(context, loaders)
  }
  let loader = loaders.get(name)
  if (!loader) {
    loader = new DataLoader<string, unknown>(
      batch as (keys: readonly string[]) => Promise<unknown[]>,
    )
    loaders.set(name, loader)
  }
  return loader as DataLoader<string, V>
}

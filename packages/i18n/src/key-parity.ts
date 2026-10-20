export type LocaleTree = { [key: string]: string | LocaleTree }

const isTree = (value: unknown): value is LocaleTree =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Dotted key paths present in `reference` but missing in `target`. */
export const findMissingKeys = (reference: LocaleTree, target: unknown, prefix = ''): string[] =>
  Object.entries(reference).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    const targetValue = isTree(target) ? target[key] : undefined
    if (isTree(value)) return findMissingKeys(value, targetValue, path)
    return targetValue === undefined ? [path] : []
  })

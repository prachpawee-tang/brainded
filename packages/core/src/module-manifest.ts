const MODULE_ID_PATTERN = /^[a-z][a-z0-9-]*$/

/**
 * Static description of a module. The app shell uses it for tiles, routes and i18n;
 * the API uses `id` to validate per-user module state. Name/description live in the
 * module's i18n namespace under `module.name` / `module.description`.
 */
export type ModuleManifest = {
  /** kebab-case, unique, also the commitlint scope and the `moduleColors` key. */
  id: string
  /** Emoji for now; swap for an icon set later without touching callers. */
  icon: string
  /** Expo Router path of the module's home screen. */
  route: `/${string}` | string
  /** i18n namespace (usually equals `id`). */
  namespace: string
  /** Feature flags for unfinished features (CLAUDE.md §3). */
  features?: Record<string, boolean>
}

export const defineModule = <T extends ModuleManifest>(manifest: T): T => {
  if (!MODULE_ID_PATTERN.test(manifest.id)) throw new Error(`Invalid module id: ${manifest.id}`)
  if (!manifest.route.startsWith('/')) {
    throw new Error(`Module route must start with "/": ${manifest.route}`)
  }
  return manifest
}

export const findModule = (modules: readonly ModuleManifest[], id: string) =>
  modules.find((module) => module.id === id)

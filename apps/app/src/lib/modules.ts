import type { ModuleManifest } from '@brain/core'
import { colorsModule } from '@brain/module-colors/manifest'
import { petsModule } from '@brain/module-pets/manifest'
import { moduleColors } from '@brain/ui/tokens'
import { useUniwind } from 'uniwind'

/** Every module the app shell knows about, in display order. Keep in sync with apps/api/src/modules.ts. */
export const MODULES: readonly ModuleManifest[] = [petsModule, colorsModule]

const FALLBACK_ACCENT = { light: '#e7e1d8', dark: '#2f2c28' }

/** Module accent color for the active theme. */
export const useModuleAccent = (moduleId: string): string => {
  const { theme } = useUniwind()
  const colors = moduleColors[moduleId] ?? FALLBACK_ACCENT
  return theme === 'dark' ? colors.dark : colors.light
}

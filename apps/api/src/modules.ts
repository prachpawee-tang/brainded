import type { ModuleManifest } from '@brain/core'
import { colorsModule } from '@brain/module-colors/manifest'
import { petsModule } from '@brain/module-pets/manifest'

/** Every module the API knows about, in display order. Register new modules here. */
export const MODULES: readonly ModuleManifest[] = [petsModule, colorsModule]

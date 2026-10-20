import { vitestPreset } from '@brain/config/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  vitestPreset,
  defineConfig({ test: { coverage: { exclude: ['src/testing/**'] } } }),
)

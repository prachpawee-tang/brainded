import type { UserConfig } from '@commitlint/types'

// Keep in sync with CLAUDE.md §9. Add every new module id here.
export const SCOPES = [
  'app',
  'api',
  'ui',
  'i18n',
  'db',
  'auth',
  'graphql',
  'core',
  'storage',
  'ai',
  'config',
  'ci',
  'deps',
  'docs',
  'release',
  // modules
  'pets',
  'colors',
] as const

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [...SCOPES]],
    'header-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', ['lower-case']],
  },
  prompt: {
    scopes: [...SCOPES],
    allowCustomScopes: false,
    allowEmptyScopes: true,
    enableMultipleScopes: true,
  },
}

export default config

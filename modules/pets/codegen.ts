import type { CodegenConfig } from '@graphql-codegen/cli'

// The module owns its typed operations (no dependency on apps/app). Same schema as the app.
const config: CodegenConfig = {
  schema: '../../packages/graphql/schema.graphql',
  documents: ['app/**/*.{ts,tsx}', '!app/graphql/generated/**'],
  ignoreNoDocuments: true,
  generates: {
    './app/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        nonOptionalTypename: true,
        scalars: { DateTime: 'string', LocalDate: 'string' },
      },
      presetConfig: { fragmentMasking: false },
    },
  },
}

export default config

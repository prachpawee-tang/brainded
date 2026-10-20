import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../../packages/graphql/schema.graphql',
  documents: [
    'src/**/*.{ts,tsx}',
    '../../modules/*/app/**/*.{ts,tsx}',
    '!src/graphql/generated/**',
  ],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        nonOptionalTypename: true,
        enumsAsTypes: true,
        scalars: { DateTime: 'string' },
      },
      presetConfig: { fragmentMasking: { unmaskFunctionName: 'getFragmentData' } },
    },
  },
}

export default config

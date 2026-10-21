/** @type {import('jest').Config} */
export default {
  preset: 'jest-expo',
  // Screens render real i18n + Apollo; leave headroom when turbo runs packages in parallel.
  testTimeout: 30_000,
  moduleNameMapper: {
    // lucide's react-native entry is .mjs, which jest-expo doesn't transform; use its CJS build.
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/*.web.tsx',
    '!src/**/*.types.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
}

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Screens render real i18n + Apollo; leave headroom when turbo runs packages in parallel.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    // lucide's react-native entry is .mjs, which jest-expo doesn't transform; use its CJS build.
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/graphql/generated/**',
    '!src/app/**',
    '!src/test/**',
  ],
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
}

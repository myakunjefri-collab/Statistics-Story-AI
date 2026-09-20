import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/statistics/**/*.ts',
        'src/lib/data-processing/**/*.ts',
        'src/lib/ai/**/*.ts',
        'src/lib/auth/**/*.ts',
        'src/lib/storage/**/*.ts',
        'src/lib/result/**/*.ts',
        'src/lib/format.ts',
        'src/lib/utils.ts',
        'src/lib/validation.ts',
        'src/lib/stores/**/*.ts',
        'app/api/**/*.ts',
      ],
      exclude: [
        'src/lib/types.ts',
        'src/lib/statistics/types.ts',
        'src/lib/data-processing/types.ts',
        'src/lib/storage/database-adapter.ts',
        'src/lib/storage/postgres-adapter.ts',
        'src/lib/api.ts',
        'src/lib/auth.tsx',
        'src/lib/navigation.tsx',
        'src/lib/queries/**',
        '**/*.d.ts',
        'tests/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

import type { IDatabaseAdapter } from './database-adapter'
import { MemoryFallbackDatabaseAdapter } from './memory-fallback-adapter'
import { PostgresAdapter } from './postgres-adapter'

export * from './database-adapter'
export * from './memory-fallback-adapter'
export * from './postgres-adapter'
export * from './repositories/analysis-repository'
export * from './repositories/user-repository'

let globalAdapter: IDatabaseAdapter | null = null

export function getDatabaseAdapter(): IDatabaseAdapter {
  if (globalAdapter) {
    return globalAdapter
  }

  const databaseUrl = process.env.DATABASE_URL

  if (process.env.NODE_ENV === 'production' && process.env.TEST_MODE !== 'true') {
    if (!databaseUrl) {
      throw new Error(
        'FATAL: DATABASE_URL must be configured in production environment. In-memory fallback is strictly forbidden in production.',
      )
    }
    globalAdapter = new PostgresAdapter(databaseUrl)
    return globalAdapter
  }

  // Development or Test environment
  if (databaseUrl) {
    globalAdapter = new PostgresAdapter(databaseUrl)
  } else {
    globalAdapter = new MemoryFallbackDatabaseAdapter()
  }

  return globalAdapter
}

import { useQuery } from '@tanstack/react-query'
import { fetchAnalyses } from '@/lib/api'
import type { Analisis } from '@/lib/types'

export const ANALYSES_QUERY_KEY = ['analyses'] as const

export interface UseAnalysesQueryOptions {
  initialData?: Analisis[]
  enabled?: boolean
}

/**
 * Custom hook for fetching and caching the list of statistical analyses.
 *
 * Cache Strategy:
 * - staleTime: 2 minutes (120,000ms) — balances fresh server updates with snappy navigation.
 * - gcTime: 15 minutes (900,000ms) — retains cached records in memory across page visits.
 */
export function useAnalysesQuery(options?: UseAnalysesQueryOptions) {
  return useQuery({
    queryKey: ANALYSES_QUERY_KEY,
    queryFn: () => fetchAnalyses(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    initialData: options?.initialData,
    enabled: options?.enabled,
  })
}

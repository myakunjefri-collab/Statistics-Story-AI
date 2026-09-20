import { useQuery } from '@tanstack/react-query'
import { fetchHasil } from '@/lib/api'
import type { HasilAnalisis } from '@/lib/types'

export const HASIL_QUERY_KEY = ['hasil'] as const

export interface UseAnalysisResultQueryOptions {
  id?: string
  initialData?: HasilAnalisis
  enabled?: boolean
}

/**
 * Custom hook for fetching and caching statistical result interpretation.
 *
 * Cache Strategy:
 * - staleTime: 10 minutes (600,000ms) — statistical computation results are highly stable.
 * - gcTime: 30 minutes (1,800,000ms) — long retention for smooth tab switching and result re-reads.
 */
export function useAnalysisResultQuery(options?: UseAnalysisResultQueryOptions) {
  const queryKey = options?.id ? (['hasil', options.id] as const) : HASIL_QUERY_KEY

  return useQuery({
    queryKey,
    queryFn: () => fetchHasil(options?.id),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    initialData: options?.initialData,
    enabled: options?.enabled,
  })
}

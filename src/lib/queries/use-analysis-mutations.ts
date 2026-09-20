import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnalysis, deleteAnalysis, updateAnalysis } from '@/lib/api'
import { ANALYSES_QUERY_KEY } from '@/lib/queries/use-analyses-query'
import type { AnalisisBaru } from '@/lib/types'

/**
 * Mutation hook for creating a new statistical analysis.
 * Automatically invalidates and refetches the ['analyses'] query cache on success.
 */
export function useCreateAnalysisMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: AnalisisBaru) => createAnalysis(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })
    },
  })
}

/**
 * Mutation hook for updating an existing statistical analysis.
 * Automatically invalidates and refetches the ['analyses'] query cache on success.
 */
export function useUpdateAnalysisMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: AnalisisBaru }) =>
      updateAnalysis(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })
    },
  })
}

/**
 * Mutation hook for deleting an existing statistical analysis.
 * Automatically invalidates and refetches the ['analyses'] query cache on success.
 */
export function useDeleteAnalysisMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })
    },
  })
}

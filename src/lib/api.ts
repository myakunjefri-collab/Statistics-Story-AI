import type { Analisis, AnalisisBaru, HasilAnalisis } from '@/lib/types'
import {
  analysesResponseSchema,
  deleteAnalysisResponseSchema,
  hasilResponseSchema,
  singleAnalysisResponseSchema,
} from '@/lib/validation'

// Typed Fetch API wrappers using Zod runtime schema validation.
// Guarantees that data entering TanStack Query cache strictly adheres to domain schemas.

export async function fetchAnalyses(options?: { fail?: boolean }): Promise<Analisis[]> {
  const query = options?.fail ? '?fail=1' : ''
  const res = await fetch(`/api/analyses${query}`, { cache: 'no-store' })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal mengambil riwayat analisis.')
  }

  const rawJson: unknown = await res.json()
  const validation = analysesResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi skema REST response untuk riwayat analisis gagal.')
  }

  return validation.data.data
}

export async function fetchHasil(
  id?: string,
  options?: { fail?: boolean },
): Promise<HasilAnalisis> {
  const params = new URLSearchParams()
  if (id) params.set('id', id)
  if (options?.fail) params.set('fail', '1')
  const query = params.toString() ? `?${params.toString()}` : ''

  const res = await fetch(`/api/hasil${query}`, { cache: 'no-store' })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal mengambil hasil analisis.')
  }

  const rawJson: unknown = await res.json()
  const validation = hasilResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi skema REST response untuk hasil analisis gagal.')
  }

  return validation.data.data
}

export async function createAnalysis(payload: AnalisisBaru): Promise<Analisis> {
  const res = await fetch('/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal membuat analisis baru.')
  }

  const rawJson: unknown = await res.json()
  const validation = singleAnalysisResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi response server untuk pembuatan analisis gagal.')
  }

  return validation.data.data
}

export async function updateAnalysis(id: string, payload: AnalisisBaru): Promise<Analisis> {
  const res = await fetch(`/api/analyses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal memperbarui analisis.')
  }

  const rawJson: unknown = await res.json()
  const validation = singleAnalysisResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi response server untuk pembaruan analisis gagal.')
  }

  return validation.data.data
}

export async function deleteAnalysis(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal menghapus analisis.')
  }

  const rawJson: unknown = await res.json()
  const validation = deleteAnalysisResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi response server untuk penghapusan analisis gagal.')
  }

  return validation.data.data
}

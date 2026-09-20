'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AnalysisFormDialog } from '@/components/app/analysis-form-dialog'
import { ConfirmDialog } from '@/components/app/confirm-dialog'
import { AnalysisFilters } from '@/components/dashboard/analysis-filters'
import { AnalysisList } from '@/components/dashboard/analysis-list'
import { DashboardSummary } from '@/components/dashboard/dashboard-summary'
import { buttonVariants } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAnalysesQuery } from '@/lib/queries/use-analyses-query'
import {
  useCreateAnalysisMutation,
  useDeleteAnalysisMutation,
  useUpdateAnalysisMutation,
} from '@/lib/queries/use-analysis-mutations'
import { useUIStore } from '@/lib/stores/ui-store'
import type { Analisis, AnalisisBaru, FilterJenis } from '@/lib/types'

const filters: FilterJenis[] = ['Semua', 'Deskriptif', 'Uji t', 'Korelasi', 'Regresi']

export interface DashboardClientViewProps {
  initialData?: Analisis[]
}

export function DashboardClientView({ initialData = [] }: DashboardClientViewProps) {
  const { toast } = useToast()

  // 1. Server State: Managed by TanStack Query v5
  const { data: analyses = [], isLoading, isError, refetch } = useAnalysesQuery({ initialData })

  // Mutations with automatic cache invalidation
  const createMutation = useCreateAnalysisMutation()
  const updateMutation = useUpdateAnalysisMutation()
  const deleteMutation = useDeleteAnalysisMutation()

  // 2. Client UI State: Managed by Zustand via precise individual selectors
  const filter = useUIStore((state) => state.selectedAnalysisFilter)
  const setFilter = useUIStore((state) => state.setSelectedAnalysisFilter)

  const query = useUIStore((state) => state.analysisSearchQuery)
  const setQuery = useUIStore((state) => state.setAnalysisSearchQuery)

  const formOpen = useUIStore((state) => state.isAnalysisFormOpen)
  const setFormOpen = useUIStore((state) => state.setAnalysisFormOpen)

  const editingId = useUIStore((state) => state.editingAnalysisId)
  const setEditingId = useUIStore((state) => state.setEditingAnalysisId)

  // Local transient state strictly for delete confirmation dialog
  const [deleting, setDeleting] = useState<Analisis | null>(null)

  // Active record being edited
  const editing = useMemo(
    () => analyses.find((a) => a.id === editingId) ?? null,
    [analyses, editingId],
  )

  // 3. Derived filtered list: computed from TanStack Query data + Zustand filter/query
  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      const matchJenis = filter === 'Semua' || a.jenisAnalisis === filter
      const matchQuery = a.nama.toLowerCase().includes(query.trim().toLowerCase())
      return matchJenis && matchQuery
    })
  }, [analyses, filter, query])

  const counts = useMemo(
    () => ({
      total: analyses.length,
      selesai: analyses.filter((a) => a.status === 'Selesai').length,
      diproses: analyses.filter((a) => a.status === 'Diproses').length,
    }),
    [analyses],
  )

  const fase: 'loading' | 'error' | 'ready' = isLoading ? 'loading' : isError ? 'error' : 'ready'

  function handleCreate(values: AnalisisBaru) {
    createMutation.mutate(values, {
      onSuccess: (baru) => {
        toast(`Analisis "${baru.nama}" ditambahkan.`)
        setFormOpen(false)
        setEditingId(null)
      },
      onError: (err) => {
        toast(err instanceof Error ? err.message : 'Gagal membuat analisis.', 'error')
      },
    })
  }

  function handleUpdate(values: AnalisisBaru) {
    if (!editing) return
    updateMutation.mutate(
      { id: editing.id, values },
      {
        onSuccess: (updated) => {
          toast(`Analisis "${updated.nama}" diperbarui.`)
          setFormOpen(false)
          setEditingId(null)
        },
        onError: (err) => {
          toast(err instanceof Error ? err.message : 'Gagal memperbarui analisis.', 'error')
        },
      },
    )
  }

  function handleDelete() {
    if (!deleting) return
    const deletedName = deleting.nama
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast(`Analisis "${deletedName}" dihapus.`, 'error')
        setDeleting(null)
      },
      onError: (err) => {
        toast(err instanceof Error ? err.message : 'Gagal menghapus analisis.', 'error')
      },
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <Link href="/input" className={buttonVariants({ variant: 'default' })}>
          <Plus className="size-4 mr-1.5" aria-hidden="true" />
          Analisis Baru
        </Link>
      </div>

      <DashboardSummary total={counts.total} selesai={counts.selesai} diproses={counts.diproses} />

      <AnalysisFilters
        filters={filters}
        activeFilter={filter}
        onFilterChange={setFilter}
        query={query}
        onQueryChange={setQuery}
      />

      <AnalysisList
        fase={fase}
        items={filtered}
        totalDataCount={analyses.length}
        onRetry={() => refetch()}
        onOpenCreate={() => {
          setEditingId(null)
          setFormOpen(true)
        }}
        onEdit={(item) => {
          setEditingId(item.id)
          setFormOpen(true)
        }}
        onDelete={(item) => setDeleting(item)}
      />

      <AnalysisFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingId(null)
        }}
        initial={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hapus analisis?"
        description={
          deleting
            ? `Analisis "${deleting.nama}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}

import { ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { StatusBadge } from '@/components/app/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states'
import { formatTanggal } from '@/lib/format'
import { Link } from '@/lib/navigation'
import type { Analisis } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface AnalysisListProps {
  fase: 'idle' | 'loading' | 'error' | 'ready'
  items: Analisis[]
  totalDataCount: number
  onRetry: () => void
  onOpenCreate: () => void
  onEdit: (item: Analisis) => void
  onDelete: (item: Analisis) => void
}

export function AnalysisList({
  fase,
  items,
  totalDataCount,
  onRetry,
  onOpenCreate,
  onEdit,
  onDelete,
}: AnalysisListProps) {
  if (fase === 'loading') {
    return <LoadingState label="Memuat riwayat analisis..." />
  }

  if (fase === 'error') {
    return <ErrorState message="Gagal memuat riwayat analisis." onRetry={onRetry} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={totalDataCount === 0 ? 'Belum ada analisis.' : 'Tidak ada hasil yang cocok.'}
        description={
          totalDataCount === 0
            ? 'Mulai dengan membuat analisis pertama Anda.'
            : 'Coba ubah kata kunci atau filter jenis analisis.'
        }
        action={
          totalDataCount === 0 ? (
            <Button size="sm" onClick={onOpenCreate}>
              <Plus aria-hidden="true" />
              Analisis Baru
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((a, i) => (
        <motion.li
          key={a.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.15) }}
        >
          <Card interactive padding="none" className="overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-medium text-ink">{a.nama}</h2>
                  <Badge variant="accent">{a.jenisAnalisis}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <StatusBadge status={a.status} />
                  <span className="tnum">{formatTanggal(a.tanggal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/hasil/${a.id}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  aria-label={`Lihat hasil ${a.nama}`}
                >
                  Lihat
                  <ArrowUpRight aria-hidden="true" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(a)}
                  aria-label={`Ubah ${a.nama}`}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(a)}
                  aria-label={`Hapus ${a.nama}`}
                  className="text-muted-foreground hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.li>
      ))}
    </ul>
  )
}

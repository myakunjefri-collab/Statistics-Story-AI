import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/states'

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      className="space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Memuat data dasbor"
    >
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} padding="md" className="h-24 bg-surface-strong/50" />
        ))}
      </div>
      <LoadingState label="Memuat riwayat analisis secara streaming..." />
    </div>
  )
}

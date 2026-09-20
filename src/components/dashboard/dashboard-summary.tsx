import { Card } from '@/components/ui/card'

export interface DashboardSummaryProps {
  total: number
  selesai: number
  diproses: number
}

export function DashboardSummary({ total, selesai, diproses }: DashboardSummaryProps) {
  return (
    <section aria-labelledby="ringkasan-heading" className="space-y-3">
      <h2 id="ringkasan-heading" className="sr-only">
        Ringkasan analisis
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card padding="md">
          <p className="text-xs text-muted-foreground">Total Analisis</p>
          <p className="tnum mt-1 font-serif text-3xl text-ink">{total}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-muted-foreground">Selesai</p>
          <p className="tnum mt-1 font-serif text-3xl text-success">{selesai}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-muted-foreground">Diproses</p>
          <p className="tnum mt-1 font-serif text-3xl text-warning">{diproses}</p>
        </Card>
      </div>
    </section>
  )
}

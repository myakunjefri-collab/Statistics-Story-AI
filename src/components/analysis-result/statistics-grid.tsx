import { Card } from '@/components/ui/card'
import type { NilaiStatistik } from '@/lib/types'

export interface StatisticsGridProps {
  nilai: NilaiStatistik[]
}

export function StatisticsGrid({ nilai }: StatisticsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {nilai.map((n) => (
        <Card key={n.label} padding="md" className="space-y-1">
          <p className="text-xs text-muted-foreground">{n.label}</p>
          <p className="tnum font-serif text-3xl text-ink">{n.nilai}</p>
          {n.keterangan ? <p className="text-xs text-electric">{n.keterangan}</p> : null}
        </Card>
      ))}
    </div>
  )
}

import { Card } from '@/components/ui/card'
import type { NilaiStatistik } from '@/lib/types'

export interface ResultSummaryProps {
  nilai: NilaiStatistik[]
}

export function ResultSummary({ nilai }: ResultSummaryProps) {
  return (
    <section aria-labelledby="statistik-utama-heading">
      <h2 id="statistik-utama-heading" className="sr-only">
        Statistik utama
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {nilai.map((n) => (
          <div key={n.label} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card padding="md" className="h-full">
              <p className="tnum font-serif text-2xl text-ink">{n.nilai}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{n.label}</p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}

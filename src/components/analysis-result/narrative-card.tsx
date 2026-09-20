import { AlertTriangle, Quote, Sparkles } from 'lucide-react'
import { CopyNarrativeButton } from '@/components/analysis-result/copy-narrative-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { HasilAnalisis } from '@/lib/types'

export interface NarrativeCardProps {
  narasi: HasilAnalisis['narasi'] & { isFallback?: boolean; sumber?: string }
}

export function NarrativeCard({ narasi }: NarrativeCardProps) {
  const isFallback = Boolean(narasi.isFallback || narasi.sumber === 'fallback')

  return (
    <Card variant="navy" padding="lg" className="relative overflow-hidden">
      <Quote className="absolute -top-2 right-4 size-20 text-ivory/5" aria-hidden="true" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Bahasa {narasi.bahasa}</Badge>
          {isFallback ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Fallback Statistical Interpretation
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 text-xs font-medium text-cyan">
              <Sparkles className="size-3" aria-hidden="true" />
              AI-Generated
            </span>
          )}
        </div>
        <p className="font-serif text-xl leading-relaxed text-ivory text-pretty sm:text-2xl">
          {narasi.isiNarasi}
        </p>
        <CopyNarrativeButton text={narasi.isiNarasi} />
      </div>
    </Card>
  )
}

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { HasilAnalisis } from '@/lib/types'

export interface ExampleCaseCardProps {
  contohKasus: HasilAnalisis['contohKasus']
}

export function ExampleCaseCard({ contohKasus }: ExampleCaseCardProps) {
  return (
    <Card padding="lg" className="space-y-3">
      <Badge variant="neutral">Ilustrasi</Badge>
      <p className="leading-relaxed text-ink text-pretty">{contohKasus.deskripsiKasus}</p>
    </Card>
  )
}

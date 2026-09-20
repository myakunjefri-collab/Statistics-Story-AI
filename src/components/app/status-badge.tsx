import { Badge } from '@/components/ui/badge'
import type { StatusAnalisis } from '@/lib/types'

const map: Record<StatusAnalisis, 'success' | 'warning' | 'neutral'> = {
  Selesai: 'success',
  Diproses: 'warning',
  Draf: 'neutral',
}

export function StatusBadge({ status }: { status: StatusAnalisis }) {
  return <Badge variant={map[status]}>{status}</Badge>
}

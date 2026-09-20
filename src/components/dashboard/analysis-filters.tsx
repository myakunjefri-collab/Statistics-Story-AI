import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { FilterJenis } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface AnalysisFiltersProps {
  filters: readonly FilterJenis[]
  activeFilter: FilterJenis
  onFilterChange: (filter: FilterJenis) => void
  query: string
  onQueryChange: (query: string) => void
}

export function AnalysisFilters({
  filters,
  activeFilter,
  onFilterChange,
  query,
  onQueryChange,
}: AnalysisFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="group"
        aria-label="Saring berdasarkan jenis analisis"
        className="flex flex-wrap gap-1.5"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilterChange(f)}
            aria-pressed={activeFilter === f}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric',
              activeFilter === f
                ? 'border-ink bg-ink text-ivory'
                : 'border-border bg-surface text-muted-foreground hover:border-ink/40 hover:text-ink',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative w-full lg:w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari analisis..."
          className="pl-9"
          aria-label="Cari analisis"
        />
      </div>
    </div>
  )
}

import { ClipboardType, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export type InputMetode = 'unggah' | 'tempel'

export interface MethodSelectorProps {
  metode: InputMetode
  onMetodeChange: (metode: InputMetode) => void
}

const options = [
  { key: 'unggah' as const, label: 'Unggah Berkas', icon: Upload },
  { key: 'tempel' as const, label: 'Input Manual', icon: ClipboardType },
]

export function MethodSelector({ metode, onMetodeChange }: MethodSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Metode input data"
      className="grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-strong p-1"
    >
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onMetodeChange(key)}
          aria-pressed={metode === key}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric',
            metode === key ? 'bg-ink text-ivory' : 'text-muted-foreground hover:text-ink',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}

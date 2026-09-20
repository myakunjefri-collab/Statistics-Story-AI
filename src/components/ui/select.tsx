import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
}

// Owned native select — accessible and keyboard-navigable by default,
// styled to match the editorial design system.
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-ink transition-colors focus-visible:border-electric focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/30 aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    )
  },
)
Select.displayName = 'Select'

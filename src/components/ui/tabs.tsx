'use client'

import { motion } from 'motion/react'
import { type ReactNode, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  content: ReactNode
}

// Owned accessible tabs — WAI-ARIA roving tabindex with arrow-key navigation.
export function Tabs({ items, defaultValue }: { items: TabItem[]; defaultValue?: string }) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % items.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else return
    e.preventDefault()
    const targetItem = items[next]
    if (targetItem) {
      setActive(targetItem.value)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Bagian hasil analisis"
        className="flex flex-wrap gap-1 rounded-full border border-border bg-surface-strong p-1"
      >
        {items.map((item, i) => {
          const selected = item.value === active
          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric',
                selected ? 'text-ivory' : 'text-muted-foreground hover:text-ink',
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`${baseId}-active-pill`}
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={item.value !== active}
          tabIndex={0}
          className="mt-6 focus-visible:outline-none"
        >
          {item.value === active ? item.content : null}
        </div>
      ))}
    </div>
  )
}

import { ArrowDown, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost'

export function Cta({
  children,
  href = '#',
  variant = 'primary',
  icon = 'arrow',
  tone = 'dark',
  className,
}: {
  children: ReactNode
  href?: string
  variant?: Variant
  icon?: 'arrow' | 'down' | 'none'
  tone?: 'dark' | 'light'
  className?: string
}) {
  const base =
    'group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2'

  const styles: Record<Variant, Record<'dark' | 'light', string>> = {
    primary: {
      dark: 'bg-ink text-ivory hover:bg-electric focus-visible:ring-offset-ivory',
      light: 'bg-ivory text-ink hover:bg-electric hover:text-ivory focus-visible:ring-offset-navy',
    },
    ghost: {
      dark: 'text-ink hover:text-electric focus-visible:ring-offset-ivory',
      light: 'text-ivory/90 hover:text-ivory focus-visible:ring-offset-navy',
    },
  }

  return (
    <a href={href} className={cn(base, styles[variant][tone], className)}>
      <span>{children}</span>
      {icon === 'arrow' ? (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      ) : null}
      {icon === 'down' ? (
        <ArrowDown
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
          aria-hidden="true"
        />
      ) : null}
    </a>
  )
}

import { cva, type VariantProps } from 'class-variance-authority'
import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-2xl border transition-colors', {
  variants: {
    variant: {
      default: 'border-border bg-surface',
      strong: 'border-border bg-surface-strong',
      ink: 'border-transparent bg-ink text-ivory',
      navy: 'border-transparent bg-navy text-ivory',
    },
    interactive: {
      true: 'hover:border-ink/40',
      false: '',
    },
    padding: {
      none: 'p-0',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
    padding: 'md',
  },
})

export interface CardProps extends VariantProps<typeof cardVariants> {
  children?: ReactNode
  className?: string
  as?: ElementType
}

export function Card({ children, className, variant, interactive, padding, as }: CardProps) {
  const Comp = as ?? 'div'
  return (
    <Comp className={cn(cardVariants({ variant, interactive, padding, className }))}>
      {children}
    </Comp>
  )
}

export { cardVariants }

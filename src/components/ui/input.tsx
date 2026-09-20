import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldClasses =
  'w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink transition-colors placeholder:text-muted-foreground/70 focus-visible:border-electric focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/30 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20 disabled:cursor-not-allowed disabled:opacity-50'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClasses, className)} {...props} />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldClasses, 'min-h-28 resize-y leading-relaxed', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export function Label({
  children,
  htmlFor,
  className,
  optional,
}: {
  children: React.ReactNode
  htmlFor: string
  className?: string
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('flex items-center gap-2 text-sm font-medium text-ink', className)}
    >
      {children}
      {optional ? (
        <span className="text-xs font-normal text-muted-foreground">(opsional)</span>
      ) : null}
    </label>
  )
}

export { fieldClasses }

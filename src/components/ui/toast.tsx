'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider')
  return ctx
}

const toastVariants = cva(
  'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg',
  {
    variants: {
      tone: {
        success: 'border-success/25 bg-surface text-ink',
        error: 'border-danger/25 bg-surface text-ink',
      },
    },
    defaultVariants: { tone: 'success' },
  },
)

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: number) => void
} & VariantProps<typeof toastVariants>) {
  const Icon = item.tone === 'success' ? CheckCircle2 : AlertCircle
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(toastVariants({ tone: item.tone }))}
    >
      <Icon
        className={cn(
          'mt-0.5 size-5 shrink-0',
          item.tone === 'success' ? 'text-success' : 'text-danger',
        )}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        aria-label="Tutup notifikasi"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </motion.li>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, tone }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      >
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {toasts.map((item) => (
              <ToastCard key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </ToastContext.Provider>
  )
}

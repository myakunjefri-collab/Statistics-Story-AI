'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App runtime error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Terjadi Kesalahan Sistem
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sistem mengalami kendala saat memproses permintaan Anda. Data analisis yang sudah tersimpan
          tetap aman.
        </p>
        {process.env.NODE_ENV !== 'production' && error.message ? (
          <div className="rounded-lg bg-surface-strong p-3 text-left font-mono text-xs text-destructive overflow-auto max-h-32">
            {error.message}
          </div>
        ) : null}
        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={() => reset()} variant="default">
            <RotateCcw className="size-4 mr-2" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}

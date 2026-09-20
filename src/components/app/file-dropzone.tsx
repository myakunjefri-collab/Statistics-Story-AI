'use client'

import { FileSpreadsheet, UploadCloud, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPTED = ['.csv', '.xlsx', '.xls']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

function isAccepted(name: string) {
  return ACCEPTED.some((ext) => name.toLowerCase().endsWith(ext))
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Accessible drag-and-drop file field with client-side validation.
export function FileDropzone({
  file,
  onFile,
}: {
  file: File | null
  onFile: (file: File | null) => void
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateAndSet(candidate: File | undefined) {
    if (!candidate) return
    if (!isAccepted(candidate.name)) {
      setError('Format tidak didukung. Gunakan CSV atau Excel (.xlsx, .xls).')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError('Ukuran berkas melebihi 5 MB.')
      return
    }
    setError(null)
    onFile(candidate)
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-electric/12 text-electric">
          <FileSpreadsheet className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{file.name}</p>
          <p className="tnum text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onFile(null)} aria-label="Hapus berkas">
          <X aria-hidden="true" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          validateAndSet(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragging
            ? 'border-electric bg-electric/5'
            : 'border-border bg-surface hover:border-ink/40',
          error && 'border-danger/40',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-strong">
          <UploadCloud className="size-6 text-electric" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink">
            Tarik berkas ke sini, atau klik untuk memilih
          </p>
          <p className="text-xs text-muted-foreground">CSV atau Excel, maksimal 5 MB</p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(',')}
          className="sr-only"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </label>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

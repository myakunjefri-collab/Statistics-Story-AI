'use client'

import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Analisis, AnalisisBaru, JenisAnalisis, StatusAnalisis } from '@/lib/types'
import { quickAnalysisSchema } from '@/lib/validation'

const jenisOptions: { value: JenisAnalisis; label: string }[] = [
  { value: 'Deskriptif', label: 'Statistik Deskriptif' },
  { value: 'Uji t', label: 'Uji t' },
  { value: 'Korelasi', label: 'Korelasi' },
  { value: 'Regresi', label: 'Regresi' },
]

const statusOptions: { value: StatusAnalisis; label: string }[] = [
  { value: 'Draf', label: 'Draf' },
  { value: 'Diproses', label: 'Diproses' },
  { value: 'Selesai', label: 'Selesai' },
]

// Create/edit dialog with client-side validation.
export function AnalysisFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Analisis | null
  onSubmit: (values: AnalisisBaru) => void
}) {
  const namaId = useId()
  const jenisId = useId()
  const statusId = useId()

  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState<JenisAnalisis>('Deskriptif')
  const [status, setStatus] = useState<StatusAnalisis>('Draf')
  const [error, setError] = useState<string | null>(null)

  // Sync form to the record being edited whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setNama(initial?.nama ?? '')
      setJenis(initial?.jenisAnalisis ?? 'Deskriptif')
      setStatus(initial?.status ?? 'Draf')
      setError(null)
    }
  }, [open, initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = quickAnalysisSchema.safeParse({
      nama,
      jenisAnalisis: jenis,
      status,
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Input tidak valid.')
      return
    }

    setError(null)
    onSubmit(result.data)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Ubah Analisis' : 'Analisis Baru'}
      description={
        initial
          ? 'Perbarui detail analisis yang dipilih.'
          : 'Tambahkan catatan analisis baru ke dasbor Anda.'
      }
    >
      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor={namaId}>Nama Analisis</Label>
          <Input
            id={namaId}
            value={nama}
            onChange={(e) => {
              setNama(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Mis. Korelasi Waktu Belajar & Nilai"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${namaId}-error` : undefined}
            autoComplete="off"
          />
          {error ? (
            <p id={`${namaId}-error`} className="text-xs text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={jenisId}>Jenis Analisis</Label>
            <Select
              id={jenisId}
              options={jenisOptions}
              value={jenis}
              onChange={(e) => setJenis(e.target.value as JenisAnalisis)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={statusId}>Status</Label>
            <Select
              id={statusId}
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusAnalisis)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" size="sm">
            {initial ? 'Simpan Perubahan' : 'Tambah Analisis'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

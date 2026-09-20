import { Card } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { JenisAnalisis } from '@/lib/types'

const jenisOptions: { value: JenisAnalisis; label: string }[] = [
  { value: 'Deskriptif', label: 'Statistik Deskriptif' },
  { value: 'Uji t', label: 'Uji t' },
  { value: 'Korelasi', label: 'Korelasi' },
  { value: 'Regresi', label: 'Regresi' },
]

export interface AnalysisInfoFieldsProps {
  nama: string
  onNamaChange: (value: string) => void
  namaError?: string
  namaId: string
  jenis: JenisAnalisis
  onJenisChange: (value: JenisAnalisis) => void
  jenisId: string
  deskripsi: string
  onDeskripsiChange: (value: string) => void
  deskripsiId: string
}

export function AnalysisInfoFields({
  nama,
  onNamaChange,
  namaError,
  namaId,
  jenis,
  onJenisChange,
  jenisId,
  deskripsi,
  onDeskripsiChange,
  deskripsiId,
}: AnalysisInfoFieldsProps) {
  return (
    <Card padding="lg" className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor={namaId}>Nama Analisis</Label>
        <Input
          id={namaId}
          value={nama}
          onChange={(e) => onNamaChange(e.target.value)}
          placeholder="Mis. Korelasi Waktu Belajar & Nilai"
          aria-invalid={namaError ? true : undefined}
          aria-describedby={namaError ? `${namaId}-error` : undefined}
          autoComplete="off"
        />
        {namaError ? (
          <p id={`${namaId}-error`} className="text-xs text-danger" role="alert">
            {namaError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={jenisId}>Jenis Analisis</Label>
          <Select
            id={jenisId}
            options={jenisOptions}
            value={jenis}
            onChange={(e) => onJenisChange(e.target.value as JenisAnalisis)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={deskripsiId} optional>
          Deskripsi / Pertanyaan
        </Label>
        <Textarea
          id={deskripsiId}
          value={deskripsi}
          onChange={(e) => onDeskripsiChange(e.target.value)}
          placeholder="Jelaskan konteks data atau pertanyaan yang ingin dijawab..."
        />
      </div>
    </Card>
  )
}

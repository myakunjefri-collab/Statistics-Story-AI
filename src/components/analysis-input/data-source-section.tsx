import { type InputMetode, MethodSelector } from '@/components/analysis-input/method-selector'
import { FileDropzone } from '@/components/app/file-dropzone'
import { Card } from '@/components/ui/card'
import { Label, Textarea } from '@/components/ui/input'

export interface DataSourceSectionProps {
  metode: InputMetode
  onMetodeChange: (metode: InputMetode) => void
  file: File | null
  onFileChange: (file: File | null) => void
  pasted: string
  onPastedChange: (value: string) => void
  error?: string
  pasteId: string
}

export function DataSourceSection({
  metode,
  onMetodeChange,
  file,
  onFileChange,
  pasted,
  onPastedChange,
  error,
  pasteId,
}: DataSourceSectionProps) {
  return (
    <Card padding="lg" className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-ink">Sumber Data</h2>
        <p className="text-xs text-muted-foreground">
          Pilih cara memasukkan data yang akan dianalisis.
        </p>
      </div>

      <MethodSelector metode={metode} onMetodeChange={onMetodeChange} />

      {metode === 'unggah' ? (
        <FileDropzone file={file} onFile={onFileChange} />
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={pasteId}>Data (format CSV atau dipisah koma)</Label>
          <Textarea
            id={pasteId}
            value={pasted}
            onChange={(e) => onPastedChange(e.target.value)}
            placeholder={'jam_belajar,nilai\n2,58\n4,63\n6,70'}
            className="min-h-40 font-mono text-xs"
          />
        </div>
      )}

      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  )
}

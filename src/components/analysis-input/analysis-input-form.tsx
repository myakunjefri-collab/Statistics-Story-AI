'use client'

import { Loader2, Wand2 } from 'lucide-react'
import { useId, useState } from 'react'
import { AnalysisInfoFields } from '@/components/analysis-input/analysis-info-fields'
import { DataSourceSection } from '@/components/analysis-input/data-source-section'
import type { InputMetode } from '@/components/analysis-input/method-selector'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useRouter } from '@/lib/navigation'
import type { JenisAnalisis } from '@/lib/types'
import { validateAnalysisInput } from '@/lib/validation'

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64 || '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const mapJenisToApi = (jenis: JenisAnalisis): 'deskriptif' | 'uji_t' | 'korelasi' | 'regresi' => {
  switch (jenis) {
    case 'Deskriptif':
      return 'deskriptif'
    case 'Uji t':
      return 'uji_t'
    case 'Korelasi':
      return 'korelasi'
    case 'Regresi':
      return 'regresi'
    default:
      return 'deskriptif'
  }
}

export function AnalysisInputForm() {
  const router = useRouter()
  const { toast } = useToast()

  const namaId = useId()
  const jenisId = useId()
  const deskripsiId = useId()
  const pasteId = useId()

  const [metode, setMetode] = useState<InputMetode>('unggah')
  const [nama, setNama] = useState('')
  const [jenis, setJenis] = useState<JenisAnalisis>('Korelasi')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pasted, setPasted] = useState('')
  const [errors, setErrors] = useState<{ nama?: string; data?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const result = validateAnalysisInput({
      nama,
      jenisAnalisis: jenis,
      deskripsi,
      metode,
      dataText: pasted,
      fileName: file?.name,
      fileSize: file?.size,
    })

    if (!result.success && result.errors) {
      setErrors(result.errors)
      return false
    }

    setErrors({})
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      let sourceType: 'manual' | 'csv' | 'excel' = 'manual'
      let rawText: string | undefined
      let fileBase64: string | undefined
      let fileName: string | undefined

      if (metode === 'tempel') {
        sourceType = 'manual'
        rawText = pasted.trim()
      } else if (file) {
        fileName = file.name
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'csv') {
          sourceType = 'csv'
          rawText = await fileToText(file)
        } else if (ext === 'xlsx' || ext === 'xls') {
          sourceType = 'excel'
          fileBase64 = await fileToBase64(file)
        } else {
          throw new Error(
            'Format berkas tidak didukung. Harap gunakan CSV atau Excel (.xlsx/.xls).',
          )
        }
      } else {
        throw new Error('Data analisis belum dipilih atau diisi.')
      }

      const payload = {
        namaAnalisis: nama.trim(),
        jenisAnalisis: mapJenisToApi(jenis),
        deskripsi: deskripsi.trim() || undefined,
        sourceType,
        rawText,
        fileBase64,
        fileName,
        bahasa: 'id',
      }

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memproses perhitungan statistik.')
      }

      toast('Analisis dan narasi AI berhasil dibuat!')
      router.push(`/hasil/${data.analysisId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setErrors((prev) => ({ ...prev, data: message }))
      toast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <AnalysisInfoFields
        nama={nama}
        onNamaChange={(v) => {
          setNama(v)
          if (errors.nama) setErrors((p) => ({ ...p, nama: undefined }))
        }}
        namaError={errors.nama}
        namaId={namaId}
        jenis={jenis}
        onJenisChange={setJenis}
        jenisId={jenisId}
        deskripsi={deskripsi}
        onDeskripsiChange={setDeskripsi}
        deskripsiId={deskripsiId}
      />

      <DataSourceSection
        metode={metode}
        onMetodeChange={(m) => {
          setMetode(m)
          setErrors((p) => ({ ...p, data: undefined }))
        }}
        file={file}
        onFileChange={(f) => {
          setFile(f)
          if (errors.data) setErrors((p) => ({ ...p, data: undefined }))
        }}
        pasted={pasted}
        onPastedChange={(p) => {
          setPasted(p)
          if (errors.data) setErrors((p) => ({ ...p, data: undefined }))
        }}
        error={errors.data}
        pasteId={pasteId}
      />

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" type="button" onClick={() => router.push('/dashboard')}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" aria-hidden="true" />
              Menganalisis & Mengolah AI...
            </>
          ) : (
            <>
              <Wand2 className="mr-2" aria-hidden="true" />
              Mulai Analisis
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

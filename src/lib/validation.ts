import { z } from 'zod'

export const jenisAnalisisSchema = z.enum(['Deskriptif', 'Uji t', 'Korelasi', 'Regresi'])
export type JenisAnalisis = z.infer<typeof jenisAnalisisSchema>
export const statusAnalisisSchema = z.enum(['Selesai', 'Diproses', 'Draf'])
export const inputMetodeSchema = z.enum(['unggah', 'tempel'])

export const analysisInputSchema = z
  .object({
    nama: z
      .string({ required_error: 'Nama analisis wajib diisi.' })
      .trim()
      .min(3, { message: 'Nama analisis minimal 3 karakter.' }),
    jenisAnalisis: jenisAnalisisSchema,
    deskripsi: z.string().optional(),
    metode: inputMetodeSchema,
    dataText: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.metode === 'unggah') {
      if (!val.fileName || val.fileName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Berkas data wajib disertakan untuk metode unggah.',
          path: ['data'],
        })
      } else {
        const ext = val.fileName.toLowerCase().split('.').pop()
        if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Format berkas hanya mendukung .csv, .xlsx, atau .xls.',
            path: ['data'],
          })
        }
        if (typeof val.fileSize === 'number' && val.fileSize > 5 * 1024 * 1024) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Ukuran berkas melebihi batas maksimum 5 MB.',
            path: ['data'],
          })
        }
      }
    } else if (val.metode === 'tempel') {
      if (!val.dataText || val.dataText.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data manual harus memiliki beberapa baris nilai (minimal 10 karakter).',
          path: ['data'],
        })
      }
    }
  })

export type AnalysisInputPayload = z.infer<typeof analysisInputSchema>

export const quickAnalysisSchema = z.object({
  nama: z
    .string({ required_error: 'Nama analisis wajib diisi.' })
    .trim()
    .min(3, { message: 'Nama analisis minimal 3 karakter.' }),
  jenisAnalisis: jenisAnalisisSchema,
  status: statusAnalisisSchema,
})

export type QuickAnalysisInput = z.infer<typeof quickAnalysisSchema>

export const analisisItemSchema = z.object({
  id: z.string(),
  nama: z.string(),
  jenisAnalisis: jenisAnalisisSchema,
  tanggal: z.string(),
  status: statusAnalisisSchema,
})

export const analysesResponseSchema = z.object({
  data: z.array(analisisItemSchema),
  message: z.string(),
})

export type AnalysesResponse = z.infer<typeof analysesResponseSchema>

export const singleAnalysisResponseSchema = z.object({
  data: analisisItemSchema,
  message: z.string(),
})

export type SingleAnalysisResponse = z.infer<typeof singleAnalysisResponseSchema>

export const deleteAnalysisResponseSchema = z.object({
  data: z.object({ id: z.string() }),
  message: z.string(),
})

export type DeleteAnalysisResponse = z.infer<typeof deleteAnalysisResponseSchema>

export const nilaiStatistikSchema = z.object({
  label: z.string(),
  nilai: z.string(),
  keterangan: z.string().optional(),
})

export type NilaiStatistik = z.infer<typeof nilaiStatistikSchema>

// Canonical Visualization Schemas conforming to Section E
export const histogramBinSchema = z.object({
  binLabel: z.string(),
  count: z.number(),
  min: z.number(),
  max: z.number(),
})

export const histogramDataSchema = z.object({
  kind: z.literal('histogram'),
  values: z.array(z.number()),
  bins: z.array(histogramBinSchema).optional(),
})

export const barGroupSchema = z.object({
  groupName: z.string(),
  mean: z.number(),
  sd: z.number().optional(),
  n: z.number().optional(),
})

export const barDataSchema = z.object({
  kind: z.literal('bar'),
  groups: z.array(barGroupSchema),
})

export const scatterPointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const scatterTrendlineSchema = z.object({
  slope: z.number(),
  intercept: z.number(),
  rSquared: z.number().optional(),
})

export const scatterDataSchema = z.object({
  kind: z.literal('scatter'),
  points: z.array(scatterPointSchema),
  trendline: scatterTrendlineSchema.optional(),
})

export const visualizationDataSchema = z.discriminatedUnion('kind', [
  histogramDataSchema,
  barDataSchema,
  scatterDataSchema,
])

export type HistogramBin = z.infer<typeof histogramBinSchema>
export type HistogramData = z.infer<typeof histogramDataSchema>
export type BarGroup = z.infer<typeof barGroupSchema>
export type BarData = z.infer<typeof barDataSchema>
export type ScatterPoint = z.infer<typeof scatterPointSchema>
export type ScatterTrendline = z.infer<typeof scatterTrendlineSchema>
export type ScatterData = z.infer<typeof scatterDataSchema>
export type VisualizationData = z.infer<typeof visualizationDataSchema>

export const canonicalVisualizationSchema = z.object({
  jenisGrafik: z.enum(['histogram', 'bar', 'scatter']),
  dataGrafik: visualizationDataSchema,
  labelX: z.string(),
  labelY: z.string(),
})

export type CanonicalVisualization = z.infer<typeof canonicalVisualizationSchema>

export const narasiSchema = z.object({
  bahasa: z.string(),
  isiNarasi: z.string(),
  sumberNarasi: z.enum(['ai', 'fallback']).optional(),
  isFallback: z.boolean().optional(),
})

export type Narasi = z.infer<typeof narasiSchema>

export const contohKasusSchema = z.object({
  bahasa: z.string(),
  deskripsiKasus: z.string(),
})

export type ContohKasus = z.infer<typeof contohKasusSchema>

export const hasilAnalisisSchema = z.object({
  id: z.string().optional(),
  idAnalisis: z.number().optional(),
  jenisUji: jenisAnalisisSchema,
  judul: z.string(),
  ringkasan: z.string(),
  nilai: z.array(nilaiStatistikSchema),
  narasi: narasiSchema,
  visualisasi: canonicalVisualizationSchema,
  contohKasus: contohKasusSchema,
})

export type HasilAnalisis = z.infer<typeof hasilAnalisisSchema>

export const hasilResponseSchema = z.object({
  data: hasilAnalisisSchema,
  message: z.string(),
})

export type HasilResponse = z.infer<typeof hasilResponseSchema>

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

export const calculateSelectedColumnsSchema = z.object({
  column1: z.string().optional(),
  column2: z.string().optional(),
  groupColumn: z.string().optional(),
  valueColumn: z.string().optional(),
  columnX: z.string().optional(),
  columnY: z.string().optional(),
})

export type CalculateSelectedColumns = z.infer<typeof calculateSelectedColumnsSchema>

export const rawJenisAnalisisSchema = z.enum([
  'Deskriptif',
  'Uji t',
  'Korelasi',
  'Regresi',
  'deskriptif',
  'uji_t',
  'korelasi',
  'regresi',
])

export const calculateRequestSchema = z
  .object({
    namaAnalisis: z.string().min(1, 'Nama analisis wajib diisi.').optional(),
    nama: z.string().min(1, 'Nama analisis wajib diisi.').optional(),
    jenisAnalisis: rawJenisAnalisisSchema,
    deskripsi: z.string().optional(),
    formatData: z.enum(['manual', 'csv', 'xlsx', 'excel']).optional(),
    sourceType: z.enum(['manual', 'csv', 'xlsx', 'excel']).optional(),
    rawContent: z.string().optional(),
    rawText: z.string().optional(),
    fileBase64: z.string().optional(),
    fileName: z.string().optional(),
    selectedColumns: calculateSelectedColumnsSchema.optional(),
    language: z.enum(['id', 'en']).optional(),
    bahasa: z.enum(['id', 'en']).optional(),
    dataset: z.unknown().optional(),
  })
  .superRefine((data, ctx) => {
    const resolvedName = data.namaAnalisis || data.nama
    if (!resolvedName || resolvedName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama analisis wajib diisi.',
        path: ['namaAnalisis'],
      })
    }
  })
  .transform((data) => {
    const resolvedName = (data.namaAnalisis || data.nama)?.trim() || ''
    const jenisMap: Record<string, JenisAnalisis> = {
      deskriptif: 'Deskriptif',
      Deskriptif: 'Deskriptif',
      uji_t: 'Uji t',
      'Uji t': 'Uji t',
      korelasi: 'Korelasi',
      Korelasi: 'Korelasi',
      regresi: 'Regresi',
      Regresi: 'Regresi',
    }
    const resolvedJenis = jenisMap[data.jenisAnalisis] ?? 'Deskriptif'
    const rawFormat = data.formatData || data.sourceType || 'manual'
    const resolvedFormat: 'manual' | 'csv' | 'xlsx' = rawFormat === 'excel' ? 'xlsx' : rawFormat
    const resolvedRawContent = data.rawContent || data.rawText || ''
    const resolvedLanguage: 'id' | 'en' = data.language || data.bahasa || 'id'

    return {
      namaAnalisis: resolvedName,
      jenisAnalisis: resolvedJenis,
      deskripsi: data.deskripsi,
      formatData: resolvedFormat,
      rawContent: resolvedRawContent,
      fileBase64: data.fileBase64,
      fileName: data.fileName,
      selectedColumns: data.selectedColumns,
      language: resolvedLanguage,
      dataset: data.dataset,
    }
  })

export type CalculateRequest = z.infer<typeof calculateRequestSchema>

/**
 * Server and form boundary validation using Zod schemas.
 * Guarantees data integrity and type safety across application boundaries.
 */
export function validateAnalysisInput(payload: unknown): ValidationResult<AnalysisInputPayload> {
  const result = analysisInputSchema.safeParse(payload)

  if (!result.success) {
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.length > 0 ? String(issue.path[0]) : 'form'
      if (!errors[key]) {
        errors[key] = issue.message
      }
    }
    return { success: false, errors }
  }

  return {
    success: true,
    data: result.data,
  }
}

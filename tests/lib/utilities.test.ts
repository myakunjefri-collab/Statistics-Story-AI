import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'
import { formatNumber, formatDate, formatTanggal, todayIso } from '@/lib/format'
import { useUIStore } from '@/lib/stores/ui-store'
import { getAIProvider } from '@/lib/ai/provider-factory'
import {
  analysisInputSchema,
  quickAnalysisSchema,
  analisisItemSchema,
  hasilAnalisisSchema,
  validateAnalysisInput,
} from '@/lib/validation'
import { parseManualInput } from '@/lib/data-processing/manual-parser'

describe('Utility & Schema Validation Unit Tests', () => {
  it('validateAnalysisInput validates client inputs and returns structured errors', () => {
    const res = validateAnalysisInput({
      nama: 'Valid Analysis',
      jenisAnalisis: 'Deskriptif',
      metode: 'unggah',
      fileName: 'data.csv',
      fileSize: 1024,
    })
    expect(res.success).toBe(true)

    const invalid = validateAnalysisInput({
      nama: 'No',
      jenisAnalisis: 'Deskriptif',
      metode: 'unggah',
    })
    expect(invalid.success).toBe(false)
    expect(invalid.errors).toBeDefined()
  })
  it('cn merges class names and handles tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-ink', undefined, null, false && 'hidden')).toBe('text-ink')
  })

  it('formatNumber formats numbers with locale fallback', () => {
    expect(formatNumber(1234.56, 2)).toContain('1')
    expect(formatNumber(undefined)).toBe('-')
    expect(formatNumber(NaN)).toBe('-')
  })

  it('formatDate formats valid and invalid dates safely', () => {
    expect(formatDate(new Date('2026-09-20'))).toBeDefined()
    expect(formatDate('invalid-date')).toBe('Tanggal tidak valid')
    expect(formatTanggal('2026-09-20')).toContain('September')
    expect(formatTanggal('invalid')).toBe('invalid')
    expect(todayIso()).toBeDefined()
  })

  it('Zustand ui-store handles state transitions for modals and filters', () => {
    const {
      setSidebarOpen,
      openSidebar,
      closeSidebar,
      setSelectedAnalysisFilter,
      setAnalysisSearchQuery,
    } = useUIStore.getState()

    openSidebar()
    expect(useUIStore.getState().isSidebarOpen).toBe(true)

    closeSidebar()
    expect(useUIStore.getState().isSidebarOpen).toBe(false)

    setSidebarOpen(true)
    expect(useUIStore.getState().isSidebarOpen).toBe(true)

    setSelectedAnalysisFilter('Uji t')
    expect(useUIStore.getState().selectedAnalysisFilter).toBe('Uji t')

    setAnalysisSearchQuery('skor ujian')
    expect(useUIStore.getState().analysisSearchQuery).toBe('skor ujian')
  })

  it('AI provider factory returns FallbackProvider when AI_PROVIDER is fallback', () => {
    const provider = getAIProvider('fallback')
    expect(provider.name).toContain('Fallback')
  })

  it('AI provider factory returns ExternalLLMProvider when configured', () => {
    const geminiProvider = getAIProvider('gemini')
    expect(geminiProvider.name).toContain('Gemini')

    const openaiProvider = getAIProvider('openai')
    expect(openaiProvider.name).toContain('OpenAI')
  })

  it('analysisInputSchema validates upload and paste methods correctly', () => {
    // Valid upload
    const validUpload = analysisInputSchema.safeParse({
      nama: 'Analisis Kemampuan Kognitif',
      jenisAnalisis: 'Deskriptif',
      metode: 'unggah',
      fileName: 'data.csv',
      fileSize: 1024,
    })
    expect(validUpload.success).toBe(true)

    // Invalid upload (unsupported extension)
    const invalidExt = analysisInputSchema.safeParse({
      nama: 'Analisis',
      jenisAnalisis: 'Deskriptif',
      metode: 'unggah',
      fileName: 'document.pdf',
    })
    expect(invalidExt.success).toBe(false)

    // Invalid paste (too short)
    const shortPaste = analysisInputSchema.safeParse({
      nama: 'Analisis',
      jenisAnalisis: 'Deskriptif',
      metode: 'tempel',
      dataText: '1,2',
    })
    expect(shortPaste.success).toBe(false)
  })

  it('quickAnalysisSchema and analisisItemSchema validate properly', () => {
    const quick = quickAnalysisSchema.safeParse({
      nama: 'Uji Baru',
      jenisAnalisis: 'Korelasi',
      status: 'Selesai',
    })
    expect(quick.success).toBe(true)

    const item = analisisItemSchema.safeParse({
      id: '1',
      nama: 'Uji Regresi',
      jenisAnalisis: 'Regresi',
      tanggal: '2026-09-20',
      status: 'Selesai',
    })
    expect(item.success).toBe(true)
  })

  it('parseManualInput parses single column space/comma separated numbers', () => {
    const spaceData = '10 20 30 40 50'
    const res = parseManualInput(spaceData)
    expect(res.rowCount).toBe(5)
    expect(res.columns[0]?.isNumeric).toBe(true)

    const commaData = '15, 25, 35, 45'
    const resComma = parseManualInput(commaData)
    expect(resComma.rowCount).toBe(4)
  })
})

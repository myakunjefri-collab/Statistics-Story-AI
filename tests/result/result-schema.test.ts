import { describe, it, expect } from 'vitest'
import {
  canonicalVisualizationSchema,
  contohKasusSchema,
  hasilAnalisisSchema,
  hasilResponseSchema,
  narasiSchema,
  nilaiStatistikSchema,
  visualizationDataSchema,
} from '@/lib/validation'

describe('Canonical Result Schemas (Zod Single Source of Truth)', () => {
  it('Validates canonical histogram visualization data', () => {
    const validHistogram = {
      kind: 'histogram' as const,
      values: [12, 14, 15, 18, 22],
      bins: [
        { binLabel: '12 - 15', count: 3, min: 12, max: 15 },
        { binLabel: '15 - 22', count: 2, min: 15, max: 22 },
      ],
    }

    const parsed = visualizationDataSchema.parse(validHistogram)
    expect(parsed.kind).toBe('histogram')
    if (parsed.kind === 'histogram') {
      expect(parsed.values).toHaveLength(5)
      expect(parsed.bins).toHaveLength(2)
    }
  })

  it('Validates canonical bar comparison visualization data', () => {
    const validBar = {
      kind: 'bar' as const,
      groups: [
        { groupName: 'Kelompok 1', mean: 70.5, sd: 4.2, n: 15 },
        { groupName: 'Kelompok 2', mean: 82.1, sd: 5.0, n: 15 },
      ],
    }

    const parsed = visualizationDataSchema.parse(validBar)
    expect(parsed.kind).toBe('bar')
    if (parsed.kind === 'bar') {
      expect(parsed.groups).toHaveLength(2)
      expect(parsed.groups[0]?.mean).toBe(70.5)
    }
  })

  it('Validates canonical scatter visualization data with and without trendline', () => {
    const scatterNoTrend = {
      kind: 'scatter' as const,
      points: [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
      ],
    }
    const parsedNoTrend = visualizationDataSchema.parse(scatterNoTrend)
    expect(parsedNoTrend.kind).toBe('scatter')
    if (parsedNoTrend.kind === 'scatter') {
      expect(parsedNoTrend.trendline).toBeUndefined()
    }

    const scatterWithTrend = {
      kind: 'scatter' as const,
      points: [
        { x: 1, y: 2.1 },
        { x: 2, y: 3.9 },
      ],
      trendline: {
        slope: 1.8,
        intercept: 0.3,
        rSquared: 0.98,
      },
    }
    const parsedTrend = visualizationDataSchema.parse(scatterWithTrend)
    expect(parsedTrend.kind).toBe('scatter')
    if (parsedTrend.kind === 'scatter') {
      expect(parsedTrend.trendline?.slope).toBe(1.8)
    }
  })

  it('Rejects invalid kind or corrupted visualization payloads', () => {
    const invalidKind = {
      kind: 'pie',
      slices: [],
    }
    expect(() => visualizationDataSchema.parse(invalidKind)).toThrow()

    const missingPoints = {
      kind: 'scatter',
    }
    expect(() => visualizationDataSchema.parse(missingPoints)).toThrow()
  })

  it('Validates full HasilAnalisis and HasilResponse contracts without any-escapes', () => {
    const fullResult = {
      id: '12',
      idAnalisis: 12,
      jenisUji: 'Korelasi' as const,
      judul: 'Analisis Korelasi Belajar & Nilai',
      ringkasan: 'Hasil analisis korelasi menunjukkan hubungan positif kuat.',
      nilai: [
        { label: 'Koefisien Korelasi (r)', nilai: '0,85', keterangan: 'Hubungan kuat' },
        { label: 'p-value', nilai: '0,0012', keterangan: 'Signifikan' },
      ],
      narasi: {
        bahasa: 'id',
        isiNarasi: 'Terdapat korelasi positif yang signifikan antara waktu belajar dan nilai ujian.',
        sumberNarasi: 'ai' as const,
        isFallback: false,
      },
      visualisasi: {
        jenisGrafik: 'scatter' as const,
        dataGrafik: {
          kind: 'scatter' as const,
          points: [
            { x: 2, y: 60 },
            { x: 4, y: 75 },
          ],
        },
        labelX: 'Waktu Belajar (jam)',
        labelY: 'Nilai Ujian',
      },
      contohKasus: {
        bahasa: 'id',
        deskripsiKasus: 'Mahasiswa yang menambah jam belajar rata-rata mengalami kenaikan skor.',
      },
    }

    const parsedHasil = hasilAnalisisSchema.parse(fullResult)
    expect(parsedHasil.jenisUji).toBe('Korelasi')

    const responsePayload = {
      data: parsedHasil,
      message: 'Berhasil memuat hasil.',
    }
    const parsedResponse = hasilResponseSchema.parse(responsePayload)
    expect(parsedResponse.message).toBe('Berhasil memuat hasil.')
    expect(parsedResponse.data.visualisasi.dataGrafik.kind).toBe('scatter')
  })
})

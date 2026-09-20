import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryFallbackDatabaseAdapter } from '@/lib/storage/memory-fallback-adapter'
import { parseManualInput } from '@/lib/data-processing/manual-parser'
import { validateDatasetForAnalysis } from '@/lib/data-processing/data-validator'
import { calculateCorrelation } from '@/lib/statistics/correlation'
import { FallbackProvider } from '@/lib/ai/fallback-provider'

describe('End-to-End Analysis & Data Isolation Flow', () => {
  let db: MemoryFallbackDatabaseAdapter

  beforeEach(() => {
    db = new MemoryFallbackDatabaseAdapter()
  })

  it('Orchestrates calculation, AI narrative, and atomic database persistence', async () => {
    const userId = 101
    const rawData = `x,y\n1,2.2\n2,2.8\n3,3.6\n4,4.5\n5,5.1`

    // 1. Ingest & Validate
    const dataset = parseManualInput(rawData)
    const val = validateDatasetForAnalysis(dataset, 'korelasi', { columnX: 'x', columnY: 'y' })
    expect(val.isValid).toBe(true)

    // 2. Pure Statistical Computation
    const xs = dataset.columns.find((c) => c.name === 'x')?.values.filter((v): v is number => v !== null) || []
    const ys = dataset.columns.find((c) => c.name === 'y')?.values.filter((v): v is number => v !== null) || []
    const statResult = calculateCorrelation(xs, ys)
    expect(statResult.r).toBeGreaterThan(0.9)

    // 3. AI Interpretation outside DB transaction
    const aiProvider = new FallbackProvider()
    const aiOutput = await aiProvider.generateInterpretation({
      analysisType: 'Korelasi',
      statisticalResult: statResult,
      language: 'id',
    })
    expect(aiOutput.narrative).toBeDefined()

    // 4. Atomic Database Transaction
    const stored = await db.saveCompleteAnalysisAtomic(
      {
        analisis: {
          id_pengguna: userId,
          nama_analisis: 'Analisis Korelasi Integrasi',
          jenis_analisis: 'Korelasi',
          tanggal: new Date().toISOString(),
          status: 'Selesai',
        },
        dataset: {
          nama_file: 'manual_input.csv',
          format_data: 'manual',
          data_konten: dataset,
          sumber_input: 'web_form',
        },
        hasil: {
          jenis_uji: 'Korelasi',
          nilai_statistik: statResult,
          p_value: statResult.pValue,
        },
        narasi: {
          isi_narasi: aiOutput.narrative,
          bahasa: aiOutput.language,
          sumber_narasi: 'ai',
        },
        visualisasi: {
          jenis_grafik: 'scatter',
          data_grafik: { points: xs.map((xVal, i) => ({ x: xVal, y: ys[i] })) },
        },
        contohKasus: {
          deskripsi_kasus: aiOutput.exampleCase,
          bahasa: aiOutput.language,
        },
      },
      userId,
    )

    expect(stored.analisis.id_analisis).toBeDefined()

    // 5. Verification of saved record
    const retrieved = await db.getCompleteAnalysisById(stored.analisis.id_analisis, userId)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.analisis.nama_analisis).toBe('Analisis Korelasi Integrasi')
    expect(retrieved?.narasi?.isi_narasi).toBe(aiOutput.narrative)
  })

  it('Strict User-Scoped Isolation: User B cannot access User A analysis', async () => {
    const userA = 1
    const userB = 2

    const recordA = await db.saveCompleteAnalysisAtomic(
      {
        analisis: {
          id_pengguna: userA,
          nama_analisis: 'Rahasia User A',
          jenis_analisis: 'Deskriptif',
          tanggal: new Date().toISOString(),
          status: 'Selesai',
        },
        dataset: {
          nama_file: 'manual.csv',
          sumber_input: 'web_form',
          format_data: 'manual',
          data_konten: { rows: [1, 2, 3] },
        },
        hasil: {
          jenis_uji: 'Deskriptif',
          nilai_statistik: { mean: 2 },
          p_value: null,
        },
        narasi: { isi_narasi: 'Narasi User A', bahasa: 'id', sumber_narasi: 'ai' },
        visualisasi: { jenis_grafik: 'histogram', data_grafik: {} },
        contohKasus: { deskripsi_kasus: 'Kasus User A', bahasa: 'id' },
      },
      userA,
    )

    // User A can access own record
    const fetchA = await db.getCompleteAnalysisById(recordA.analisis.id_analisis, userA)
    expect(fetchA).not.toBeNull()

    // User B cannot access User A's record -> returns null
    const fetchB = await db.getCompleteAnalysisById(recordA.analisis.id_analisis, userB)
    expect(fetchB).toBeNull()

    // User B listing only returns User B records
    const userBAnalyses = await db.getAnalysesByUser(userB)
    expect(userBAnalyses.some((a) => a.id_analisis === recordA.analisis.id_analisis)).toBe(false)
  })
})

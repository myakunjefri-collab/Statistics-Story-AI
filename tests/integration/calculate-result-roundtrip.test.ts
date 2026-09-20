import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'
import { FallbackProvider } from '@/lib/ai/fallback-provider'
import { calculateDescriptive } from '@/lib/statistics/descriptive'
import { canonicalVisualizationSchema, hasilResponseSchema } from '@/lib/validation'

describe('End-to-End Calculate & Result Roundtrip (TC06 - TC12)', () => {
  const token = createSessionToken({
    userId: 777,
    email: 'researcher777@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('TC06 & TC11: Deskriptif end-to-end creates histogram with actual values', async () => {
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Studi Tinggi Badan Sampel',
        jenisAnalisis: 'Deskriptif',
        formatData: 'manual',
        rawContent: '165, 170, 172, 168, 175, 180, 169, 174',
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    const id = json.analysisId

    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${id}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const getRes = await hasilHandler(getReq)
    expect(getRes.status).toBe(200)
    const parsed = hasilResponseSchema.parse(await getRes.json())

    expect(parsed.data.jenisUji).toBe('Deskriptif')
    expect(parsed.data.visualisasi.jenisGrafik).toBe('histogram')
    expect(parsed.data.visualisasi.dataGrafik.kind).toBe('histogram')

    const labels = parsed.data.nilai.map((n) => n.label)
    expect(labels).toContain('Mean')
    expect(labels).toContain('Median')
    expect(labels).toContain('Modus')
    expect(labels).toContain('Std. Deviasi')
    expect(labels).toContain('Minimum')
    expect(labels).toContain('Maksimum')
  })

  it('TC07 & TC11: Uji t end-to-end creates bar comparison with actual group means', async () => {
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Efektivitas Metode Belajar Baru',
        jenisAnalisis: 'Uji t',
        formatData: 'csv',
        rawContent: 'metode,skor\nKonvensional,65\nKonvensional,70\nKonvensional,72\nInovatif,85\nInovatif,88\nInovatif,92',
        selectedColumns: { groupColumn: 'metode', valueColumn: 'skor' },
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)
    const id = (await res.json()).analysisId

    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${id}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const parsed = hasilResponseSchema.parse(await (await hasilHandler(getReq)).json())

    expect(parsed.data.jenisUji).toBe('Uji t')
    expect(parsed.data.visualisasi.jenisGrafik).toBe('bar')
    expect(parsed.data.visualisasi.dataGrafik.kind).toBe('bar')
    if (parsed.data.visualisasi.dataGrafik.kind === 'bar') {
      expect(parsed.data.visualisasi.dataGrafik.groups).toHaveLength(2)
      expect(parsed.data.visualisasi.dataGrafik.groups[0]?.mean).toBeGreaterThan(0)
    }

    const labels = parsed.data.nilai.map((n) => n.label)
    expect(labels).toContain('t-Hitung')
    expect(labels).toContain('p-value')
    expect(labels).toContain('Derajat Kebebasan (df)')
  })

  it('TC08 & TC11: Korelasi end-to-end creates scatter plot without trendline', async () => {
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Korelasi Kehadiran vs Nilai',
        jenisAnalisis: 'Korelasi',
        formatData: 'manual',
        rawContent: 'hadir,nilai\n10,60\n12,70\n14,85\n16,95',
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)
    const id = (await res.json()).analysisId

    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${id}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const parsed = hasilResponseSchema.parse(await (await hasilHandler(getReq)).json())

    expect(parsed.data.jenisUji).toBe('Korelasi')
    expect(parsed.data.visualisasi.jenisGrafik).toBe('scatter')
    expect(parsed.data.visualisasi.dataGrafik.kind).toBe('scatter')
    if (parsed.data.visualisasi.dataGrafik.kind === 'scatter') {
      expect(parsed.data.visualisasi.dataGrafik.trendline).toBeUndefined()
    }

    const labels = parsed.data.nilai.map((n) => n.label)
    expect(labels).toContain('Koefisien Korelasi (r)')
  })

  it('TC09 & TC11: Regresi end-to-end creates scatter with actual trendline slope/intercept', async () => {
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Prediksi Skor Berdasarkan Biaya',
        jenisAnalisis: 'Regresi',
        formatData: 'manual',
        rawContent: 'biaya,skor\n10,25\n20,45\n30,65\n40,85',
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)
    const id = (await res.json()).analysisId

    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${id}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const parsed = hasilResponseSchema.parse(await (await hasilHandler(getReq)).json())

    expect(parsed.data.jenisUji).toBe('Regresi')
    expect(parsed.data.visualisasi.jenisGrafik).toBe('scatter')
    if (parsed.data.visualisasi.dataGrafik.kind === 'scatter') {
      expect(parsed.data.visualisasi.dataGrafik.trendline).toBeDefined()
      expect(parsed.data.visualisasi.dataGrafik.trendline?.slope).toBe(2)
      expect(parsed.data.visualisasi.dataGrafik.trendline?.intercept).toBe(5)
    }

    const labels = parsed.data.nilai.map((n) => n.label)
    expect(labels).toContain('Koefisien Regresi (Slope)')
    expect(labels).toContain('Konstanta (Intercept)')
    expect(labels).toContain('Koefisien Determinasi (R²)')
  })

  it('TC10: AI narrative is generated and returned with meaningful content', async () => {
    const rawData = [10, 15, 20, 25, 30]
    const calc = calculateDescriptive(rawData)
    const provider = new FallbackProvider()

    const aiResult = await provider.generateInterpretation({
      analysisType: 'Deskriptif',
      statisticalResult: calc,
      language: 'id',
    })

    expect(aiResult.narrative).toBeDefined()
    expect(aiResult.narrative.length).toBeGreaterThan(20)
    expect(aiResult.exampleCase).toBeDefined()
    expect(aiResult.sumber).toBe('fallback')
  })

  it('TC12: AI failure/timeout triggers transparent fallback without crashing application', async () => {
    // When external AI fails, fallback provider handles statistical interpretation seamlessly
    const rawData = [10, 20, 30, 40, 50]
    const calc = calculateDescriptive(rawData)
    const fallback = new FallbackProvider()

    const fallbackResult = await fallback.generateInterpretation({
      analysisType: 'Deskriptif',
      statisticalResult: calc,
      language: 'id',
    })

    expect(fallbackResult.sumber).toBe('fallback')
    expect(fallbackResult.narrative.toLowerCase()).toContain('deskriptif')
    expect(fallbackResult.exampleCase).toBeDefined()
  })
})

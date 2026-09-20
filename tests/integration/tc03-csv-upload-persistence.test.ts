import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'
import { AnalysisRepository } from '@/lib/storage/repositories/analysis-repository'

describe('TC-03 Integration: Upload CSV Valid -> Validasi & Simpan', () => {
  const token = createSessionToken({
    userId: 101,
    email: 'mahasiswa101@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('validates and persists dataset, statistics, narrative, and visualization from valid CSV input', async () => {
    const csvContent = `skor_pretest,skor_posttest\n65,78\n70,82\n68,80\n75,88\n72,85\n80,92`

    // 1. Authenticated user submits CSV file/content to /api/calculate
    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `auth_session=${token}`,
      },
      body: JSON.stringify({
        namaAnalisis: 'Pengujian Hasil Belajar Pre-Post Test (CSV)',
        jenisAnalisis: 'Korelasi',
        formatData: 'csv',
        fileName: 'data_penelitian.csv',
        rawContent: csvContent,
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.analysisId).toBeDefined()
    const analysisId = json.analysisId as string

    // 2. Assert stored dataset state directly in persistence layer (PostgreSQL / Memory adapter)
    const stored = await AnalysisRepository.getCompleteById(Number(analysisId), 101)
    expect(stored).not.toBeNull()
    expect(stored?.analisis.id_analisis).toBe(Number(analysisId))
    expect(stored?.analisis.id_pengguna).toBe(101)
    expect(stored?.analisis.nama_analisis).toBe('Pengujian Hasil Belajar Pre-Post Test (CSV)')
    expect(stored?.analisis.jenis_analisis).toBe('Korelasi')

    // Verify dataset input was persisted with raw content and format
    expect(stored?.dataset).toBeDefined()
    expect(stored?.dataset?.format_data).toBe('csv')
    expect(stored?.dataset?.nama_file).toBe('data_penelitian.csv')

    // Verify statistical results and visualization were stored
    expect(stored?.hasil).toBeDefined()
    expect(stored?.visualisasi).toBeDefined()
    expect(stored?.narasi).toBeDefined()

    // 3. User can fetch and read the stored analysis via GET /api/hasil
    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const getRes = await hasilHandler(getReq)
    expect(getRes.status).toBe(200)

    const getJson = await getRes.json()
    expect(getJson.data).toBeDefined()
    expect(getJson.data.id).toBe(String(analysisId))
    expect(getJson.data.judul).toBe('Pengujian Hasil Belajar Pre-Post Test (CSV)')
  })
})

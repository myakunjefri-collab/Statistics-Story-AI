import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'
import { AnalysisRepository } from '@/lib/storage/repositories/analysis-repository'

describe('TC-05 Integration: Input Data Manual -> Data Tersimpan & Siap Dianalisis', () => {
  const token = createSessionToken({
    userId: 103,
    email: 'mahasiswa103@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('validates manual numeric tabular input, stores dataset, and produces analysis-ready output', async () => {
    // 1. Authenticated user inputs manual numeric tabular data
    const manualTabularText = `nilai_tugas,nilai_kuis\n85,90\n78,82\n92,95\n88,89\n70,75\n80,84`

    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `auth_session=${token}`,
      },
      body: JSON.stringify({
        namaAnalisis: 'Analisis Korelasi Tugas dan Kuis (Manual)',
        jenisAnalisis: 'Korelasi',
        formatData: 'manual',
        rawContent: manualTabularText,
      }),
    })

    const res = await calculateHandler(req)
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.analysisId).toBeDefined()
    const analysisId = json.analysisId as string

    // 2. Assert that the manually inputted dataset is persisted in the database
    const stored = await AnalysisRepository.getCompleteById(Number(analysisId), 103)
    expect(stored).not.toBeNull()
    expect(stored?.analisis.id_analisis).toBe(Number(analysisId))
    expect(stored?.analisis.id_pengguna).toBe(103)
    expect(stored?.dataset?.format_data).toBe('manual')

    // Verify dataset status is complete ('Selesai') and ready for analysis review
    expect(stored?.analisis.status).toBe('Selesai')
    expect(stored?.hasil).toBeDefined()
    expect(stored?.visualisasi).toBeDefined()

    // 3. Confirm that the user can proceed to view the analysis result
    const getReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const getRes = await hasilHandler(getReq)
    expect(getRes.status).toBe(200)

    const hasilData = await getRes.json()
    expect(hasilData.data).toBeDefined()
    expect(hasilData.data.judul).toBe('Analisis Korelasi Tugas dan Kuis (Manual)')
    expect(hasilData.data.jenisUji).toBe('Korelasi')
    expect(hasilData.data.nilai.length).toBeGreaterThan(0)
  })
})

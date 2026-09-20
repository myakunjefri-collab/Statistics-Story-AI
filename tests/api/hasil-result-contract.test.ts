import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'
import { hasilResponseSchema } from '@/lib/validation'

describe('API Hasil Result Contract & User Boundary (Section S & Section O)', () => {
  const userAToken = createSessionToken({
    userId: 101,
    email: 'userA@uns.ac.id',
    peran: 'mahasiswa',
  })

  const userBToken = createSessionToken({
    userId: 202,
    email: 'userB@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('Roundtrip: POST /api/calculate -> DB -> GET /api/hasil conforms to Zod contract', async () => {
    // 1. User A runs calculate for Regression
    const calcReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${userAToken}` },
      body: JSON.stringify({
        namaAnalisis: 'Regresi Jam Belajar vs Nilai Ujian',
        jenisAnalisis: 'Regresi',
        formatData: 'manual',
        rawContent: 'jam,skor\n2,55\n4,65\n6,78\n8,88\n10,95',
      }),
    })

    const calcRes = await calculateHandler(calcReq)
    expect(calcRes.status).toBe(201)
    const calcJson = await calcRes.json()
    expect(calcJson.success).toBe(true)
    const analysisId = calcJson.analysisId
    expect(analysisId).toBeDefined()

    // 2. User A retrieves the analysis result via GET /api/hasil?id=...
    const hasilReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${userAToken}` },
    })

    const hasilRes = await hasilHandler(hasilReq)
    expect(hasilRes.status).toBe(200)

    const rawHasil = await hasilRes.json()

    // 3. Strict Zod Validation of the API payload (Section G.9 & Section S)
    const validation = hasilResponseSchema.safeParse(rawHasil)
    expect(validation.success).toBe(true)

    if (validation.success) {
      const data = validation.data.data
      expect(data.jenisUji).toBe('Regresi')
      expect(data.judul).toBe('Regresi Jam Belajar vs Nilai Ujian')

      // Visualisasi is canonical scatter with trendline
      expect(data.visualisasi.jenisGrafik).toBe('scatter')
      expect(data.visualisasi.dataGrafik.kind).toBe('scatter')
      if (data.visualisasi.dataGrafik.kind === 'scatter') {
        expect(data.visualisasi.dataGrafik.points.length).toBe(5)
        expect(data.visualisasi.dataGrafik.trendline).toBeDefined()
        expect(data.visualisasi.dataGrafik.trendline?.slope).toBeGreaterThan(0)
      }

      // Statistical values are formatted without [object Object]
      for (const val of data.nilai) {
        expect(val.nilai).not.toContain('[object')
        expect(val.label).not.toContain('[object')
      }

      // Narrative & Example case are present
      expect(data.narasi.isiNarasi.length).toBeGreaterThan(10)
      expect(data.contohKasus.deskripsiKasus.length).toBeGreaterThan(10)
    }
  })

  it('User Isolation (Section O): User B cannot access User A analysis result', async () => {
    // 1. User A creates private analysis
    const calcReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${userAToken}` },
      body: JSON.stringify({
        namaAnalisis: 'Data Rahasia User A',
        jenisAnalisis: 'Deskriptif',
        formatData: 'manual',
        rawContent: '10, 20, 30, 40, 50',
      }),
    })

    const calcRes = await calculateHandler(calcReq)
    expect(calcRes.status).toBe(201)
    const analysisId = (await calcRes.json()).analysisId

    // 2. User B tries to query User A's analysis result
    const userBReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${userBToken}` },
    })

    const userBRes = await hasilHandler(userBReq)
    // Must return 404 to prevent IDOR / leaking record existence to unauthorized users
    expect(userBRes.status).toBe(404)
    const userBJson = await userBRes.json()
    expect(userBJson.success).toBe(false)
  })

  it('GET /api/hasil without id param fetches the latest analysis of the logged in user', async () => {
    const latestReq = new NextRequest('http://localhost:3000/api/hasil', {
      headers: { cookie: `auth_session=${userAToken}` },
    })
    const res = await hasilHandler(latestReq)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.judul).toBe('Data Rahasia User A')
  })

  it('GET /api/hasil returns 404 for invalid non-numeric ID or non-existent record', async () => {
    const invalidIdReq = new NextRequest('http://localhost:3000/api/hasil?id=not_a_number', {
      headers: { cookie: `auth_session=${userAToken}` },
    })
    const resInvalid = await hasilHandler(invalidIdReq)
    expect(resInvalid.status).toBe(404)

    const nonExistentReq = new NextRequest('http://localhost:3000/api/hasil?id=999999', {
      headers: { cookie: `auth_session=${userAToken}` },
    })
    const resNonExistent = await hasilHandler(nonExistentReq)
    expect(resNonExistent.status).toBe(404)
  })

  it('Unauthenticated request to GET /api/hasil returns 401', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/hasil?id=1')
    const res = await hasilHandler(unauthReq)
    expect(res.status).toBe(401)
  })
})

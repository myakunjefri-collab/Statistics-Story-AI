import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { DELETE as deleteAnalysisHandler } from '@/../app/api/analyses/[id]/route'
import { createSessionToken } from '@/lib/auth/session'

describe('Security & User Ownership Boundary (Anti-IDOR)', () => {
  const userAToken = createSessionToken({
    userId: 501,
    email: 'mahasiswaA@uns.ac.id',
    peran: 'mahasiswa',
  })

  const userBToken = createSessionToken({
    userId: 502,
    email: 'mahasiswaB@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('enforces strict server-side ownership isolation: User B cannot access User A analysis', async () => {
    // 1. User A creates an analysis
    const createReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `auth_session=${userAToken}`,
      },
      body: JSON.stringify({
        namaAnalisis: 'Data Rahasia Riset User A',
        jenisAnalisis: 'Deskriptif',
        formatData: 'manual',
        rawContent: 'skor\n88\n92\n79\n95\n84',
      }),
    })

    const createRes = await calculateHandler(createReq)
    expect(createRes.status).toBe(201)
    const { analysisId } = await createRes.json()
    expect(analysisId).toBeDefined()

    // 2. User A accesses their own result -> HTTP 200
    const userAReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${userAToken}` },
    })
    const userARes = await hasilHandler(userAReq)
    expect(userARes.status).toBe(200)
    const userAJson = await userARes.json()
    expect(userAJson.data.judul).toBe('Data Rahasia Riset User A')

    // 3. User B attempts to access User A result by spoofing/requesting analysisId -> HTTP 404
    const userBReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`, {
      headers: { cookie: `auth_session=${userBToken}` },
    })
    const userBRes = await hasilHandler(userBReq)
    // Server must reject with HTTP 404 (Resource not found for this user) to prevent IDOR enumeration
    expect(userBRes.status).toBe(404)
    const userBJson = await userBRes.json()
    expect(userBJson.success).toBe(false)
    expect(userBJson.message).toMatch(/tidak ditemukan/i)

    // 4. User B attempts to delete User A analysis via DELETE /api/analyses/[id] -> HTTP 404
    const deleteReq = new NextRequest(`http://localhost:3000/api/analyses/${analysisId}`, {
      method: 'DELETE',
      headers: { cookie: `auth_session=${userBToken}` },
    })
    const deleteRes = await deleteAnalysisHandler(deleteReq, {
      params: Promise.resolve({ id: analysisId }),
    })
    expect(deleteRes.status).toBe(404)

    // 5. Unauthenticated request without session cookie -> HTTP 401
    const unauthReq = new NextRequest(`http://localhost:3000/api/hasil?id=${analysisId}`)
    const unauthRes = await hasilHandler(unauthReq)
    expect(unauthRes.status).toBe(401)
  })
})

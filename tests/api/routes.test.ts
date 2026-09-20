import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as healthHandler } from '@/../app/api/health/route'
import { POST as registerHandler } from '@/../app/api/auth/register/route'
import { POST as loginHandler } from '@/../app/api/auth/login/route'
import { GET as sessionHandler } from '@/../app/api/auth/session/route'
import { POST as logoutHandler } from '@/../app/api/auth/logout/route'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as analysesHandler, POST as createAnalysisHandler } from '@/../app/api/analyses/route'
import {
  GET as getSingleAnalysisHandler,
  PATCH as patchAnalysisHandler,
  DELETE as deleteAnalysisHandler,
} from '@/../app/api/analyses/[id]/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'

describe('Next.js API Route Handlers Integration', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await healthHandler()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })

  it('Auth Flow: Register, Login, Session, and Logout', async () => {
    const testEmail = `test.user.${Date.now()}@uns.ac.id`
    const testPassword = 'SecurePassword123!'

    // 1. Register
    const regReq = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mahasiswa Test',
        email: testEmail,
        password: testPassword,
        peran: 'mahasiswa',
      }),
    })
    const regRes = await registerHandler(regReq)
    expect(regRes.status).toBe(201)
    const regJson = await regRes.json()
    expect(regJson.success).toBe(true)

    // 2. Login
    const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    })
    const loginRes = await loginHandler(loginReq)
    expect(loginRes.status).toBe(200)
    const loginJson = await loginRes.json()
    expect(loginJson.success).toBe(true)

    // Extract session cookie from Set-Cookie header
    const setCookie = loginRes.headers.get('set-cookie') || ''
    expect(setCookie).toContain('auth_session')

    // 3. Check Session
    const sessionCookieMatch = setCookie.match(/auth_session=([^;]+)/)
    const sessionCookie = sessionCookieMatch ? sessionCookieMatch[1] : ''

    const sessionReq = new NextRequest('http://localhost:3000/api/auth/session', {
      headers: { cookie: `auth_session=${sessionCookie}` },
    })
    const sessionRes = await sessionHandler(sessionReq)
    expect(sessionRes.status).toBe(200)
    const sessionJson = await sessionRes.json()
    expect(sessionJson.isAuthenticated).toBe(true)
    expect(sessionJson.user.email).toBe(testEmail)

    // 4. Logout
    const logoutRes = await logoutHandler()
    expect(logoutRes.status).toBe(200)
  })

  it('POST /api/calculate rejects unauthenticated requests with 401', async () => {
    const unauthReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namaAnalisis: 'Test Tanpa Login',
        jenisAnalisis: 'deskriptif',
        sourceType: 'manual',
        rawText: '10, 20, 30',
      }),
    })

    const res = await calculateHandler(unauthReq)
    expect(res.status).toBe(401)
  })

  it('POST /api/calculate processes all 4 analysis types correctly', async () => {
    const token = createSessionToken({
      userId: 55,
      email: 'peneliti@uns.ac.id',
      peran: 'mahasiswa',
    })

    // 1. Descriptive
    const descReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Uji Deskriptif',
        jenisAnalisis: 'Deskriptif',
        formatData: 'manual',
        rawContent: '12, 15, 12, 18, 22, 25, 22, 30, 14, 18',
      }),
    })
    const descRes = await calculateHandler(descReq)
    expect(descRes.status).toBe(201)

    // 2. t-Test
    const tReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Uji t Dua Kelompok',
        jenisAnalisis: 'Uji t',
        formatData: 'csv',
        rawContent: 'kelompok,nilai\nKontrol,70\nKontrol,75\nEksperimen,85\nEksperimen,90',
        selectedColumns: { groupColumn: 'kelompok', valueColumn: 'nilai' },
      }),
    })
    const tRes = await calculateHandler(tReq)
    expect(tRes.status).toBe(201)

    // 3. Correlation
    const corrReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Uji Korelasi',
        jenisAnalisis: 'Korelasi',
        formatData: 'manual',
        rawContent: 'jam,nilai\n2,60\n4,70\n6,80\n8,90',
      }),
    })
    const corrRes = await calculateHandler(corrReq)
    expect(corrRes.status).toBe(201)

    // 4. Regression
    const regReq = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        namaAnalisis: 'Uji Regresi',
        jenisAnalisis: 'Regresi',
        formatData: 'manual',
        rawContent: 'x,y\n1,2.5\n2,4.8\n3,7.2\n4,9.5',
      }),
    })
    const regRes = await calculateHandler(regReq)
    expect(regRes.status).toBe(201)
    const regJson = await regRes.json()
    expect(regJson.analysisId).toBeDefined()
  })

  it('CRUD on /api/analyses and /api/analyses/[id]', async () => {
    const userId = 88
    const token = createSessionToken({
      userId,
      email: 'user88@uns.ac.id',
      peran: 'mahasiswa',
    })

    // 1. Create quick analysis via POST /api/analyses
    const createReq = new NextRequest('http://localhost:3000/api/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        nama: 'Analisis Cepat',
        jenisAnalisis: 'Korelasi',
        status: 'Diproses',
      }),
    })
    const createRes = await createAnalysisHandler(createReq)
    expect(createRes.status).toBe(201)
    const createJson = await createRes.json()
    const createdId = createJson.data.id

    // 2. Read single analysis via GET /api/analyses/[id]
    const getReq = new NextRequest(`http://localhost:3000/api/analyses/${createdId}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const getRes = await getSingleAnalysisHandler(getReq, { params: Promise.resolve({ id: createdId }) })
    expect(getRes.status).toBe(200)

    // 3. Update single analysis via PATCH /api/analyses/[id]
    const patchReq = new NextRequest(`http://localhost:3000/api/analyses/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
      body: JSON.stringify({
        nama: 'Analisis Cepat Diperbarui',
        status: 'Selesai',
      }),
    })
    const patchRes = await patchAnalysisHandler(patchReq, { params: Promise.resolve({ id: createdId }) })
    expect(patchRes.status).toBe(200)

    // 4. List analyses via GET /api/analyses
    const listReq = new NextRequest('http://localhost:3000/api/analyses', {
      headers: { cookie: `auth_session=${token}` },
    })
    const listRes = await analysesHandler(listReq)
    expect(listRes.status).toBe(200)
    const listJson = await listRes.json()
    expect(listJson.data.length).toBeGreaterThan(0)

    // 5. Get result via GET /api/hasil?id=...
    const hasilReq = new NextRequest(`http://localhost:3000/api/hasil?id=${createdId}`, {
      headers: { cookie: `auth_session=${token}` },
    })
    const hasilRes = await hasilHandler(hasilReq)
    expect([200, 404]).toContain(hasilRes.status)

    // 6. Delete analysis via DELETE /api/analyses/[id]
    const delReq = new NextRequest(`http://localhost:3000/api/analyses/${createdId}`, {
      method: 'DELETE',
      headers: { cookie: `auth_session=${token}` },
    })
    const delRes = await deleteAnalysisHandler(delReq, { params: Promise.resolve({ id: createdId }) })
    expect(delRes.status).toBe(200)
  })
})

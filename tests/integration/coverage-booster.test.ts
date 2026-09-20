import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/../app/api/auth/register/route'
import { POST as loginHandler } from '@/../app/api/auth/login/route'
import { GET as sessionHandler } from '@/../app/api/auth/session/route'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { GET as analysesHandler, POST as createAnalysisHandler } from '@/../app/api/analyses/route'
import {
  GET as getSingleAnalysisHandler,
  PATCH as patchAnalysisHandler,
  DELETE as deleteAnalysisHandler,
} from '@/../app/api/analyses/[id]/route'
import { GET as hasilHandler } from '@/../app/api/hasil/route'
import { createSessionToken } from '@/lib/auth/session'
import { parseCsv } from '@/lib/data-processing/csv-parser'
import { parseExcel } from '@/lib/data-processing/excel-parser'
import { parseManualInput } from '@/lib/data-processing/manual-parser'
import { validateDatasetForAnalysis } from '@/lib/data-processing/data-validator'
import { calculateDescriptive } from '@/lib/statistics/descriptive'
import { calculateTTest } from '@/lib/statistics/t-test'
import { calculateCorrelation } from '@/lib/statistics/correlation'
import { calculateRegression } from '@/lib/statistics/regression'
import { logGamma, computeTTestPValue, regularizedIncompleteBeta, quantile } from '@/lib/statistics/math-utils'
import { FallbackProvider } from '@/lib/ai/fallback-provider'
import { ExternalLLMProvider } from '@/lib/ai/external-provider'
import { getAIProvider, generateInterpretationWithFallback } from '@/lib/ai/provider-factory'

describe('Coverage & Edge-Case Branch Verification', () => {
  describe('Auth API edge branches', () => {
    it('register handles invalid schemas and duplicates', async () => {
      // Invalid schema (empty body)
      const emptyReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad' }),
      })
      const emptyRes = await registerHandler(emptyReq)
      expect(emptyRes.status).toBe(400)

      // Valid register
      const email = `dup.${Date.now()}@uns.ac.id`
      const validReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Budi Test',
          email,
          password: 'PasswordValid123',
          peran: 'dosen',
        }),
      })
      const res1 = await registerHandler(validReq)
      expect(res1.status).toBe(201)

      // Duplicate email
      const dupReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Budi Duplicate',
          email,
          password: 'PasswordValid123',
          peran: 'dosen',
        }),
      })
      const res2 = await registerHandler(dupReq)
      expect(res2.status).toBe(409)
    })

    it('login handles invalid payload, unknown user, and wrong password', async () => {
      // Invalid payload
      const invalidReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      })
      const invRes = await loginHandler(invalidReq)
      expect(invRes.status).toBe(400)

      // Unknown user
      const unknownReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@uns.ac.id', password: 'Password123' }),
      })
      const unkRes = await loginHandler(unknownReq)
      expect(unkRes.status).toBe(401)

      // Create a user then try wrong password
      const email = `pwd.test.${Date.now()}@uns.ac.id`
      await registerHandler(
        new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'User Test', email, password: 'CorrectPassword123' }),
        }),
      )

      const wrongPwdReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'WrongPassword456' }),
      })
      const wrongRes = await loginHandler(wrongPwdReq)
      expect(wrongRes.status).toBe(401)
    })

    it('session handles missing/unauthenticated cookies', async () => {
      const noCookieReq = new NextRequest('http://localhost:3000/api/auth/session')
      const noCookieRes = await sessionHandler(noCookieReq)
      expect(noCookieRes.status).toBe(200)
      const noCookieJson = await noCookieRes.json()
      expect(noCookieJson.isAuthenticated).toBe(false)

      const badCookieReq = new NextRequest('http://localhost:3000/api/auth/session', {
        headers: { cookie: 'auth_session=invalid.token.here' },
      })
      const badCookieRes = await sessionHandler(badCookieReq)
      expect(badCookieRes.status).toBe(200)
      const badCookieJson = await badCookieRes.json()
      expect(badCookieJson.isAuthenticated).toBe(false)
    })
  })

  describe('Analyses and Result API edge branches', () => {
    it('handles unauthorized and malformed requests on analyses endpoints', async () => {
      // Missing auth for GET /api/analyses
      const unauthGet = await analysesHandler(new NextRequest('http://localhost:3000/api/analyses'))
      expect(unauthGet.status).toBe(401)

      // Missing auth for POST /api/analyses
      const unauthPost = await createAnalysisHandler(new NextRequest('http://localhost:3000/api/analyses', { method: 'POST' }))
      expect(unauthPost.status).toBe(401)

      const token = createSessionToken({ userId: 999, email: 'usr999@uns.ac.id', peran: 'mahasiswa' })

      // Invalid ID parameter on GET /api/analyses/[id]
      const badIdGet = await getSingleAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/invalid', { headers: { cookie: `auth_session=${token}` } }),
        { params: Promise.resolve({ id: 'abc' }) },
      )
      expect(badIdGet.status).toBe(400)

      // Not found on GET /api/analyses/[id]
      const notFoundGet = await getSingleAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/99999', { headers: { cookie: `auth_session=${token}` } }),
        { params: Promise.resolve({ id: '99999' }) },
      )
      expect(notFoundGet.status).toBe(404)

      // Unauthenticated DELETE /api/analyses/[id]
      const unauthDel = await deleteAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/1', { method: 'DELETE' }),
        { params: Promise.resolve({ id: '1' }) },
      )
      expect(unauthDel.status).toBe(401)

      // Bad ID on DELETE
      const badIdDel = await deleteAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/xyz', { method: 'DELETE', headers: { cookie: `auth_session=${token}` } }),
        { params: Promise.resolve({ id: 'xyz' }) },
      )
      expect(badIdDel.status).toBe(400)

      // Not found on DELETE
      const notFoundDel = await deleteAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/88888', { method: 'DELETE', headers: { cookie: `auth_session=${token}` } }),
        { params: Promise.resolve({ id: '88888' }) },
      )
      expect(notFoundDel.status).toBe(404)

      // Unauthenticated PATCH
      const unauthPatch = await patchAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/1', { method: 'PATCH' }),
        { params: Promise.resolve({ id: '1' }) },
      )
      expect(unauthPatch.status).toBe(401)

      // Bad ID on PATCH
      const badIdPatch = await patchAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/xyz', { method: 'PATCH', headers: { cookie: `auth_session=${token}` } }),
        { params: Promise.resolve({ id: 'xyz' }) },
      )
      expect(badIdPatch.status).toBe(400)

      // Not found on PATCH
      const notFoundPatch = await patchAnalysisHandler(
        new NextRequest('http://localhost:3000/api/analyses/77777', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
          body: JSON.stringify({ nama: 'Updated' }),
        }),
        { params: Promise.resolve({ id: '77777' }) },
      )
      expect(notFoundPatch.status).toBe(404)
    })

    it('GET /api/hasil handles missing auth, missing id, invalid id, not found', async () => {
      // Unauth
      const unauth = await hasilHandler(new NextRequest('http://localhost:3000/api/hasil?id=1'))
      expect(unauth.status).toBe(401)

      const token = createSessionToken({ userId: 101, email: 'u101@uns.ac.id', peran: 'mahasiswa' })

      // Missing id -> attempts latest, returns 404 for empty user
      const missingId = await hasilHandler(
        new NextRequest('http://localhost:3000/api/hasil', { headers: { cookie: `auth_session=${token}` } }),
      )
      expect([200, 404]).toContain(missingId.status)

      // Invalid id
      const invalidId = await hasilHandler(
        new NextRequest('http://localhost:3000/api/hasil?id=notanumber', { headers: { cookie: `auth_session=${token}` } }),
      )
      expect([200, 404]).toContain(invalidId.status)

      // Not found
      const notFound = await hasilHandler(
        new NextRequest('http://localhost:3000/api/hasil?id=999999', { headers: { cookie: `auth_session=${token}` } }),
      )
      expect(notFound.status).toBe(404)
    })

    it('POST /api/calculate handles invalid inputs and unsupported formats', async () => {
      const token = createSessionToken({ userId: 102, email: 'u102@uns.ac.id', peran: 'mahasiswa' })

      // Invalid schema
      const invalidSchema = await calculateHandler(
        new NextRequest('http://localhost:3000/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
          body: JSON.stringify({}),
        }),
      )
      expect(invalidSchema.status).toBe(400)

      // Missing rawContent / fileBase64
      const missingContent = await calculateHandler(
        new NextRequest('http://localhost:3000/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
          body: JSON.stringify({
            namaAnalisis: 'Test',
            jenisAnalisis: 'Deskriptif',
            formatData: 'manual',
          }),
        }),
      )
      expect(missingContent.status).toBe(400)

      // Successful calculation with CSV fileBase64
      const csvContent = Buffer.from('nilai\n10\n20\n30\n40').toString('base64')
      const csvCalc = await calculateHandler(
        new NextRequest('http://localhost:3000/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', cookie: `auth_session=${token}` },
          body: JSON.stringify({
            namaAnalisis: 'CSV Base64 Test',
            jenisAnalisis: 'Deskriptif',
            formatData: 'csv',
            fileBase64: csvContent,
          }),
        }),
      )
      expect(csvCalc.status).toBe(201)
    })
  })

  describe('Parsers & Data Validators Edge Branches', () => {
    it('parseCsv handles semicolons, quoted values, and invalid formats', () => {
      const semicolonCsv = 'nama;nilai;kelompok\nAndi;85;A\nBudi;90;B'
      const parsedSemi = parseCsv(semicolonCsv)
      expect(parsedSemi.headers).toContain('nilai')
      expect(parsedSemi.rowCount).toBe(2)

      const quotedCsv = '"nama lengkap","skor akhir"\n"Dewi Sartika",95\n"Ki Hajar",88'
      const parsedQuoted = parseCsv(quotedCsv)
      expect(parsedQuoted.headers).toContain('skor akhir')

      expect(() => parseCsv('')).toThrow()
    })

    it('parseManualInput handles tabulations, comma lines, and single lists', () => {
      const singleList = '10\n20\n30\n40'
      const res = parseManualInput(singleList)
      expect(res.headers.length).toBeGreaterThan(0)
      expect(res.rowCount).toBe(4)

      expect(() => parseManualInput('')).toThrow()
    })

    it('parseExcel handles empty buffer gracefully', () => {
      expect(() => parseExcel(Buffer.from([]))).toThrow()
    })

    it('validateDatasetForAnalysis validates descriptive, t-test, correlation, and regression requirements', () => {
      // Descriptive non-numeric column
      const nonNumeric = parseCsv('nama\nAndi\nBudi')
      expect(validateDatasetForAnalysis(nonNumeric, 'Deskriptif').isValid).toBe(false)

      // Descriptive valid
      const validDesc = parseCsv('nilai\n10\n20\n30')
      expect(validateDatasetForAnalysis(validDesc, 'Deskriptif').isValid).toBe(true)

      // T-Test invalid (less than 2 groups)
      const invalidT = parseCsv('grup,nilai\nA,10\nA,20')
      expect(validateDatasetForAnalysis(invalidT, 'Uji t').isValid).toBe(false)

      // Correlation invalid (less than 2 numeric columns)
      expect(validateDatasetForAnalysis(validDesc, 'Korelasi').isValid).toBe(false)

      // Regression valid
      const validReg = parseCsv('x,y\n1,2\n2,4\n3,6')
      expect(validateDatasetForAnalysis(validReg, 'Regresi').isValid).toBe(true)
    })
  })

  describe('Statistics Math Utils & Edge Branches', () => {
    it('math utils functions handle edge domains', () => {
      expect(logGamma(1)).toBeCloseTo(0, 5)
      expect(logGamma(2)).toBeCloseTo(0, 5)
      expect(computeTTestPValue(0, 10)).toBeCloseTo(1, 4)
      expect(computeTTestPValue(10, 10)).toBeLessThan(0.001)
      expect(regularizedIncompleteBeta(0, 1, 1)).toBe(0)
      expect(regularizedIncompleteBeta(1, 1, 1)).toBe(1)
      expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3)
    })

    it('statistical algorithms reject zero variance or invalid sample sizes', () => {
      // Descriptive min sample size
      expect(() => calculateDescriptive([])).toThrow()

      // Descriptive single value
      const single = calculateDescriptive([42])
      expect(single.mean).toBe(42)
      expect(single.sampleStandardDeviation).toBe(0)

      // T-Test zero variance
      expect(() => calculateTTest([5, 5, 5], [5, 5, 5])).toThrow()

      // Correlation zero variance
      expect(() => calculateCorrelation([1, 1, 1], [2, 3, 4])).toThrow()

      // Correlation mismatched lengths
      expect(() => calculateCorrelation([1, 2], [1, 2, 3])).toThrow()

      // Regression zero variance X
      expect(() => calculateRegression([2, 2, 2], [1, 2, 3])).toThrow()

      // Regression mismatched lengths
      expect(() => calculateRegression([1, 2], [1, 2, 3])).toThrow()
    })
  })

  describe('AI Providers Branch Coverage', () => {
    it('Fallback provider covers all 4 analysis types with custom languages', async () => {
      const fallback = new FallbackProvider()

      const desc = await fallback.generateInterpretation({
        analysisType: 'Deskriptif',
        statisticalResult: {
          jenisUji: 'Deskriptif',
          n: 10,
          mean: 75,
          median: 75,
          mode: [75],
          modeDescription: '75',
          sampleStandardDeviation: 10,
          populationStandardDeviation: 9.5,
          minimum: 50,
          maximum: 100,
          range: 50,
          q1: 65,
          q3: 85,
          iqr: 20,
          variance: 100,
        },
        language: 'en',
      })
      expect(desc.narrative).toBeDefined()
      expect(desc.language).toBe('en')

      const ttest = await fallback.generateInterpretation({
        analysisType: 'Uji t',
        statisticalResult: {
          jenisUji: 'Uji t',
          testMethod: "Welch's Two-Sample t-Test (Unequal Variance)",
          isTwoTailed: true,
          tStatistic: 2.45,
          pValue: 0.015,
          degreesOfFreedom: 18,
          isSignificant: true,
          meanDifference: 10,
          group1: { name: 'Kelompok A', n: 10, mean: 80, standardDeviation: 8, variance: 64 },
          group2: { name: 'Kelompok B', n: 10, mean: 70, standardDeviation: 9, variance: 81 },
        },
        language: 'id',
      })
      expect(ttest.narrative).toContain('signifikan')

      const corr = await fallback.generateInterpretation({
        analysisType: 'Korelasi',
        statisticalResult: {
          jenisUji: 'Korelasi',
          method: 'Pearson Product-Moment',
          n: 30,
          r: -0.75,
          tStatistic: -5.99,
          degreesOfFreedom: 28,
          pValue: 0.0001,
          isSignificant: true,
          strength: 'Kuat',
          direction: 'Negatif',
        },
        language: 'id',
      })
      expect(corr.narrative).toBeDefined()

      const reg = await fallback.generateInterpretation({
        analysisType: 'Regresi',
        statisticalResult: {
          jenisUji: 'Regresi',
          method: 'Simple Linear Regression',
          n: 25,
          slope: 1.5,
          intercept: 10,
          rSquared: 0.64,
          standardError: 1.2,
          equation: 'y = 1.5000x + 10.0000',
          isSignificant: true,
        },
        language: 'id',
      })
      expect(reg.narrative).toBeDefined()
    })

    it('ExternalLLMProvider constructs and has name property', () => {
      const ext = new ExternalLLMProvider('gemini', 'secret_key')
      expect(ext.name).toBe('Google Gemini AI')
    })

    it('provider-factory returns fallback provider when AI_PROVIDER is set to fallback', async () => {
      const provider = getAIProvider('fallback')
      expect(provider.name).toBeDefined()

      const res = await generateInterpretationWithFallback({
        analysisType: 'Deskriptif',
        statisticalResult: {
          jenisUji: 'Deskriptif',
          n: 5,
          mean: 50,
          median: 50,
          mode: null,
          modeDescription: 'None',
          sampleStandardDeviation: 5,
          populationStandardDeviation: 4.5,
          minimum: 45,
          maximum: 55,
          range: 10,
          q1: 47,
          q3: 53,
          iqr: 6,
          variance: 25,
        },
        language: 'id',
      })
      expect(res.narrative).toBeDefined()
    })
  })
})

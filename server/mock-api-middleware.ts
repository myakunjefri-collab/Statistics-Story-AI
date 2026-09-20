/**
 * @deprecated HISTORICAL / LEGACY BASELINE — Used only for previous Vite dev server.
 * The production Next.js 16 App Router uses app/api/* BFF Route Handlers with real database/memory adapters.
 */
import type { Connect } from 'vite'
import {
  analysesResponseSchema,
  deleteAnalysisResponseSchema,
  hasilResponseSchema,
  quickAnalysisSchema,
  singleAnalysisResponseSchema,
} from '../src/lib/validation'
import {
  addMockAnalysis,
  deleteMockAnalysis,
  getMockAnalyses,
  getMockHasil,
  updateMockAnalysis,
} from './mock-data'

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [name, ...val] = part.trim().split('=')
    if (name) cookies[name] = decodeURIComponent(val.join('='))
  }
  return cookies
}

function readBody(req: Connect.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(
  res: import('node:http').ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value)
  }
  res.end(JSON.stringify(body))
}

export function createMockApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url ? new URL(req.url, 'http://localhost:3000') : null
    if (!url?.pathname.startsWith('/api/')) {
      return next()
    }

    const pathname = url.pathname
    const method = req.method?.toUpperCase() ?? 'GET'

    try {
      // 1. Auth: GET /api/auth/session
      if (pathname === '/api/auth/session' && method === 'GET') {
        const cookies = parseCookies(req.headers.cookie)
        const isAuthenticated = cookies.statistics_session === '1'
        return sendJson(res, 200, { isAuthenticated })
      }

      // 2. Auth: POST /api/auth/login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = (await readBody(req)) as { email?: string; password?: string }
        const { email, password } = body

        if (!email || !password) {
          return sendJson(res, 400, {
            success: false,
            message: 'Email dan kata sandi wajib diisi.',
          })
        }

        const isDemo = email === 'demo@statisticsstory.ai' && password === 'password123'
        const isValid =
          isDemo || (typeof email === 'string' && email.includes('@') && password.length >= 6)

        if (!isValid) {
          return sendJson(res, 401, { success: false, message: 'Kredensial tidak valid.' })
        }

        return sendJson(
          res,
          200,
          { success: true, message: 'Login berhasil.', user: { email } },
          { 'Set-Cookie': 'statistics_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800' },
        )
      }

      // 3. Auth: POST /api/auth/logout
      if (pathname === '/api/auth/logout' && method === 'POST') {
        return sendJson(
          res,
          200,
          { success: true, message: 'Logout berhasil.' },
          { 'Set-Cookie': 'statistics_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' },
        )
      }

      // 4. Analyses: GET /api/analyses
      if (pathname === '/api/analyses' && method === 'GET') {
        if (url.searchParams.get('fail') === '1') {
          return sendJson(res, 500, { message: 'Gagal memuat data analisis dari server.' })
        }
        const rawPayload = {
          data: getMockAnalyses(),
          message: 'Data berhasil dimuat.',
        }
        const validation = analysesResponseSchema.safeParse(rawPayload)
        if (!validation.success) {
          return sendJson(res, 500, { message: 'Integritas data analisis tidak valid.' })
        }
        return sendJson(res, 200, validation.data)
      }

      // 5. Analyses: POST /api/analyses
      if (pathname === '/api/analyses' && method === 'POST') {
        const body = await readBody(req)
        const inputValidation = quickAnalysisSchema.safeParse(body)
        if (!inputValidation.success) {
          return sendJson(res, 400, {
            message: inputValidation.error.issues[0]?.message ?? 'Data analisis tidak valid.',
          })
        }
        const created = addMockAnalysis(inputValidation.data)
        const responsePayload = {
          data: created,
          message: 'Analisis baru berhasil dibuat.',
        }
        const responseValidation = singleAnalysisResponseSchema.safeParse(responsePayload)
        if (!responseValidation.success) {
          return sendJson(res, 500, {
            message: 'Integritas response pembuatan analisis tidak valid.',
          })
        }
        return sendJson(res, 201, responseValidation.data)
      }

      // 6. Analyses: PATCH & DELETE /api/analyses/:id
      const matchAnalysesId = pathname.match(/^\/api\/analyses\/([^/]+)$/)
      if (matchAnalysesId?.[1]) {
        const id = decodeURIComponent(matchAnalysesId[1])

        if (method === 'PATCH') {
          const body = await readBody(req)
          const inputValidation = quickAnalysisSchema.safeParse(body)
          if (!inputValidation.success) {
            return sendJson(res, 400, {
              message: inputValidation.error.issues[0]?.message ?? 'Data pembaruan tidak valid.',
            })
          }
          const updated = updateMockAnalysis(id, inputValidation.data)
          if (!updated) {
            return sendJson(res, 404, { message: `Analisis dengan ID "${id}" tidak ditemukan.` })
          }
          const responsePayload = {
            data: updated,
            message: 'Analisis berhasil diperbarui.',
          }
          const responseValidation = singleAnalysisResponseSchema.safeParse(responsePayload)
          if (!responseValidation.success) {
            return sendJson(res, 500, {
              message: 'Integritas response pembaruan analisis tidak valid.',
            })
          }
          return sendJson(res, 200, responseValidation.data)
        }

        if (method === 'DELETE') {
          const success = deleteMockAnalysis(id)
          if (!success) {
            return sendJson(res, 404, { message: `Analisis dengan ID "${id}" tidak ditemukan.` })
          }
          const responsePayload = {
            data: { id },
            message: 'Analisis berhasil dihapus.',
          }
          const responseValidation = deleteAnalysisResponseSchema.safeParse(responsePayload)
          if (!responseValidation.success) {
            return sendJson(res, 500, {
              message: 'Integritas response penghapusan analisis tidak valid.',
            })
          }
          return sendJson(res, 200, responseValidation.data)
        }
      }

      // 7. Hasil: GET /api/hasil
      if (pathname === '/api/hasil' && method === 'GET') {
        if (url.searchParams.get('fail') === '1') {
          return sendJson(res, 500, { message: 'Gagal memuat hasil analisis dari server.' })
        }
        const id = url.searchParams.get('id') || undefined
        const rawPayload = {
          data: getMockHasil(id),
          message: 'Hasil berhasil dimuat.',
        }
        const validation = hasilResponseSchema.safeParse(rawPayload)
        if (!validation.success) {
          return sendJson(res, 500, { message: 'Integritas data hasil analisis tidak valid.' })
        }
        return sendJson(res, 200, validation.data)
      }

      return sendJson(res, 404, { message: 'Endpoint tidak ditemukan.' })
    } catch {
      return sendJson(res, 500, { message: 'Terjadi kesalahan pada mock server.' })
    }
  }
}

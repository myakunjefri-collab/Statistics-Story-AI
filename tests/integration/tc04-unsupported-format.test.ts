import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as calculateHandler } from '@/../app/api/calculate/route'
import { createSessionToken } from '@/lib/auth/session'
import { validateAnalysisInput } from '@/lib/validation'

describe('TC-04 Integration: Upload Berkas Format Tidak Didukung (e.g. .pdf) -> Pesan Error Format', () => {
  const token = createSessionToken({
    userId: 102,
    email: 'mahasiswa102@uns.ac.id',
    peran: 'mahasiswa',
  })

  it('rejects unsupported file formats (.pdf) at the input validation boundary', () => {
    // 1. Validate via production form validation boundary
    const pdfUploadPayload = {
      nama: 'Uji Coba Berkas PDF',
      jenisAnalisis: 'Deskriptif' as const,
      metode: 'unggah' as const,
      fileName: 'laporan_riset.pdf',
      fileSize: 1024 * 50, // 50 KB
    }

    const validation = validateAnalysisInput(pdfUploadPayload)
    expect(validation.success).toBe(false)
    expect(validation.errors).toBeDefined()
    expect(validation.errors?.data).toMatch(/hanya mendukung \.csv, \.xlsx, atau \.xls/i)
  })

  it('rejects unsupported file format (.pdf / invalid formatData) at the API boundary with HTTP 400', async () => {
    // 2. Simulated request submitting an unsupported PDF format to /api/calculate
    const pdfBuffer = Buffer.from('%PDF-1.4 ... binary pdf contents ... %%EOF')
    const pdfBase64 = pdfBuffer.toString('base64')

    const req = new NextRequest('http://localhost:3000/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `auth_session=${token}`,
      },
      body: JSON.stringify({
        namaAnalisis: 'Analisis Berkas PDF Tidak Didukung',
        jenisAnalisis: 'Deskriptif',
        formatData: 'pdf', // Unsupported format!
        fileName: 'skripsi_bab4.pdf',
        fileBase64: pdfBase64,
      }),
    })

    const res = await calculateHandler(req)
    // Must return HTTP 400 Bad Request
    expect(res.status).toBe(400)

    const json = await res.json()
    expect(json.success).toBe(false)
    // Must not proceed to computation or return success
    expect(json.analysisId).toBeUndefined()
  })
})

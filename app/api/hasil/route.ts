import { type NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'
import {
  normalizeAnalysisType,
  normalizeContohKasus,
  normalizeNarrative,
  normalizeStatisticalValues,
  normalizeVisualization,
} from '@/lib/result/normalizers'
import { AnalysisRepository } from '@/lib/storage'
import { hasilResponseSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // 1. Validate session
    const user = getSessionFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Sesi tidak valid atau telah kedaluwarsa.' },
        { status: 401 },
      )
    }

    // 2. Extract and validate ID parameter
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')

    let record = null
    if (idParam) {
      const numId = parseInt(idParam, 10)
      if (!Number.isNaN(numId)) {
        record = await AnalysisRepository.getCompleteById(numId, user.userId)
      } else {
        return NextResponse.json(
          { success: false, message: 'ID analisis tidak valid.' },
          { status: 404 },
        )
      }
    } else {
      const all = await AnalysisRepository.getByUser(user.userId)
      if (all.length > 0) {
        const latestId = all[0]?.id_analisis
        if (latestId) {
          record = await AnalysisRepository.getCompleteById(latestId, user.userId)
        }
      }
    }

    // 3. User-ownership validation: returns 404 if record doesn't exist or doesn't belong to user
    if (!record || !record.analisis || !record.hasil) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data hasil statistik tidak ditemukan atau Anda tidak memiliki akses.',
        },
        { status: 404 },
      )
    }

    // 4. Adapt Database Model -> API Domain Model via strongly-typed normalizers
    const jenisUji = normalizeAnalysisType(record.analisis.jenis_analisis)
    const normalizedNilai = normalizeStatisticalValues(jenisUji, record.hasil.nilai_statistik)
    const normalizedNarasi = normalizeNarrative(record.narasi)
    const normalizedVisualisasi = normalizeVisualization(record.visualisasi, jenisUji)
    const normalizedContohKasus = normalizeContohKasus(record.contohKasus)

    const payload = {
      id: String(record.analisis.id_analisis),
      idAnalisis: record.analisis.id_analisis,
      jenisUji,
      judul: record.analisis.nama_analisis,
      ringkasan: `Hasil analisis statistik ${jenisUji} untuk dataset "${record.analisis.nama_analisis}".`,
      nilai: normalizedNilai,
      narasi: normalizedNarasi,
      visualisasi: normalizedVisualisasi,
      contohKasus: normalizedContohKasus,
    }

    // 5. Strict runtime schema validation (Section G.9 & G.10)
    const validated = hasilResponseSchema.safeParse({
      data: payload,
      message: 'Berhasil memuat hasil analisis.',
    })

    if (!validated.success) {
      console.error('[API Hasil Schema Validation Failed]:', validated.error.format())
      return NextResponse.json(
        { success: false, message: 'Gagal memproses struktur data hasil analisis.' },
        { status: 500 },
      )
    }

    return NextResponse.json(validated.data)
  } catch (error) {
    console.error('Error in GET /api/hasil:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat memproses hasil analisis.' },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'
import { AnalysisRepository } from '@/lib/storage/repositories/analysis-repository'

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi diperlukan untuk melihat riwayat analisis.' },
      { status: 401 },
    )
  }

  try {
    const list = await AnalysisRepository.getByUser(session.userId)
    return NextResponse.json(
      {
        success: true,
        data: list,
        message: 'Daftar riwayat analisis berhasil dimuat.',
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[API Analyses GET Error]', err)
    return NextResponse.json(
      { success: false, message: 'Gagal memuat riwayat analisis.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi diperlukan.' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()
    const nama = body.nama || body.namaAnalisis || 'Analisis Baru'
    const jenis = body.jenisAnalisis || body.jenis_analisis || 'Deskriptif'
    const status = body.status || 'Draf'

    const created = await AnalysisRepository.createDraft(
      {
        nama,
        jenisAnalisis: jenis,
        status,
      },
      session.userId,
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id_analisis,
          id_analisis: created.id_analisis,
          nama: created.nama_analisis,
          jenisAnalisis: created.jenis_analisis,
          status: created.status,
        },
        message: 'Analisis berhasil dibuat.',
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[API Analyses POST Error]', err)
    return NextResponse.json(
      { success: false, message: 'Gagal membuat analisis.' },
      { status: 500 },
    )
  }
}

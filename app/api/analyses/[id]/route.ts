import { type NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'
import { AnalysisRepository } from '@/lib/storage/repositories/analysis-repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi diperlukan.' },
      { status: 401 },
    )
  }

  const { id } = await params
  const analysisId = Number(id)
  if (Number.isNaN(analysisId)) {
    return NextResponse.json({ success: false, message: 'ID Analisis tidak valid.' }, { status: 400 })
  }

  try {
    const record = await AnalysisRepository.getCompleteById(analysisId, session.userId)
    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Analisis tidak ditemukan atau Anda tidak memiliki akses.' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: 'Data analisis berhasil dimuat.',
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[API Analysis Detail GET Error]', err)
    return NextResponse.json(
      { success: false, message: 'Gagal memuat detail analisis.' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi diperlukan.' },
      { status: 401 },
    )
  }

  const { id } = await params
  const analysisId = Number(id)
  if (Number.isNaN(analysisId)) {
    return NextResponse.json({ success: false, message: 'ID Analisis tidak valid.' }, { status: 400 })
  }

  try {
    const deleted = await AnalysisRepository.delete(analysisId, session.userId)
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Analisis tidak ditemukan atau gagal dihapus.' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Analisis berhasil dihapus.',
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[API Analysis DELETE Error]', err)
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus analisis.' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi diperlukan.' },
      { status: 401 },
    )
  }

  const { id } = await params
  const analysisId = Number(id)
  if (Number.isNaN(analysisId)) {
    return NextResponse.json({ success: false, message: 'ID Analisis tidak valid.' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const updated = await AnalysisRepository.update(
      analysisId,
      {
        nama: body.nama || body.namaAnalisis,
        status: body.status,
      },
      session.userId,
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Analisis tidak ditemukan atau gagal diperbarui.' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Analisis berhasil diperbarui.',
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[API Analysis PATCH Error]', err)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui analisis.' },
      { status: 500 },
    )
  }
}

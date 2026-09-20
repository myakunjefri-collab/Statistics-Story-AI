import { NextResponse } from 'next/server'
import { getDatabaseAdapter } from '@/lib/storage'

export async function GET() {
  try {
    const adapter = getDatabaseAdapter()
    const isDbOk = await adapter.isAvailable()

    if (!isDbOk) {
      return NextResponse.json(
        {
          status: 'degraded',
          database: 'unavailable',
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        database: 'error',
        message: 'Layanan sistem sedang mengalami kendala.',
      },
      { status: 500 },
    )
  }
}

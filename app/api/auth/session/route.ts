import { type NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 200 })
  }

  return NextResponse.json(
    {
      isAuthenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        peran: session.peran,
      },
    },
    { status: 200 },
  )
}

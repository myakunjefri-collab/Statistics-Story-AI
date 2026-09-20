import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSessionToken, SESSION_COOKIE_NAME, verifyPassword } from '@/lib/auth/session'
import { UserRepository } from '@/lib/storage/repositories/user-repository'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0]?.message ?? 'Kredensial tidak valid.' },
        { status: 400 },
      )
    }

    const { email, password } = validation.data
    const user = await UserRepository.findByEmail(email)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401 },
      )
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi salah.' },
        { status: 401 },
      )
    }

    const sessionToken = createSessionToken(user)
    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil.',
        user: {
          id: user.id_pengguna,
          name: user.nama,
          email: user.email,
          peran: user.peran,
        },
      },
      { status: 200 },
    )

    // Secure HttpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('[API Auth Login Error]', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat memproses login.' },
      { status: 500 },
    )
  }
}

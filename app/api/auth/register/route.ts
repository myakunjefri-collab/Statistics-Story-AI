import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/session'
import { UserRepository } from '@/lib/storage/repositories/user-repository'

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
  peran: z.enum(['mahasiswa', 'dosen']).default('mahasiswa'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0]?.message ?? 'Data registrasi tidak valid.' },
        { status: 400 },
      )
    }

    const { name, email, password, peran } = validation.data

    // Check if email is already taken
    const existing = await UserRepository.findByEmail(email)
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' },
        { status: 409 },
      )
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password)

    const newUser = await UserRepository.create({
      nama: name,
      email,
      password_hash: passwordHash,
      peran,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi akun berhasil. Silakan masuk.',
        user: {
          id: newUser.id_pengguna,
          name: newUser.nama,
          email: newUser.email,
          peran: newUser.peran,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[API Auth Register Error]', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat memproses registrasi.' },
      { status: 500 },
    )
  }
}

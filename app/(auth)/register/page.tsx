import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Daftar Akun',
  description: 'Daftarkan akun baru di Statistics Story AI untuk mulai menganalisis data statistik dengan bantuan AI.',
}

export default function RegisterPage() {
  return <AuthLayout mode="register" />
}

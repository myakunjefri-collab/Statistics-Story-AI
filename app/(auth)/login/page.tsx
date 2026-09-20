import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Statistics Story AI Anda untuk mengakses analisis data dan riwayat perhitungan.',
}

export default function LoginPage() {
  return <AuthLayout mode="login" />
}

import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import '@/globals.css'
import { AppProviders } from '@/components/providers/app-providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif-editorial',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    template: '%s | Statistics Story AI',
    default: 'Statistics Story AI — Dari Angka Menjadi Cerita',
  },
  description:
    'Sistem pembelajaran statistik berbasis AI yang mentransformasikan data dan angka statistik menjadi narasi kontekstual, visualisasi intuitif, dan contoh kasus nyata.',
  keywords: [
    'statistik',
    'statistics story',
    'data storytelling',
    'AI statistik',
    'uji t',
    'regresi',
    'korelasi',
    'deskriptif',
  ],
  authors: [{ name: 'Statistics Story AI Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Statistics Story AI — Dari Angka Menjadi Cerita',
    description:
      'Pahami hasil analisis statistik mahasiswa secara intuitif dengan narasi interpretatif otomatis dan visualisasi interaktif.',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}

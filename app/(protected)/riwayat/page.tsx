import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageHeader } from '@/components/app/page-header'
import { DashboardClientView } from '@/components/dashboard/dashboard-client-view'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export const metadata: Metadata = {
  title: 'Riwayat Analisis',
  description: 'Daftar riwayat seluruh analisis statistik yang pernah dilakukan beserta ringkasan status dan tanggal pengerjaan.',
}

export default function RiwayatPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Riwayat Pengguna"
        title="Riwayat Analisis Statistik"
        description="Daftar analisis yang pernah Anda lakukan. Klik salah satu analisis untuk membuka hasil interpretasi, visualisasi, dan contoh kasus."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClientView />
      </Suspense>
    </div>
  )
}

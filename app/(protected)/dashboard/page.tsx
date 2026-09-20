import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageHeader } from '@/components/app/page-header'
import { DashboardClientView } from '@/components/dashboard/dashboard-client-view'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export const metadata: Metadata = {
  title: 'Dasbor Analisis',
  description: 'Kelola seluruh riwayat analisis statistik dan narasi AI Anda.',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dasbor"
        title="Riwayat Analisis"
        description="Kelola seluruh analisis statistik Anda — tinjau hasil, narasi interpretatif, dan visualisasi data."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClientView />
      </Suspense>
    </div>
  )
}

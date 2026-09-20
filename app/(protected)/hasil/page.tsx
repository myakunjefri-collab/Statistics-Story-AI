import type { Metadata } from 'next'
import { ArrowLeft, FilePlus2 } from 'lucide-react'
import Link from 'next/link'
import { HasilQueryView } from '@/components/analysis-result/hasil-query-view'
import { PageHeader } from '@/components/app/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Hasil Analisis',
  description: 'Hasil perhitungan statistik, narasi interpretatif berbasis AI, dan visualisasi data interaktif.',
}

export default function HasilPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke dasbor
        </Link>
        <PageHeader
          eyebrow="Hasil Analisis"
          title="Tinjauan Interpretasi Statistik"
          description="Satu tampilan lengkap memuat angka statistik, narasi AI kontekstual, visualisasi grafik, dan contoh kasus analogi."
          action={
            <Link href="/input" className={cn(buttonVariants({ variant: 'outline' }))}>
              <FilePlus2 className="size-4 mr-1.5" aria-hidden="true" />
              Analisis Baru
            </Link>
          }
        />
      </header>

      <HasilQueryView />
    </div>
  )
}

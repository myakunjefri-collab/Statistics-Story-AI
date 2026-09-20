import type { Metadata } from 'next'
import { ArrowLeft, FilePlus2 } from 'lucide-react'
import Link from 'next/link'
import { HasilQueryView } from '@/components/analysis-result/hasil-query-view'
import { PageHeader } from '@/components/app/page-header'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  // Sanitize user-provided id for safe title rendering
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '')
  return {
    title: `Hasil Analisis #${safeId}`,
    description: `Tinjauan angka statistik, interpretasi narasi AI, dan visualisasi untuk analisis ID ${safeId}.`,
  }
}

export default async function HasilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
          eyebrow={`Hasil Analisis • ID: ${id}`}
          title="Detail Interpretasi Statistik"
          description="Satu tampilan utuh memuat empat komponen hasil: angka statistik, narasi interpretatif AI, grafik visualisasi, dan contoh kasus analogi nyata."
          action={
            <Link href="/input" className={cn(buttonVariants({ variant: 'outline' }))}>
              <FilePlus2 className="size-4 mr-1.5" aria-hidden="true" />
              Analisis Baru
            </Link>
          }
        />
      </header>

      <HasilQueryView id={id} />
    </div>
  )
}

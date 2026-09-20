import type { Metadata } from 'next'
import { AnalysisInputForm } from '@/components/analysis-input/analysis-input-form'
import { PageHeader } from '@/components/app/page-header'

export const metadata: Metadata = {
  title: 'Analisis Baru',
  description: 'Input data manual atau unggah berkas CSV/Excel untuk menghitung statistik dan menghasilkan narasi AI.',
}

export default function InputPage() {
  return (
    <div className="space-y-8">
      <header>
        <PageHeader
          eyebrow="Analisis Baru"
          title="Buat Analisis"
          description="Unggah atau tempel data Anda, pilih jenis analisis, dan biarkan sistem menyusun narasinya."
        />
      </header>

      <section aria-labelledby="form-analisis-heading">
        <h2 id="form-analisis-heading" className="sr-only">
          Formulir analisis
        </h2>
        <AnalysisInputForm />
      </section>
    </div>
  )
}

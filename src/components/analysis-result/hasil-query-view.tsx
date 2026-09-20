'use client'

import { AlertTriangle, BarChart3, BookOpen, Calculator, FileText } from 'lucide-react'
import { ExampleCaseCard } from '@/components/analysis-result/example-case-card'
import { NarrativeCard } from '@/components/analysis-result/narrative-card'
import { ResultSummary } from '@/components/analysis-result/result-summary'
import { StatisticsGrid } from '@/components/analysis-result/statistics-grid'
import { VisualizationPanel } from '@/components/analysis-result/visualization-panel'
import { ErrorState, LoadingState } from '@/components/ui/states'
import { useAnalysisResultQuery } from '@/lib/queries/use-hasil-query'
import type { HasilAnalisis } from '@/lib/types'

export interface HasilQueryViewProps {
  id?: string
  initialData?: HasilAnalisis
}

/**
 * Result page view conforming strictly to FR15:
 * All four required outputs (angka statistik, narasi AI, visualisasi, contoh kasus)
 * are presented simultaneously on one continuous page, navigable via anchor links.
 */
export function HasilQueryView({ id, initialData }: HasilQueryViewProps) {
  const {
    data: hasil,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalysisResultQuery({
    id,
    initialData,
  })

  if (isLoading && !hasil) {
    return <LoadingState label="Memuat hasil analisis..." />
  }

  if (isError || !hasil) {
    const errorMsg = error instanceof Error ? error.message : ''
    let displayMessage = 'Data hasil analisis tidak dapat dimuat.'
    if (
      errorMsg.includes('401') ||
      errorMsg.toLowerCase().includes('sesi') ||
      errorMsg.toLowerCase().includes('akses')
    ) {
      displayMessage = 'Anda tidak memiliki akses ke hasil ini.'
    } else if (errorMsg.includes('404') || errorMsg.toLowerCase().includes('tidak ditemukan')) {
      displayMessage = 'Hasil analisis tidak ditemukan.'
    }

    return (
      <ErrorState
        message={displayMessage}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const isFallback = Boolean(hasil.narasi.isFallback || hasil.narasi.sumberNarasi === 'fallback')

  return (
    <div className="space-y-10">
      {/* Sticky Anchor Navigation for quick jump (FR15) */}
      <nav
        aria-label="Navigasi bagian hasil analisis"
        className="sticky top-16 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/90 p-2 shadow-sm backdrop-blur-md"
      >
        <a
          href="#ringkasan"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <Calculator className="size-3.5" aria-hidden="true" />
          Ringkasan
        </a>
        <a
          href="#statistik"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <Calculator className="size-3.5" aria-hidden="true" />
          Detail Statistik
        </a>
        <a
          href="#narasi"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <FileText className="size-3.5" aria-hidden="true" />
          Narasi AI
        </a>
        <a
          href="#visualisasi"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <BarChart3 className="size-3.5" aria-hidden="true" />
          Visualisasi
        </a>
        <a
          href="#contoh-kasus"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <BookOpen className="size-3.5" aria-hidden="true" />
          Contoh Kasus
        </a>
      </nav>

      {/* Fallback Notice Banner (Section L & N) */}
      {isFallback && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-sm">Pemberitahuan Interpretasi Fallback</p>
            <p>AI eksternal tidak tersedia. Sistem menggunakan interpretasi statistik fallback.</p>
          </div>
        </div>
      )}

      {/* 1. Ringkasan Statistik Utama */}
      <section id="ringkasan" aria-labelledby="ringkasan-heading" className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 id="ringkasan-heading" className="font-serif text-xl font-semibold text-ink">
            Statistik Utama
          </h2>
          <p className="text-xs text-muted-foreground">
            Indikator statistik kunci hasil perhitungan {hasil.jenisUji}.
          </p>
        </div>
        <ResultSummary nilai={hasil.nilai.slice(0, 4)} />
      </section>

      {/* 2. Detail Angka Statistik Lengkap */}
      <section id="statistik" aria-labelledby="statistik-heading" className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 id="statistik-heading" className="font-serif text-xl font-semibold text-ink">
            Detail Angka Statistik
          </h2>
          <p className="text-xs text-muted-foreground">
            Parameter numerik lengkap dari engine statistik komputasional.
          </p>
        </div>
        <StatisticsGrid nilai={hasil.nilai} />
      </section>

      {/* 3. Narasi Interpretasi AI (FR11 & FR12) */}
      <section id="narasi" aria-labelledby="narasi-heading" className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 id="narasi-heading" className="font-serif text-xl font-semibold text-ink">
            Narasi Interpretasi Kontekstual
          </h2>
          <p className="text-xs text-muted-foreground">
            Penjelasan naratif bahasa manusia yang menerjemahkan angka-angka statistik menjadi
            wawasan bermakna.
          </p>
        </div>
        <NarrativeCard narasi={hasil.narasi} />
      </section>

      {/* 4. Visualisasi Otomatis (FR13) */}
      <section id="visualisasi" aria-labelledby="visualisasi-heading" className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 id="visualisasi-heading" className="font-serif text-xl font-semibold text-ink">
            Visualisasi Grafik Otomatis
          </h2>
          <p className="text-xs text-muted-foreground">
            Grafik data aktual yang secara otomatis disesuaikan dengan metodologi {hasil.jenisUji}.
          </p>
        </div>
        <VisualizationPanel visualisasi={hasil.visualisasi} />
      </section>

      {/* 5. Contoh Kasus & Analogi Nyata (FR14) */}
      <section id="contoh-kasus" aria-labelledby="contoh-kasus-heading" className="space-y-3">
        <div className="border-b border-border pb-2">
          <h2 id="contoh-kasus-heading" className="font-serif text-xl font-semibold text-ink">
            Contoh Kasus & Analogi Nyata
          </h2>
          <p className="text-xs text-muted-foreground">
            Ilustrasi penerapan nyata untuk memperjelas pemahaman fenomena data.
          </p>
        </div>
        <ExampleCaseCard contohKasus={hasil.contohKasus} />
      </section>
    </div>
  )
}

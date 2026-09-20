// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HasilQueryView } from '@/components/analysis-result/hasil-query-view'
import type { HasilAnalisis } from '@/lib/types'
import { ToastProvider } from '@/components/ui/toast'

describe('FR15 Single-Page Continuous Presentation Test (Section V & Phase 15)', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const mockHasil: HasilAnalisis = {
    id: '50',
    idAnalisis: 50,
    jenisUji: 'Korelasi',
    judul: 'Korelasi Jam Belajar & Skor Ujian',
    ringkasan: 'Hasil analisis korelasi data mahasiswa.',
    nilai: [
      { label: 'Koefisien Korelasi (r)', nilai: '0,85', keterangan: 'Kuat Positif' },
      { label: 'p-value', nilai: '0,004', keterangan: 'Signifikan' },
      { label: 'Jumlah Sampel (n)', nilai: '50' },
      { label: 'Koefisien Determinasi (R²)', nilai: '0,72' },
    ],
    narasi: {
      bahasa: 'id',
      isiNarasi: 'Terdapat korelasi positif yang signifikan antara jam belajar dan skor ujian mahasiswa.',
      sumberNarasi: 'ai',
      isFallback: false,
    },
    visualisasi: {
      jenisGrafik: 'scatter',
      dataGrafik: {
        kind: 'scatter',
        points: [
          { x: 2, y: 55 },
          { x: 4, y: 70 },
          { x: 6, y: 85 },
        ],
      },
      labelX: 'Jam Belajar',
      labelY: 'Skor Ujian',
    },
    contohKasus: {
      bahasa: 'id',
      deskripsiKasus: 'Mahasiswa yang menambah 2 jam belajar cenderung memperoleh kenaikan skor 15 poin.',
    },
  }

  function renderView() {
    return render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <HasilQueryView initialData={mockHasil} id="50" />
        </ToastProvider>
      </QueryClientProvider>,
    )
  }

  it('FR15: Renders all 4 key outputs simultaneously in the DOM tree without tab selection', () => {
    renderView()

    // 1. Output 1: Angka Statistik (Utama & Detail) must be present and visible
    const rStatEls = screen.getAllByText('Koefisien Korelasi (r)')
    expect(rStatEls.length).toBeGreaterThanOrEqual(1)
    expect(rStatEls[0]?.closest('[hidden]')).toBeNull()

    // 2. Output 2: Narasi Interpretasi AI must be visible simultaneously
    const narasiEl = screen.getByText(/Terdapat korelasi positif yang signifikan/i)
    expect(narasiEl).toBeDefined()
    expect(narasiEl.closest('[hidden]')).toBeNull()

    // 3. Output 3: Visualisasi Grafik Otomatis must be visible simultaneously
    const chartFigure = screen.getByRole('figure')
    expect(chartFigure).toBeDefined()
    expect(chartFigure.closest('[hidden]')).toBeNull()

    // 4. Output 4: Contoh Kasus / Analogi Nyata must be visible simultaneously
    const contohKasusEl = screen.getByText(/Mahasiswa yang menambah 2 jam belajar/i)
    expect(contohKasusEl).toBeDefined()
    expect(contohKasusEl.closest('[hidden]')).toBeNull()
  })

  it('FR15: Does not contain tabs or tablist hiding mandatory sections; all sections accessible on one page', () => {
    const { container } = renderView()

    // Verify NO tablist or tab hiding mandatory sections
    const tablists = container.querySelectorAll('[role="tablist"]')
    expect(tablists.length).toBe(0)

    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs.length).toBe(0)

    // Verify headings for all 4 required FR15 sections plus summary are present
    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent?.trim())

    expect(headingTexts).toContain('Statistik Utama')
    expect(headingTexts).toContain('Detail Angka Statistik')
    expect(headingTexts).toContain('Narasi Interpretasi Kontekstual')
    expect(headingTexts).toContain('Visualisasi Grafik Otomatis')
    expect(headingTexts).toContain('Contoh Kasus & Analogi Nyata')

    // Anchor navigation exists for in-page navigation without tab state hiding
    const nav = screen.getByRole('navigation', { name: /Navigasi bagian hasil analisis/i })
    expect(nav).toBeDefined()
  })
})

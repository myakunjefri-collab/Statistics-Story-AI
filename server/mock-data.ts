/**
 * @deprecated HISTORICAL / LEGACY BASELINE — Auxiliary Tooling Mock Data (Vite Dev/Preview Server Only)
 * NOT FOR PRODUCTION USE. Production uses PostgreSQL adapter (src/lib/storage/postgres-adapter.ts).
 */
import type { Analisis, AnalisisBaru, HasilAnalisis } from '../src/lib/types'

export const seedAnalyses: Analisis[] = [
  {
    id: 'an-001',
    nama: 'Korelasi Waktu Belajar & Nilai',
    jenisAnalisis: 'Korelasi',
    tanggal: '2026-09-12',
    status: 'Selesai',
  },
  {
    id: 'an-002',
    nama: 'Regresi Pengeluaran Bulanan',
    jenisAnalisis: 'Regresi',
    tanggal: '2026-09-10',
    status: 'Selesai',
  },
  {
    id: 'an-003',
    nama: 'Statistik Deskriptif Tinggi Badan',
    jenisAnalisis: 'Deskriptif',
    tanggal: '2026-09-08',
    status: 'Selesai',
  },
  {
    id: 'an-004',
    nama: 'Uji t Nilai Sebelum & Sesudah',
    jenisAnalisis: 'Uji t',
    tanggal: '2026-09-05',
    status: 'Diproses',
  },
  {
    id: 'an-005',
    nama: 'Korelasi Jam Tidur & Fokus',
    jenisAnalisis: 'Korelasi',
    tanggal: '2026-09-02',
    status: 'Draf',
  },
]

let mockAnalysesState: Analisis[] = [...seedAnalyses]

export function getMockAnalyses(): Analisis[] {
  return [...mockAnalysesState]
}

export function addMockAnalysis(values: AnalisisBaru): Analisis {
  const newItem: Analisis = {
    id: `an-${Date.now()}`,
    tanggal: new Date().toISOString().slice(0, 10),
    ...values,
  }
  mockAnalysesState = [newItem, ...mockAnalysesState]
  return newItem
}

export function updateMockAnalysis(id: string, values: AnalisisBaru): Analisis | null {
  const index = mockAnalysesState.findIndex((a) => a.id === id)
  if (index === -1) return null

  const existing = mockAnalysesState[index]
  if (!existing) return null

  const updated: Analisis = {
    ...existing,
    ...values,
  }
  mockAnalysesState[index] = updated
  return updated
}

export function deleteMockAnalysis(id: string): boolean {
  const initialLength = mockAnalysesState.length
  mockAnalysesState = mockAnalysesState.filter((a) => a.id !== id)
  return mockAnalysesState.length < initialLength
}

export function getMockHasil(id?: string): HasilAnalisis {
  const analysis = id ? mockAnalysesState.find((a) => a.id === id) : mockAnalysesState[0]
  const jenis = analysis?.jenisAnalisis || 'Korelasi'
  const judul = analysis ? `Hasil: ${analysis.nama}` : 'Hasil Analisis Statistik'

  return {
    id: id || 'an-001',
    idAnalisis: 1,
    jenisUji: jenis,
    judul,
    ringkasan: `Hasil kalkulasi statistik ${jenis} untuk dataset ${analysis?.nama || 'sampel'}.`,
    nilai: [
      {
        label: 'Koefisien Korelasi (r)',
        nilai: '0,87',
        keterangan: 'Korelasi positif sangat kuat',
      },
      { label: 'p-value', nilai: '0,001', keterangan: 'Signifikan (p < 0,05)' },
      { label: 'Koefisien Determinasi (R²)', nilai: '0,76' },
      { label: 'Jumlah Sampel (n)', nilai: '30' },
    ],
    narasi: {
      bahasa: 'id',
      isiNarasi:
        'Terdapat hubungan positif yang kuat dan signifikan secara statistik antara variabel yang diuji.',
      sumberNarasi: 'ai',
      isFallback: false,
    },
    visualisasi: {
      jenisGrafik: 'scatter',
      dataGrafik: {
        kind: 'scatter',
        points: [
          { x: 10, y: 25 },
          { x: 20, y: 45 },
          { x: 30, y: 65 },
          { x: 40, y: 85 },
        ],
      },
      labelX: 'Variabel X',
      labelY: 'Variabel Y',
    },
    contohKasus: {
      bahasa: 'id',
      deskripsiKasus:
        'Contoh: Setiap peningkatan 10 jam belajar rata-rata menaikkan nilai ujian sebesar 20 poin.',
    },
  }
}

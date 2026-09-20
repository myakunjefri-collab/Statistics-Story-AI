// Domain model for Statistics Story AI — aligned with the SKPL/SRS entities.

import type {
  BarData,
  BarGroup,
  CanonicalVisualization,
  ContohKasus,
  HasilAnalisis,
  HasilResponse,
  HistogramBin,
  HistogramData,
  Narasi,
  NilaiStatistik,
  ScatterData,
  ScatterPoint,
  ScatterTrendline,
  VisualizationData,
} from './validation'

export type JenisAnalisis = 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'

export type StatusAnalisis = 'Selesai' | 'Diproses' | 'Draf'

export type FilterJenis = 'Semua' | JenisAnalisis

export interface Analisis {
  id: string
  nama: string
  jenisAnalisis: JenisAnalisis
  tanggal: string // ISO date string
  status: StatusAnalisis
}

// Payload used when creating a new analysis (no id/tanggal yet).
export type AnalisisBaru = Pick<Analisis, 'nama' | 'jenisAnalisis' | 'status'>

export type {
  BarData,
  BarGroup,
  CanonicalVisualization,
  ContohKasus,
  HasilAnalisis,
  HasilResponse,
  HistogramBin,
  HistogramData,
  Narasi,
  NilaiStatistik,
  ScatterData,
  ScatterPoint,
  ScatterTrendline,
  VisualizationData,
}

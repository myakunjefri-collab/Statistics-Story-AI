// Database Adapter Interface & Entity Definitions conforming to SKPL PDM (7 Entities)
import type { StatisticalResult } from '@/lib/statistics/types'

export type PersistedStatisticalResult = StatisticalResult

export interface PenggunaEntity {
  id_pengguna: number
  nama: string
  email: string
  password_hash: string
  peran: 'mahasiswa' | 'dosen'
  created_at: Date | string
}

export interface AnalisisEntity {
  id_analisis: number
  id_pengguna: number
  jenis_analisis: 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'
  nama_analisis: string
  tanggal: Date | string // TIMESTAMP WITH TIME ZONE
  status: 'Selesai' | 'Diproses' | 'Draf'
  created_at: Date | string
}

export interface DatasetInputEntity {
  id_dataset: number
  id_analisis: number
  nama_file: string | null
  format_data: 'csv' | 'xlsx' | 'manual'
  data_konten: unknown // [IMPLEMENTATION EXTENSION: JSONB raw/normalized data]
  sumber_input: string
  created_at: Date | string
}

export interface HasilStatistikEntity {
  id_hasil: number
  id_analisis: number
  jenis_uji: string
  nilai_statistik: PersistedStatisticalResult | Record<string, unknown>
  p_value: number | null
  created_at: Date | string
}

export interface NarasiInterpretasiEntity {
  id_narasi: number
  id_hasil: number
  bahasa: string
  isi_narasi: string
  sumber_narasi: 'ai' | 'fallback' // [IMPLEMENTATION EXTENSION]
  tanggal_generate: Date | string
}

export interface VisualisasiEntity {
  id_visual: number
  id_hasil: number
  jenis_grafik: 'bar' | 'histogram' | 'scatter' | 'regression'
  data_grafik: Record<string, unknown>
  created_at: Date | string
}

export interface ContohKasusEntity {
  id_kasus: number
  id_hasil: number
  deskripsi_kasus: string
  bahasa: string
  created_at: Date | string
}

export interface CompleteAnalysisRecord {
  analisis: AnalisisEntity
  dataset?: DatasetInputEntity | null
  hasil?: HasilStatistikEntity | null
  narasi?: NarasiInterpretasiEntity | null
  visualisasi?: VisualisasiEntity | null
  contohKasus?: ContohKasusEntity | null
}

export interface CreateAnalysisTransactionPayload {
  analisis: Omit<AnalisisEntity, 'id_analisis' | 'created_at'>
  dataset: Omit<DatasetInputEntity, 'id_dataset' | 'id_analisis' | 'created_at'>
  hasil: Omit<HasilStatistikEntity, 'id_hasil' | 'id_analisis' | 'created_at'>
  narasi: Omit<NarasiInterpretasiEntity, 'id_narasi' | 'id_hasil' | 'tanggal_generate'>
  visualisasi: Omit<VisualisasiEntity, 'id_visual' | 'id_hasil' | 'created_at'>
  contohKasus: Omit<ContohKasusEntity, 'id_kasus' | 'id_hasil' | 'created_at'>
}

export interface IDatabaseAdapter {
  isAvailable(): Promise<boolean>

  // User management
  findUserByEmail(email: string): Promise<PenggunaEntity | null>
  findUserById(id: number): Promise<PenggunaEntity | null>
  createUser(user: Omit<PenggunaEntity, 'id_pengguna' | 'created_at'>): Promise<PenggunaEntity>

  // Analysis management (Strictly User-Scoped)
  getAnalysesByUser(userId: number): Promise<AnalisisEntity[]>
  getCompleteAnalysisById(
    analysisId: number,
    userId: number,
  ): Promise<CompleteAnalysisRecord | null>
  deleteAnalysis(analysisId: number, userId: number): Promise<boolean>
  createDraftAnalysis(
    data: {
      nama: string
      jenisAnalisis: AnalisisEntity['jenis_analisis']
      status?: AnalisisEntity['status']
    },
    userId: number,
  ): Promise<AnalisisEntity>
  updateAnalysis(
    analysisId: number,
    data: { nama?: string; status?: AnalisisEntity['status'] },
    userId: number,
  ): Promise<AnalisisEntity | null>

  // Atomic database transaction executed post-AI computation
  saveCompleteAnalysisAtomic(
    payload: CreateAnalysisTransactionPayload,
    userId: number,
  ): Promise<CompleteAnalysisRecord>
}

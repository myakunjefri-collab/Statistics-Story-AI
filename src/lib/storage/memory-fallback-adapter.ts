import type {
  AnalisisEntity,
  CompleteAnalysisRecord,
  ContohKasusEntity,
  CreateAnalysisTransactionPayload,
  DatasetInputEntity,
  HasilStatistikEntity,
  IDatabaseAdapter,
  NarasiInterpretasiEntity,
  PenggunaEntity,
  VisualisasiEntity,
} from './database-adapter'

/**
 * Memory Fallback Database Adapter
 * STRICTLY FOR LOCAL DEVELOPMENT AND AUTOMATED TESTING ONLY.
 * In production mode, this adapter strictly throws a fatal error (Fail-Fast Policy).
 */
export class MemoryFallbackDatabaseAdapter implements IDatabaseAdapter {
  private users: Map<number, PenggunaEntity> = new Map()
  private analyses: Map<number, AnalisisEntity> = new Map()
  private datasets: Map<number, DatasetInputEntity> = new Map()
  private results: Map<number, HasilStatistikEntity> = new Map()
  private narratives: Map<number, NarasiInterpretasiEntity> = new Map()
  private visuals: Map<number, VisualisasiEntity> = new Map()
  private cases: Map<number, ContohKasusEntity> = new Map()

  private nextUserId = 1
  private nextAnalysisId = 1
  private nextDatasetId = 1
  private nextResultId = 1
  private nextNarasiId = 1
  private nextVisualId = 1
  private nextKasusId = 1

  constructor() {
    if (process.env.NODE_ENV === 'production' && process.env.TEST_MODE !== 'true') {
      throw new Error(
        'FATAL: MemoryFallbackDatabaseAdapter is strictly forbidden in production environment. A valid PostgreSQL DATABASE_URL is required.',
      )
    }
  }

  async isAvailable(): Promise<boolean> {
    return true
  }

  async findUserByEmail(email: string): Promise<PenggunaEntity | null> {
    const normalized = email.toLowerCase().trim()
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user
      }
    }
    return null
  }

  async findUserById(id: number): Promise<PenggunaEntity | null> {
    return this.users.get(id) ?? null
  }

  async createUser(
    user: Omit<PenggunaEntity, 'id_pengguna' | 'created_at'>,
  ): Promise<PenggunaEntity> {
    const id = this.nextUserId++
    const record: PenggunaEntity = {
      id_pengguna: id,
      nama: user.nama,
      email: user.email.toLowerCase().trim(),
      password_hash: user.password_hash,
      peran: user.peran || 'mahasiswa',
      created_at: new Date(),
    }
    this.users.set(id, record)
    return record
  }

  async getAnalysesByUser(userId: number): Promise<AnalisisEntity[]> {
    const list: AnalisisEntity[] = []
    for (const a of this.analyses.values()) {
      if (a.id_pengguna === userId) {
        list.push(a)
      }
    }
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
  }

  async getCompleteAnalysisById(
    analysisId: number,
    userId: number,
  ): Promise<CompleteAnalysisRecord | null> {
    const analisis = this.analyses.get(analysisId)
    if (!analisis || analisis.id_pengguna !== userId) {
      return null
    }

    let dataset: DatasetInputEntity | undefined
    for (const d of this.datasets.values()) {
      if (d.id_analisis === analysisId) {
        dataset = d
        break
      }
    }

    let hasil: HasilStatistikEntity | undefined
    for (const h of this.results.values()) {
      if (h.id_analisis === analysisId) {
        hasil = h
        break
      }
    }

    let narasi: NarasiInterpretasiEntity | undefined
    let visualisasi: VisualisasiEntity | undefined
    let contohKasus: ContohKasusEntity | undefined

    if (hasil) {
      for (const n of this.narratives.values()) {
        if (n.id_hasil === hasil.id_hasil) {
          narasi = n
          break
        }
      }

      for (const v of this.visuals.values()) {
        if (v.id_hasil === hasil.id_hasil) {
          visualisasi = v
          break
        }
      }

      for (const k of this.cases.values()) {
        if (k.id_hasil === hasil.id_hasil) {
          contohKasus = k
          break
        }
      }
    }

    return {
      analisis,
      dataset: dataset ?? null,
      hasil: hasil ?? null,
      narasi: narasi ?? null,
      visualisasi: visualisasi ?? null,
      contohKasus: contohKasus ?? null,
    }
  }

  async deleteAnalysis(analysisId: number, userId: number): Promise<boolean> {
    const analisis = this.analyses.get(analysisId)
    if (!analisis || analisis.id_pengguna !== userId) {
      return false
    }
    this.analyses.delete(analysisId)
    return true
  }

  async createDraftAnalysis(
    data: {
      nama: string
      jenisAnalisis: AnalisisEntity['jenis_analisis']
      status?: AnalisisEntity['status']
    },
    userId: number,
  ): Promise<AnalisisEntity> {
    const id = this.nextAnalysisId++
    const entity: AnalisisEntity = {
      id_analisis: id,
      id_pengguna: userId,
      jenis_analisis: data.jenisAnalisis,
      nama_analisis: data.nama,
      tanggal: new Date(),
      status: data.status || 'Draf',
      created_at: new Date(),
    }
    this.analyses.set(id, entity)
    return entity
  }

  async updateAnalysis(
    analysisId: number,
    data: { nama?: string; status?: AnalisisEntity['status'] },
    userId: number,
  ): Promise<AnalisisEntity | null> {
    const existing = this.analyses.get(analysisId)
    if (!existing || existing.id_pengguna !== userId) return null

    const updated: AnalisisEntity = {
      ...existing,
      nama_analisis: data.nama ?? existing.nama_analisis,
      status: data.status ?? existing.status,
    }
    this.analyses.set(analysisId, updated)
    return updated
  }

  async saveCompleteAnalysisAtomic(
    payload: CreateAnalysisTransactionPayload,
    userId: number,
  ): Promise<CompleteAnalysisRecord> {
    const idAnalisis = this.nextAnalysisId++
    const analisis: AnalisisEntity = {
      id_analisis: idAnalisis,
      id_pengguna: userId,
      jenis_analisis: payload.analisis.jenis_analisis,
      nama_analisis: payload.analisis.nama_analisis,
      tanggal: payload.analisis.tanggal ? new Date(payload.analisis.tanggal) : new Date(),
      status: payload.analisis.status || 'Selesai',
      created_at: new Date(),
    }
    this.analyses.set(idAnalisis, analisis)

    const idDataset = this.nextDatasetId++
    const dataset: DatasetInputEntity = {
      id_dataset: idDataset,
      id_analisis: idAnalisis,
      nama_file: payload.dataset.nama_file,
      format_data: payload.dataset.format_data,
      data_konten: payload.dataset.data_konten,
      sumber_input: payload.dataset.sumber_input || 'web_form',
      created_at: new Date(),
    }
    this.datasets.set(idDataset, dataset)

    const idHasil = this.nextResultId++
    const hasil: HasilStatistikEntity = {
      id_hasil: idHasil,
      id_analisis: idAnalisis,
      jenis_uji: payload.hasil.jenis_uji,
      nilai_statistik: payload.hasil.nilai_statistik,
      p_value: payload.hasil.p_value,
      created_at: new Date(),
    }
    this.results.set(idHasil, hasil)

    const idNarasi = this.nextNarasiId++
    const narasi: NarasiInterpretasiEntity = {
      id_narasi: idNarasi,
      id_hasil: idHasil,
      bahasa: payload.narasi.bahasa || 'id',
      isi_narasi: payload.narasi.isi_narasi,
      sumber_narasi: payload.narasi.sumber_narasi || 'ai',
      tanggal_generate: new Date(),
    }
    this.narratives.set(idNarasi, narasi)

    const idVisual = this.nextVisualId++
    const visualisasi: VisualisasiEntity = {
      id_visual: idVisual,
      id_hasil: idHasil,
      jenis_grafik: payload.visualisasi.jenis_grafik,
      data_grafik: payload.visualisasi.data_grafik,
      created_at: new Date(),
    }
    this.visuals.set(idVisual, visualisasi)

    const idKasus = this.nextKasusId++
    const contohKasus: ContohKasusEntity = {
      id_kasus: idKasus,
      id_hasil: idHasil,
      deskripsi_kasus: payload.contohKasus.deskripsi_kasus,
      bahasa: payload.contohKasus.bahasa || 'id',
      created_at: new Date(),
    }
    this.cases.set(idKasus, contohKasus)

    return {
      analisis,
      dataset,
      hasil,
      narasi,
      visualisasi,
      contohKasus,
    }
  }
}

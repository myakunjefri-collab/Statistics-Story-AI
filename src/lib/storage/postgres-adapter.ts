import pg from 'pg'
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

const { Pool } = pg

export class PostgresAdapter implements IDatabaseAdapter {
  private pool: pg.Pool

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl:
        connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
          ? { rejectUnauthorized: false }
          : undefined,
    })
  }

  async isAvailable(): Promise<boolean> {
    try {
      const client = await this.pool.connect()
      await client.query('SELECT 1')
      client.release()
      return true
    } catch {
      return false
    }
  }

  async findUserByEmail(email: string): Promise<PenggunaEntity | null> {
    const res = await this.pool.query<PenggunaEntity>(
      'SELECT id_pengguna, nama, email, password_hash, peran, created_at FROM pengguna WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()],
    )
    return res.rows[0] ?? null
  }

  async findUserById(id: number): Promise<PenggunaEntity | null> {
    const res = await this.pool.query<PenggunaEntity>(
      'SELECT id_pengguna, nama, email, password_hash, peran, created_at FROM pengguna WHERE id_pengguna = $1 LIMIT 1',
      [id],
    )
    return res.rows[0] ?? null
  }

  async createUser(
    user: Omit<PenggunaEntity, 'id_pengguna' | 'created_at'>,
  ): Promise<PenggunaEntity> {
    const res = await this.pool.query<PenggunaEntity>(
      `INSERT INTO pengguna (nama, email, password_hash, peran)
       VALUES ($1, $2, $3, $4)
       RETURNING id_pengguna, nama, email, password_hash, peran, created_at`,
      [user.nama, user.email.toLowerCase().trim(), user.password_hash, user.peran || 'mahasiswa'],
    )
    const created = res.rows[0]
    if (!created) throw new Error('Gagal membuat user baru pada PostgreSQL.')
    return created
  }

  async getAnalysesByUser(userId: number): Promise<AnalisisEntity[]> {
    const res = await this.pool.query<AnalisisEntity>(
      `SELECT id_analisis, id_pengguna, jenis_analisis, nama_analisis, tanggal, status, created_at
       FROM analisis
       WHERE id_pengguna = $1
       ORDER BY tanggal DESC`,
      [userId],
    )
    return res.rows
  }

  async getCompleteAnalysisById(
    analysisId: number,
    userId: number,
  ): Promise<CompleteAnalysisRecord | null> {
    // 1. Verify ownership strictly
    const analysisRes = await this.pool.query<AnalisisEntity>(
      `SELECT id_analisis, id_pengguna, jenis_analisis, nama_analisis, tanggal, status, created_at
       FROM analisis
       WHERE id_analisis = $1 AND id_pengguna = $2 LIMIT 1`,
      [analysisId, userId],
    )
    const analisis = analysisRes.rows[0]
    if (!analisis) return null

    // 2. Fetch children
    const datasetRes = await this.pool.query<DatasetInputEntity>(
      'SELECT * FROM dataset_input WHERE id_analisis = $1 LIMIT 1',
      [analysisId],
    )
    const hasilRes = await this.pool.query<HasilStatistikEntity>(
      'SELECT * FROM hasil_statistik WHERE id_analisis = $1 LIMIT 1',
      [analysisId],
    )

    const dataset = datasetRes.rows[0] ?? null
    const hasil = hasilRes.rows[0] ?? null

    let narasi: NarasiInterpretasiEntity | null = null
    let visualisasi: VisualisasiEntity | null = null
    let contohKasus: ContohKasusEntity | null = null

    if (hasil) {
      const narasiRes = await this.pool.query<NarasiInterpretasiEntity>(
        'SELECT * FROM narasi_interpretasi WHERE id_hasil = $1 LIMIT 1',
        [hasil.id_hasil],
      )
      const visualRes = await this.pool.query<VisualisasiEntity>(
        'SELECT * FROM visualisasi WHERE id_hasil = $1 LIMIT 1',
        [hasil.id_hasil],
      )
      const kasusRes = await this.pool.query<ContohKasusEntity>(
        'SELECT * FROM contoh_kasus WHERE id_hasil = $1 LIMIT 1',
        [hasil.id_hasil],
      )
      narasi = narasiRes.rows[0] ?? null
      visualisasi = visualRes.rows[0] ?? null
      contohKasus = kasusRes.rows[0] ?? null
    }

    return {
      analisis,
      dataset,
      hasil,
      narasi,
      visualisasi,
      contohKasus,
    }
  }

  async deleteAnalysis(analysisId: number, userId: number): Promise<boolean> {
    const res = await this.pool.query(
      'DELETE FROM analisis WHERE id_analisis = $1 AND id_pengguna = $2',
      [analysisId, userId],
    )
    return (res.rowCount ?? 0) > 0
  }

  async createDraftAnalysis(
    data: {
      nama: string
      jenisAnalisis: AnalisisEntity['jenis_analisis']
      status?: AnalisisEntity['status']
    },
    userId: number,
  ): Promise<AnalisisEntity> {
    const res = await this.pool.query<AnalisisEntity>(
      `INSERT INTO analisis (id_pengguna, jenis_analisis, nama_analisis, tanggal, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
       RETURNING id_analisis, id_pengguna, jenis_analisis, nama_analisis, tanggal, status, created_at`,
      [userId, data.jenisAnalisis, data.nama, data.status || 'Draf'],
    )
    const row = res.rows[0]
    if (!row) throw new Error('Gagal membuat draf analisis.')
    return row
  }

  async updateAnalysis(
    analysisId: number,
    data: { nama?: string; status?: AnalisisEntity['status'] },
    userId: number,
  ): Promise<AnalisisEntity | null> {
    const existing = await this.pool.query<AnalisisEntity>(
      'SELECT * FROM analisis WHERE id_analisis = $1 AND id_pengguna = $2 LIMIT 1',
      [analysisId, userId],
    )
    if (!existing.rows[0]) return null

    const nama = data.nama ?? existing.rows[0].nama_analisis
    const status = data.status ?? existing.rows[0].status

    const res = await this.pool.query<AnalisisEntity>(
      `UPDATE analisis SET nama_analisis = $1, status = $2 WHERE id_analisis = $3 AND id_pengguna = $4
       RETURNING id_analisis, id_pengguna, jenis_analisis, nama_analisis, tanggal, status, created_at`,
      [nama, status, analysisId, userId],
    )
    return res.rows[0] ?? null
  }

  async saveCompleteAnalysisAtomic(
    payload: CreateAnalysisTransactionPayload,
    userId: number,
  ): Promise<CompleteAnalysisRecord> {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      // Step 1: Insert Analisis (Parent)
      const analisisRes = await client.query<AnalisisEntity>(
        `INSERT INTO analisis (id_pengguna, jenis_analisis, nama_analisis, tanggal, status)
         VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP), $5)
         RETURNING id_analisis, id_pengguna, jenis_analisis, nama_analisis, tanggal, status, created_at`,
        [
          userId,
          payload.analisis.jenis_analisis,
          payload.analisis.nama_analisis,
          payload.analisis.tanggal,
          payload.analisis.status || 'Selesai',
        ],
      )
      const analisis = analisisRes.rows[0]
      if (!analisis) throw new Error('Gagal menyimpan entitas analisis.')
      const idAnalisis = analisis.id_analisis

      // Step 2: Insert Dataset Input
      const datasetRes = await client.query<DatasetInputEntity>(
        `INSERT INTO dataset_input (id_analisis, nama_file, format_data, data_konten, sumber_input)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          idAnalisis,
          payload.dataset.nama_file,
          payload.dataset.format_data,
          JSON.stringify(payload.dataset.data_konten),
          payload.dataset.sumber_input || 'web_form',
        ],
      )
      const dataset = datasetRes.rows[0]
      if (!dataset) throw new Error('Gagal menyimpan dataset input.')

      // Step 3: Insert Hasil Statistik
      const hasilRes = await client.query<HasilStatistikEntity>(
        `INSERT INTO hasil_statistik (id_analisis, jenis_uji, nilai_statistik, p_value)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          idAnalisis,
          payload.hasil.jenis_uji,
          JSON.stringify(payload.hasil.nilai_statistik),
          payload.hasil.p_value,
        ],
      )
      const hasil = hasilRes.rows[0]
      if (!hasil) throw new Error('Gagal menyimpan hasil statistik.')
      const idHasil = hasil.id_hasil

      // Step 4: Insert Narasi Interpretasi
      const narasiRes = await client.query<NarasiInterpretasiEntity>(
        `INSERT INTO narasi_interpretasi (id_hasil, bahasa, isi_narasi, sumber_narasi)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          idHasil,
          payload.narasi.bahasa || 'id',
          payload.narasi.isi_narasi,
          payload.narasi.sumber_narasi || 'ai',
        ],
      )
      const narasi = narasiRes.rows[0]
      if (!narasi) throw new Error('Gagal menyimpan narasi interpretasi.')

      // Step 5: Insert Visualisasi
      const visualRes = await client.query<VisualisasiEntity>(
        `INSERT INTO visualisasi (id_hasil, jenis_grafik, data_grafik)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [
          idHasil,
          payload.visualisasi.jenis_grafik,
          JSON.stringify(payload.visualisasi.data_grafik),
        ],
      )
      const visualisasi = visualRes.rows[0]
      if (!visualisasi) throw new Error('Gagal menyimpan metadata visualisasi.')

      // Step 6: Insert Contoh Kasus
      const kasusRes = await client.query<ContohKasusEntity>(
        `INSERT INTO contoh_kasus (id_hasil, deskripsi_kasus, bahasa)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [idHasil, payload.contohKasus.deskripsi_kasus, payload.contohKasus.bahasa || 'id'],
      )
      const contohKasus = kasusRes.rows[0]
      if (!contohKasus) throw new Error('Gagal menyimpan contoh kasus.')

      await client.query('COMMIT')

      return {
        analisis,
        dataset,
        hasil,
        narasi,
        visualisasi,
        contohKasus,
      }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

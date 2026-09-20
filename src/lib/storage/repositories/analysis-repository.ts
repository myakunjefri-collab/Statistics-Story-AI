import {
  type AnalisisEntity,
  type CompleteAnalysisRecord,
  type CreateAnalysisTransactionPayload,
  getDatabaseAdapter,
} from '../index'

export const AnalysisRepository = {
  async getByUser(userId: number): Promise<AnalisisEntity[]> {
    const adapter = getDatabaseAdapter()
    return adapter.getAnalysesByUser(userId)
  },

  async getCompleteById(
    analysisId: number,
    userId: number,
  ): Promise<CompleteAnalysisRecord | null> {
    const adapter = getDatabaseAdapter()
    return adapter.getCompleteAnalysisById(analysisId, userId)
  },

  async delete(analysisId: number, userId: number): Promise<boolean> {
    const adapter = getDatabaseAdapter()
    return adapter.deleteAnalysis(analysisId, userId)
  },

  async createDraft(
    data: {
      nama: string
      jenisAnalisis: AnalisisEntity['jenis_analisis']
      status?: AnalisisEntity['status']
    },
    userId: number,
  ): Promise<AnalisisEntity> {
    const adapter = getDatabaseAdapter()
    return adapter.createDraftAnalysis(data, userId)
  },

  async update(
    analysisId: number,
    data: { nama?: string; status?: AnalisisEntity['status'] },
    userId: number,
  ): Promise<AnalisisEntity | null> {
    const adapter = getDatabaseAdapter()
    return adapter.updateAnalysis(analysisId, data, userId)
  },

  async saveAtomic(
    payload: CreateAnalysisTransactionPayload,
    userId: number,
  ): Promise<CompleteAnalysisRecord> {
    const adapter = getDatabaseAdapter()
    return adapter.saveCompleteAnalysisAtomic(payload, userId)
  },
}

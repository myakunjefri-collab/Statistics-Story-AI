import type { StatisticalResult } from '../statistics/types'
import type { AIInterpretationOutput } from './schemas'

export interface AIProviderGenerateOptions {
  analysisType: 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'
  statisticalResult: StatisticalResult
  datasetSummary?: {
    rowCount: number
    columnCount: number
    variables: string[]
  }
  language?: 'id' | 'en'
}

export interface AIProvider {
  readonly name: string
  generateInterpretation(options: AIProviderGenerateOptions): Promise<AIInterpretationOutput>
}

export interface ParsedColumn {
  name: string
  values: (number | null)[]
  isNumeric: boolean
  totalRows: number
  validNumericCount: number
  missingCount: number
}

export interface NormalizedDataset {
  fileName?: string
  format: 'csv' | 'xlsx' | 'manual'
  headers: string[]
  rawRows: (string | number | null)[][]
  columns: ParsedColumn[]
  rowCount: number
  columnCount: number
}

export interface LayerAValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  dataset?: NormalizedDataset
}

export interface ExtractedDescriptiveData {
  kind: 'descriptive'
  numericVector: number[]
}

export interface ExtractedTTestData {
  kind: 't-test'
  group1: { name: string; values: number[] }
  group2: { name: string; values: number[] }
}

export interface ExtractedBivariateData {
  kind: 'bivariate'
  x: number[]
  y: number[]
}

export type ExtractedAnalysisData =
  | ExtractedDescriptiveData
  | ExtractedTTestData
  | ExtractedBivariateData

export interface ExtractedDataShape {
  kind?: 'descriptive' | 't-test' | 'bivariate'
  numericVector?: number[]
  group1?: { name: string; values: number[] }
  group2?: { name: string; values: number[] }
  x?: number[]
  y?: number[]
}

export interface LayerBValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  extractedData?: ExtractedDataShape
}

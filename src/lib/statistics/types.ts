// Branded types conforming to Bab 5 & Section Z
export type UserId = number & { readonly __brand: unique symbol }
export type AnalysisId = number & { readonly __brand: unique symbol }
export type DatasetId = number & { readonly __brand: unique symbol }
export type ResultId = number & { readonly __brand: unique symbol }

export type AnalysisType = 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'

export interface DescriptiveResult {
  jenisUji: 'Deskriptif'
  n: number
  mean: number
  median: number
  mode: number[] | null // Array of modes or null if all unique
  modeDescription: string
  sampleStandardDeviation: number // Bessel's correction (n - 1)
  populationStandardDeviation: number // (n)
  variance: number
  minimum: number
  maximum: number
  range: number
  q1: number // 25th percentile (linear interpolation)
  q3: number // 75th percentile (linear interpolation)
  iqr: number // q3 - q1
}

export interface TTestResult {
  jenisUji: 'Uji t'
  testMethod:
    | "Welch's Two-Sample t-Test (Unequal Variance)"
    | "Student's Two-Sample t-Test (Equal Variance)"
  isTwoTailed: true
  group1: {
    name: string
    n: number
    mean: number
    standardDeviation: number
    variance: number
  }
  group2: {
    name: string
    n: number
    mean: number
    standardDeviation: number
    variance: number
  }
  tStatistic: number
  degreesOfFreedom: number
  pValue: number
  meanDifference: number
  isSignificant: boolean // pValue < 0.05
}

export interface CorrelationResult {
  jenisUji: 'Korelasi'
  method: 'Pearson Product-Moment'
  n: number
  r: number
  tStatistic: number
  degreesOfFreedom: number
  pValue: number
  isSignificant: boolean // pValue < 0.05
  strength: 'Sangat Lemah' | 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat'
  direction: 'Positif' | 'Negatif' | 'Nol'
}

export interface RegressionResult {
  jenisUji: 'Regresi'
  method: 'Simple Linear Regression'
  n: number
  slope: number // a (koefisien arah)
  intercept: number // b (konstanta)
  rSquared: number // R²
  standardError: number
  equation: string // y = a*x + b
  isSignificant: boolean
}

export type StatisticalResult =
  | DescriptiveResult
  | TTestResult
  | CorrelationResult
  | RegressionResult

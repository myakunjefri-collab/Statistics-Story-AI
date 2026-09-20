import { computeTTestPValue } from './math-utils'
import type { TTestResult } from './types'

export interface TTestOptions {
  group1Name?: string
  group2Name?: string
  equalVariance?: boolean
}

/**
 * Computes two-sample independent t-test (FR 08 / TC-07).
 * Default: Two-tailed Welch's t-test (unequal variance assumed as robust standard).
 */
export function calculateTTest(
  group1Data: number[],
  group2Data: number[],
  options: TTestOptions = {},
): TTestResult {
  if (!Array.isArray(group1Data) || group1Data.length < 2) {
    throw new Error('Kelompok 1 harus memiliki minimal 2 sampel data numerik.')
  }
  if (!Array.isArray(group2Data) || group2Data.length < 2) {
    throw new Error('Kelompok 2 harus memiliki minimal 2 sampel data numerik.')
  }

  // Validate finite numbers
  for (const v of group1Data) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Kelompok 1 memuat nilai tidak valid: ${v}`)
    }
  }
  for (const v of group2Data) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Kelompok 2 memuat nilai tidak valid: ${v}`)
    }
  }

  const n1 = group1Data.length
  const n2 = group2Data.length

  const mean1 = group1Data.reduce((acc, v) => acc + v, 0) / n1
  const mean2 = group2Data.reduce((acc, v) => acc + v, 0) / n2

  const sumSqDiff1 = group1Data.reduce((acc, v) => acc + (v - mean1) ** 2, 0)
  const sumSqDiff2 = group2Data.reduce((acc, v) => acc + (v - mean2) ** 2, 0)

  const var1 = sumSqDiff1 / (n1 - 1)
  const var2 = sumSqDiff2 / (n2 - 1)

  const sd1 = Math.sqrt(var1)
  const sd2 = Math.sqrt(var2)

  const equalVariance = options.equalVariance ?? false
  let tStat: number
  let df: number

  if (equalVariance) {
    // Student's t-test (pooled variance)
    const pooledVariance = (sumSqDiff1 + sumSqDiff2) / (n1 + n2 - 2)
    const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2))

    df = n1 + n2 - 2
    if (standardError === 0) {
      throw new Error(
        'Varians kedua kelompok bernilai nol; uji-t tidak terdefinisi karena tidak ada variabilitas data.',
      )
    } else {
      tStat = (mean1 - mean2) / standardError
    }
  } else {
    // Welch's t-test (unequal variance - default)
    const se1 = var1 / n1
    const se2 = var2 / n2
    const seSum = se1 + se2

    if (seSum === 0) {
      throw new Error(
        'Varians kedua kelompok bernilai nol; uji-t tidak terdefinisi karena tidak ada variabilitas data.',
      )
    } else {
      tStat = (mean1 - mean2) / Math.sqrt(seSum)
      // Welch-Satterthwaite equation
      const denom = se1 ** 2 / (n1 - 1) + se2 ** 2 / (n2 - 1)
      df = denom > 0 ? seSum ** 2 / denom : n1 + n2 - 2
    }
  }

  const pValue = computeTTestPValue(tStat, df)

  return {
    jenisUji: 'Uji t',
    testMethod: equalVariance
      ? "Student's Two-Sample t-Test (Equal Variance)"
      : "Welch's Two-Sample t-Test (Unequal Variance)",
    isTwoTailed: true,
    group1: {
      name: options.group1Name ?? 'Kelompok 1',
      n: n1,
      mean: mean1,
      standardDeviation: sd1,
      variance: var1,
    },
    group2: {
      name: options.group2Name ?? 'Kelompok 2',
      n: n2,
      mean: mean2,
      standardDeviation: sd2,
      variance: var2,
    },
    tStatistic: tStat,
    degreesOfFreedom: df,
    pValue,
    meanDifference: mean1 - mean2,
    isSignificant: pValue < 0.05,
  }
}

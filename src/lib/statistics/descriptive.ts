import { quantile } from './math-utils'
import type { DescriptiveResult } from './types'

/**
 * Computes descriptive statistics for a numeric dataset (FR 07 / TC-06).
 * Validates non-emptiness, handles single elements and multimodal datasets.
 */
export function calculateDescriptive(data: number[]): DescriptiveResult {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Dataset tidak boleh kosong untuk analisis statistik deskriptif.')
  }

  // Filter and validate numeric integrity
  const validData: number[] = []
  for (const val of data) {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new Error(`Data memuat nilai tidak valid: ${val}`)
    }
    validData.push(val)
  }

  const n = validData.length
  const sorted = [...validData].sort((a, b) => a - b)

  // 1. Mean
  const sum = validData.reduce((acc, v) => acc + v, 0)
  const mean = sum / n

  // 2. Median
  let median: number
  const mid = Math.floor(n / 2)
  if (n % 2 !== 0) {
    median = sorted[mid] ?? 0
  } else {
    median = ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
  }

  // 3. Mode (handles multimodal or all unique)
  const frequencyMap = new Map<number, number>()
  let maxFreq = 0
  for (const v of validData) {
    const count = (frequencyMap.get(v) ?? 0) + 1
    frequencyMap.set(v, count)
    if (count > maxFreq) {
      maxFreq = count
    }
  }

  let mode: number[] | null = null
  let modeDescription = 'Tidak ada modus (seluruh nilai unik)'

  if (maxFreq > 1) {
    const modes: number[] = []
    for (const [val, count] of frequencyMap.entries()) {
      if (count === maxFreq) {
        modes.push(val)
      }
    }
    modes.sort((a, b) => a - b)
    mode = modes
    modeDescription = modes.join(', ')
  }

  // 4. Variance & Standard Deviation
  const sumSquaredDiffs = validData.reduce((acc, v) => acc + (v - mean) ** 2, 0)

  // Sample SD with Bessel's correction (n - 1)
  const sampleVariance = n > 1 ? sumSquaredDiffs / (n - 1) : 0
  const sampleStandardDeviation = Math.sqrt(sampleVariance)

  // Population SD (n)
  const populationVariance = sumSquaredDiffs / n
  const populationStandardDeviation = Math.sqrt(populationVariance)

  // 5. Min, Max, Range
  const minimum = sorted[0] ?? 0
  const maximum = sorted[n - 1] ?? 0
  const range = maximum - minimum

  // 6. Quartiles & IQR (Linear Interpolation)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1

  return {
    jenisUji: 'Deskriptif',
    n,
    mean,
    median,
    mode,
    modeDescription,
    sampleStandardDeviation,
    populationStandardDeviation,
    variance: sampleVariance,
    minimum,
    maximum,
    range,
    q1,
    q3,
    iqr,
  }
}

export { calculateDescriptive as calculateDescriptiveStatistics }

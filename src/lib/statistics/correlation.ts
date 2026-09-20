import { computeTTestPValue } from './math-utils'
import type { CorrelationResult } from './types'

/**
 * Computes Pearson product-moment correlation coefficient (FR 09 / TC-08).
 */
export function calculateCorrelation(xData: number[], yData: number[]): CorrelationResult {
  if (!Array.isArray(xData) || !Array.isArray(yData)) {
    throw new Error('Data variabel X dan Y harus berupa array numerik.')
  }
  if (xData.length !== yData.length) {
    throw new Error(`Panjang data variabel X (${xData.length}) dan Y (${yData.length}) harus sama.`)
  }
  if (xData.length < 3) {
    throw new Error('Analisis korelasi membutuhkan minimal 3 pasangan data numerik.')
  }

  const n = xData.length

  for (let i = 0; i < n; i++) {
    const x = xData[i]
    const y = yData[i]
    if (
      typeof x !== 'number' ||
      !Number.isFinite(x) ||
      typeof y !== 'number' ||
      !Number.isFinite(y)
    ) {
      throw new Error(`Terdapat nilai tidak valid pada indeks ${i}: X=${x}, Y=${y}`)
    }
  }

  const meanX = xData.reduce((acc, v) => acc + v, 0) / n
  const meanY = yData.reduce((acc, v) => acc + v, 0) / n

  let sumDiffProduct = 0
  let sumSqDiffX = 0
  let sumSqDiffY = 0

  for (let i = 0; i < n; i++) {
    const diffX = (xData[i] ?? 0) - meanX
    const diffY = (yData[i] ?? 0) - meanY
    sumDiffProduct += diffX * diffY
    sumSqDiffX += diffX ** 2
    sumSqDiffY += diffY ** 2
  }

  // Check for zero-variance degenerate conditions
  if (sumSqDiffX === 0 || sumSqDiffY === 0) {
    throw new Error(
      'Varians data bernilai nol (seluruh nilai pada salah satu variabel identik); koefisien korelasi tidak dapat dihitung.',
    )
  }

  const denom = Math.sqrt(sumSqDiffX * sumSqDiffY)
  let r = sumDiffProduct / denom

  // Constrain numerical jitter into [-1, 1]
  r = Math.max(-1, Math.min(1, r))

  const df = n - 2
  let tStat: number
  let pValue: number

  if (Math.abs(r) === 1) {
    tStat = r > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    pValue = 0
  } else {
    tStat = r * Math.sqrt(df / (1 - r ** 2))
    pValue = computeTTestPValue(tStat, df)
  }

  // Qualitative strength categorization
  const absR = Math.abs(r)
  let strength: 'Sangat Lemah' | 'Lemah' | 'Sedang' | 'Kuat' | 'Sangat Kuat'
  if (absR < 0.2) strength = 'Sangat Lemah'
  else if (absR < 0.4) strength = 'Lemah'
  else if (absR < 0.6) strength = 'Sedang'
  else if (absR < 0.8) strength = 'Kuat'
  else strength = 'Sangat Kuat'

  let direction: 'Positif' | 'Negatif' | 'Nol'
  if (r > 1e-7) direction = 'Positif'
  else if (r < -1e-7) direction = 'Negatif'
  else direction = 'Nol'

  return {
    jenisUji: 'Korelasi',
    method: 'Pearson Product-Moment',
    n,
    r,
    tStatistic: tStat,
    degreesOfFreedom: df,
    pValue,
    isSignificant: pValue < 0.05,
    strength,
    direction,
  }
}

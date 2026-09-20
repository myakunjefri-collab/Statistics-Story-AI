import type { RegressionResult } from './types'

/**
 * Computes Simple Linear Regression: y = a*x + b (FR 10 / TC-09).
 */
export function calculateRegression(xData: number[], yData: number[]): RegressionResult {
  if (!Array.isArray(xData) || !Array.isArray(yData)) {
    throw new Error('Data variabel X dan Y harus berupa array numerik.')
  }
  if (xData.length !== yData.length) {
    throw new Error(`Panjang data variabel X (${xData.length}) dan Y (${yData.length}) harus sama.`)
  }
  if (xData.length < 3) {
    throw new Error('Analisis regresi linier membutuhkan minimal 3 pasangan data numerik.')
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

  // Degenerate condition: zero variance of X (vertical line)
  if (sumSqDiffX === 0) {
    throw new Error(
      'Varians variabel independen (X) bernilai nol (seluruh nilai X identik); model regresi linier vertikal tidak dapat dibentuk.',
    )
  }

  // Slope a and Intercept b
  const slope = sumDiffProduct / sumSqDiffX
  const intercept = meanY - slope * meanX

  // Sum of squared residuals (SS_res) and Total sum of squares (SS_tot)
  let ssRes = 0
  for (let i = 0; i < n; i++) {
    const actualY = yData[i] ?? 0
    const predictedY = slope * (xData[i] ?? 0) + intercept
    ssRes += (actualY - predictedY) ** 2
  }

  // R² (Coefficient of determination)
  let rSquared = sumSqDiffY > 0 ? 1 - ssRes / sumSqDiffY : 1
  rSquared = Math.max(0, Math.min(1, rSquared))

  const standardError = Math.sqrt(ssRes / (n - 2))

  // Format equation: y = ax + b
  const sign = intercept >= 0 ? '+' : '-'
  const absIntercept = Math.abs(intercept)
  const equation = `y = ${slope.toFixed(4)}x ${sign} ${absIntercept.toFixed(4)}`

  return {
    jenisUji: 'Regresi',
    method: 'Simple Linear Regression',
    n,
    slope,
    intercept,
    rSquared,
    standardError,
    equation,
    isSignificant: rSquared > 0.1,
  }
}

export { calculateRegression as calculateSimpleLinearRegression }

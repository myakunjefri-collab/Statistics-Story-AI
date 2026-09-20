import { describe, it, expect } from 'vitest'
import { calculateSimpleLinearRegression } from '@/lib/statistics/regression'
import referenceDatasets from '../fixtures/reference-datasets.json'

describe('Statistical Engine — Simple Linear Regression (TC09)', () => {
  const { x, y, expected } = referenceDatasets.regression_linear

  it('TC09: Analisis regresi sederhana (koefisien regresi dan R² tampil sesuai perhitungan)', () => {
    const result = calculateSimpleLinearRegression(x, y)

    expect(result.slope).toBeCloseTo(expected.slope, 6)
    expect(result.intercept).toBeCloseTo(expected.intercept, 6)
    expect(result.rSquared).toBeCloseTo(expected.rSquared, 6)
    expect(result.equation).toBe(`y = ${expected.slope.toFixed(4)}x + ${expected.intercept.toFixed(4)}`)
  })

  it('Rejects datasets where variable X has zero variance (vertical slope)', () => {
    expect(() => calculateSimpleLinearRegression([2, 2, 2, 2], [10, 20, 30, 40])).toThrowError(/varians/i)
  })

  it('Calculates predictions and residuals correctly', () => {
    const res = calculateSimpleLinearRegression([1, 2, 3], [2, 4, 6])
    expect(res.slope).toBeCloseTo(2, 6)
    expect(res.intercept).toBeCloseTo(0, 6)
    expect(res.rSquared).toBeCloseTo(1, 6)
    const predicted = res.intercept + res.slope * 4
    expect(predicted).toBeCloseTo(8, 6)
  })
})

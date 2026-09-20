import { describe, it, expect } from 'vitest'
import { calculateCorrelation } from '@/lib/statistics/correlation'
import referenceDatasets from '../fixtures/reference-datasets.json'

describe('Statistical Engine — Pearson Correlation (TC08)', () => {
  const { x, y, expected } = referenceDatasets.correlation_pearson

  it('TC08: Analisis korelasi (koefisien korelasi tampil sesuai perhitungan)', () => {
    const result = calculateCorrelation(x, y)

    expect(result.n).toBe(x.length)
    expect(result.r).toBeCloseTo(expected.r, 6)
    expect(result.tStatistic).toBeCloseTo(expected.tStatistic, 4)
    expect(result.degreesOfFreedom).toBe(expected.degreesOfFreedom)
    expect(result.pValue).toBeCloseTo(expected.pValue, 6)
  })

  it('Rejects datasets with unequal vector lengths', () => {
    expect(() => calculateCorrelation([1, 2, 3], [4, 5])).toThrowError(/harus sama/i)
  })

  it('Rejects datasets with zero variance on either variable', () => {
    expect(() => calculateCorrelation([5, 5, 5, 5], [1, 2, 3, 4])).toThrowError(/varians/i)
  })

  it('Calculates negative correlation correctly', () => {
    const res = calculateCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])
    expect(res.r).toBeCloseTo(-1.0, 6)
    expect(res.pValue).toBeLessThan(0.001)
  })
})

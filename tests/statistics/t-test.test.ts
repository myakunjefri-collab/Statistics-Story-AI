import { describe, it, expect } from 'vitest'
import { calculateTTest } from '@/lib/statistics/t-test'
import referenceDatasets from '../fixtures/reference-datasets.json'

describe('Statistical Engine — Independent Two-Sample t-Test (TC07)', () => {
  const { group1, group2, expected } = referenceDatasets.ttest_welch

  it('TC07: Analisis uji t (nilai t dan p-value tampil sesuai perhitungan)', () => {
    // Default technical decision: Welch's t-test (unequal variance)
    const result = calculateTTest(group1, group2, { equalVariance: false })

    expect(result.tStatistic).toBeCloseTo(expected.tStatistic, 5)
    expect(result.degreesOfFreedom).toBeCloseTo(expected.degreesOfFreedom, 4)
    expect(result.pValue).toBeCloseTo(expected.pValue, 5)
    expect(result.group1.mean - result.group2.mean).toBeCloseTo(expected.meanDifference, 5)
  })

  it('Student t-test calculation with pooled variance', () => {
    const studentResult = calculateTTest(group1, group2, { equalVariance: true })
    expect(studentResult.degreesOfFreedom).toBe(group1.length + group2.length - 2)
    expect(studentResult.tStatistic).toBeGreaterThan(0)
    expect(studentResult.pValue).toBeLessThan(0.05)
  })

  it('Rejects groups with insufficient sample size (n < 2)', () => {
    expect(() => calculateTTest([10], [20, 30])).toThrowError(/minimal 2/i)
    expect(() => calculateTTest([10, 20], [])).toThrowError(/minimal 2/i)
  })

  it('Rejects datasets where both groups have zero variance and identical means', () => {
    expect(() => calculateTTest([5, 5, 5], [5, 5, 5])).toThrowError(/varians/i)
  })
})

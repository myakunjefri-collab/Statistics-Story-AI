import { describe, it, expect } from 'vitest'
import { calculateDescriptiveStatistics } from '@/lib/statistics/descriptive'
import referenceDatasets from '../fixtures/reference-datasets.json'

describe('Statistical Engine — Descriptive Statistics (TC06)', () => {
  const { data, expected } = referenceDatasets.descriptive

  it('TC06: Analisis statistik deskriptif tampil sesuai perhitungan', () => {
    const result = calculateDescriptiveStatistics(data)

    // Contract Acceptance Target: deviasi 0% / hasil identik terhadap manual/reference
    // Test harness floating-point tolerance: <= 1e-6
    expect(result.n).toBe(expected.n)
    expect(result.mean).toBeCloseTo(expected.mean, 6)
    expect(result.median).toBeCloseTo(expected.median, 6)
    expect(result.sampleStandardDeviation).toBeCloseTo(expected.sampleStandardDeviation, 6)
    expect(result.populationStandardDeviation).toBeCloseTo(expected.populationStandardDeviation, 6)
    expect(result.minimum).toBe(expected.minimum)
    expect(result.maximum).toBe(expected.maximum)

    // Modes
    expect(result.mode).toEqual(expected.mode)
  })

  it('Rejects datasets with empty or insufficient values', () => {
    expect(() => calculateDescriptiveStatistics([])).toThrowError(/kosong/i)
  })

  it('Handles single unique mode correctly', () => {
    const result = calculateDescriptiveStatistics([10, 20, 20, 30])
    expect(result.mode).toEqual([20])
  })
})

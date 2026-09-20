import { describe, it, expect } from 'vitest'
import { formatStatisticalValues } from '@/lib/result/format-statistics'
import { calculateDescriptive } from '@/lib/statistics/descriptive'
import { calculateTTest } from '@/lib/statistics/t-test'
import { calculateCorrelation } from '@/lib/statistics/correlation'
import { calculateRegression } from '@/lib/statistics/regression'

describe('Statistical Result Formatter (Section H & Section U)', () => {
  function assertNoCorruptedStrings(items: ReturnType<typeof formatStatisticalValues>) {
    for (const item of items) {
      expect(item.label).not.toContain('[object')
      expect(item.label).not.toBe('undefined')
      expect(item.nilai).not.toContain('[object')
      expect(item.nilai).not.toBe('undefined')
      expect(item.nilai).not.toBe('NaN')
      expect(item.nilai).not.toBe('Infinity')
      expect(item.nilai).not.toBe('-Infinity')
      if (item.keterangan) {
        expect(item.keterangan).not.toContain('[object')
        expect(item.keterangan).not.toBe('undefined')
      }
    }
  }

  it('Case 1: Deskriptif produces mean, median, mode, sd, min, max without [object Object]', () => {
    const rawData = [12, 15, 12, 18, 22, 25, 22, 30, 14, 18]
    const calc = calculateDescriptive(rawData)
    const formatted = formatStatisticalValues('Deskriptif', calc)

    assertNoCorruptedStrings(formatted)

    const labels = formatted.map((f) => f.label)
    expect(labels).toContain('Mean')
    expect(labels).toContain('Median')
    expect(labels).toContain('Modus')
    expect(labels).toContain('Std. Deviasi')
    expect(labels).toContain('Minimum')
    expect(labels).toContain('Maksimum')

    const meanItem = formatted.find((f) => f.label === 'Mean')
    expect(meanItem?.nilai).toBeDefined()
    expect(meanItem?.nilai.length).toBeGreaterThan(0)
  })

  it('Case 2: Uji t produces t, p-value, df, and group means without nested object leaks', () => {
    const g1 = [70, 75, 72, 68, 74]
    const g2 = [85, 88, 90, 82, 87]
    const calc = calculateTTest(g1, g2, { group1Name: 'Kontrol', group2Name: 'Eksperimen' })
    const formatted = formatStatisticalValues('Uji t', calc)

    assertNoCorruptedStrings(formatted)

    const labels = formatted.map((f) => f.label)
    expect(labels).toContain('t-Hitung')
    expect(labels).toContain('p-value')
    expect(labels).toContain('Derajat Kebebasan (df)')
    expect(labels).toContain('Selisih Mean')
    expect(labels).toContain('Mean Kontrol')
    expect(labels).toContain('Mean Eksperimen')

    // Confirm no nested object toString leak like "GROUP1 [object Object]"
    const allLabelsAndValues = formatted.map((f) => `${f.label}: ${f.nilai}`).join(', ')
    expect(allLabelsAndValues).not.toContain('[object')
  })

  it('Case 3: Korelasi produces r, p-value, direction, strength', () => {
    const x = [2, 4, 6, 8, 10]
    const y = [50, 60, 70, 80, 90]
    const calc = calculateCorrelation(x, y)
    const formatted = formatStatisticalValues('Korelasi', calc)

    assertNoCorruptedStrings(formatted)

    const labels = formatted.map((f) => f.label)
    expect(labels).toContain('Koefisien Korelasi (r)')
    expect(labels).toContain('p-value')
    expect(labels).toContain('Koefisien Determinasi (R²)')
    expect(labels).toContain('Arah Hubungan')
    expect(labels).toContain('Kekuatan Hubungan')

    const rItem = formatted.find((f) => f.label === 'Koefisien Korelasi (r)')
    expect(rItem?.nilai).toBe('1') // Perfect correlation of 1.0
  })

  it('Case 4: Regresi produces slope, intercept, R², equation, and handles standardError', () => {
    const x = [1, 2, 3, 4, 5]
    const y = [3, 5, 7, 9, 11] // y = 2x + 1
    const calc = calculateRegression(x, y)
    const formatted = formatStatisticalValues('Regresi', {
      ...calc,
      standardError: 0.05,
    })

    assertNoCorruptedStrings(formatted)

    const labels = formatted.map((f) => f.label)
    expect(labels).toContain('Koefisien Regresi (Slope)')
    expect(labels).toContain('Konstanta (Intercept)')
    expect(labels).toContain('Koefisien Determinasi (R²)')
    expect(labels).toContain('Persamaan Regresi')
    expect(labels).toContain('Standar Error')

    const slopeItem = formatted.find((f) => f.label === 'Koefisien Regresi (Slope)')
    expect(slopeItem?.nilai).toBe('2')
    const interceptItem = formatted.find((f) => f.label === 'Konstanta (Intercept)')
    expect(interceptItem?.nilai).toBe('1')
  })

  it('Case 5: Korelasi handles negative correlation and insignificant p-value branches', () => {
    const formattedNeg = formatStatisticalValues('Korelasi', {
      r: -0.75,
      pValue: 0.12,
    })
    assertNoCorruptedStrings(formattedNeg)
    const dirItem = formattedNeg.find((f) => f.label === 'Arah Hubungan')
    expect(dirItem?.nilai).toBe('Negatif')

    const pValItem = formattedNeg.find((f) => f.label === 'p-value')
    expect(pValItem?.keterangan).toBe('Tidak signifikan (p ≥ 0,05)')

    const formattedZero = formatStatisticalValues('Korelasi', {
      r: 0,
      pValue: 0.88,
    })
    expect(formattedZero.find((f) => f.label === 'Arah Hubungan')?.nilai).toBe('Nol')
  })

  it('Case 6: Handles unknown or default analysis type gracefully', () => {
    const fallback = formatStatisticalValues('Lainnya', {})
    expect(fallback).toEqual([
      { label: 'STATUS', nilai: 'Selesai', keterangan: 'Kalkulasi berhasil diselesaikan' },
    ])
  })

  it('Safely handles empty, corrupt, or legacy raw payloads without throwing', () => {
    const emptyResult = formatStatisticalValues('Deskriptif', {})
    assertNoCorruptedStrings(emptyResult)

    const corruptValues = formatStatisticalValues('Uji t', {
      t: NaN,
      pValue: Infinity,
      group1: '[object Object]',
    })
    assertNoCorruptedStrings(corruptValues)
  })
})

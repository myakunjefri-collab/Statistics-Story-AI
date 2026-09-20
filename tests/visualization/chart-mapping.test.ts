import { describe, it, expect } from 'vitest'
import { normalizeVisualization } from '@/lib/result/normalizers'
import { canonicalVisualizationSchema, visualizationDataSchema } from '@/lib/validation'

describe('Visualization Chart Mapping & Production Contracts (TC11)', () => {
  it('TC11: Deskriptif maps strictly to canonical Histogram with actual values', () => {
    const rawVis = {
      jenis_grafik: 'histogram',
      data_grafik: {
        kind: 'histogram',
        values: [10, 20, 25, 30, 35],
        labelX: 'Nilai Ujian',
        labelY: 'Frekuensi',
      },
    }

    const result = normalizeVisualization(rawVis, 'Deskriptif')

    expect(result.jenisGrafik).toBe('histogram')
    expect(result.dataGrafik.kind).toBe('histogram')
    if (result.dataGrafik.kind === 'histogram') {
      expect(result.dataGrafik.values).toEqual([10, 20, 25, 30, 35])
    }
    expect(result.labelX).toBe('Nilai Ujian')
    expect(result.labelY).toBe('Frekuensi')

    // Validates against canonical schema
    expect(() => canonicalVisualizationSchema.parse(result)).not.toThrow()
  })

  it('TC11: Uji t maps strictly to canonical Bar comparison with group metrics', () => {
    const rawVis = {
      jenis_grafik: 'bar',
      data_grafik: {
        kind: 'bar',
        groups: [
          { groupName: 'Kelas A', mean: 75.5, sd: 5.2, n: 20 },
          { groupName: 'Kelas B', mean: 82.0, sd: 4.8, n: 20 },
        ],
        labelX: 'Kelas',
        labelY: 'Rata-rata Nilai',
      },
    }

    const result = normalizeVisualization(rawVis, 'Uji t')

    expect(result.jenisGrafik).toBe('bar')
    expect(result.dataGrafik.kind).toBe('bar')
    if (result.dataGrafik.kind === 'bar') {
      expect(result.dataGrafik.groups).toHaveLength(2)
      expect(result.dataGrafik.groups[0]?.groupName).toBe('Kelas A')
      expect(result.dataGrafik.groups[0]?.mean).toBe(75.5)
      expect(result.dataGrafik.groups[1]?.groupName).toBe('Kelas B')
    }

    expect(() => canonicalVisualizationSchema.parse(result)).not.toThrow()
  })

  it('TC11: Korelasi maps strictly to canonical Scatter plot without trendline', () => {
    const rawVis = {
      jenis_grafik: 'scatter',
      data_grafik: {
        kind: 'scatter',
        points: [
          { x: 2, y: 50 },
          { x: 4, y: 65 },
          { x: 6, y: 78 },
        ],
        labelX: 'Jam Belajar',
        labelY: 'Skor',
      },
    }

    const result = normalizeVisualization(rawVis, 'Korelasi')

    expect(result.jenisGrafik).toBe('scatter')
    expect(result.dataGrafik.kind).toBe('scatter')
    if (result.dataGrafik.kind === 'scatter') {
      expect(result.dataGrafik.points).toHaveLength(3)
      expect(result.dataGrafik.trendline).toBeUndefined()
    }

    expect(() => canonicalVisualizationSchema.parse(result)).not.toThrow()
  })

  it('TC11: Regresi maps strictly to canonical Scatter plot WITH fitted trendline', () => {
    const rawVis = {
      jenis_grafik: 'regression',
      data_grafik: {
        kind: 'scatter',
        points: [
          { x: 1, y: 3 },
          { x: 2, y: 5 },
          { x: 3, y: 7 },
        ],
        trendline: {
          slope: 2,
          intercept: 1,
          rSquared: 0.998,
        },
        labelX: 'Variabel Bebas (X)',
        labelY: 'Variabel Terikat (Y)',
      },
    }

    const result = normalizeVisualization(rawVis, 'Regresi')

    // Regresi canonicalizes to 'scatter' client representation with trendline
    expect(result.jenisGrafik).toBe('scatter')
    expect(result.dataGrafik.kind).toBe('scatter')
    if (result.dataGrafik.kind === 'scatter') {
      expect(result.dataGrafik.points).toHaveLength(3)
      expect(result.dataGrafik.trendline).toBeDefined()
      expect(result.dataGrafik.trendline?.slope).toBe(2)
      expect(result.dataGrafik.trendline?.intercept).toBe(1)
      expect(result.dataGrafik.trendline?.rSquared).toBeCloseTo(0.998, 3)
    }

    expect(() => canonicalVisualizationSchema.parse(result)).not.toThrow()
  })

  it('Handles legacy database records gracefully without losing data', () => {
    // Legacy t-Test record where data_grafik was { group1: {...}, group2: {...} }
    const legacyTTest = {
      jenis_grafik: 'bar',
      data_grafik: {
        group1: { name: 'Kontrol', mean: 70, standardDeviation: 5, n: 10 },
        group2: { name: 'Eksperimen', mean: 85, standardDeviation: 4, n: 10 },
      },
    }

    const normalized = normalizeVisualization(legacyTTest, 'Uji t')
    expect(normalized.dataGrafik.kind).toBe('bar')
    if (normalized.dataGrafik.kind === 'bar') {
      expect(normalized.dataGrafik.groups[0]?.groupName).toBe('Kontrol')
      expect(normalized.dataGrafik.groups[1]?.mean).toBe(85)
    }

    expect(() => visualizationDataSchema.parse(normalized.dataGrafik)).not.toThrow()
  })

  it('Handles legacy regression records where trendline was stored in data_grafik.stats', () => {
    const legacyRegression = {
      jenis_grafik: 'regression',
      data_grafik: {
        points: [{ x: 1, y: 2 }, { x: 2, y: 4 }],
        stats: { slope: 2, intercept: 0, rSquared: 1 },
      },
    }

    const normalized = normalizeVisualization(legacyRegression, 'Regresi')
    expect(normalized.dataGrafik.kind).toBe('scatter')
    if (normalized.dataGrafik.kind === 'scatter') {
      expect(normalized.dataGrafik.trendline?.slope).toBe(2)
      expect(normalized.dataGrafik.trendline?.rSquared).toBe(1)
    }
  })

  it('Handles legacy deskriptif records where data_grafik was a flat array of numbers', () => {
    const legacyDesk = {
      jenis_grafik: 'histogram',
      data_grafik: [5, 10, 15, 20],
    }

    const normalized = normalizeVisualization(legacyDesk, 'Deskriptif')
    expect(normalized.dataGrafik.kind).toBe('histogram')
    if (normalized.dataGrafik.kind === 'histogram') {
      expect(normalized.dataGrafik.values).toEqual([5, 10, 15, 20])
    }
  })
})

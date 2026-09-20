/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { VisualizationPanel } from '@/components/analysis-result/visualization-panel'
import { RegressionChart } from '@/components/analysis-result/regression-chart'
import type { CanonicalVisualization } from '@/lib/types'

describe('TC-11: Actual Chart Rendering & Component Presentation', () => {
  it('A. Descriptive Statistics: renders histogram with actual values/bins', () => {
    const descriptiveVis: CanonicalVisualization = {
      jenisGrafik: 'histogram',
      dataGrafik: {
        kind: 'histogram',
        values: [10, 15, 20, 25, 30, 35, 40],
        bins: [
          { binLabel: '10-20', count: 3, min: 10, max: 20 },
          { binLabel: '20-30', count: 2, min: 20, max: 30 },
          { binLabel: '30-40', count: 2, min: 30, max: 40 },
        ],
      },
      labelX: 'Nilai Ujian',
      labelY: 'Frekuensi',
    }

    const { container } = render(<VisualizationPanel visualisasi={descriptiveVis} />)

    // Verify container and SVG elements are rendered
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('role')).toBe('img')

    // Verify actual histogram bins/bars rendered as SVG rect elements
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(3)

    // Verify axis labels
    expect(container.textContent).toContain('Visualisasi Hasil Statistik')
    expect(container.textContent).toContain('Histogram')
  })

  it('B. Uji-t (Two Groups): renders bar comparison chart with actual group means', () => {
    const tTestVis: CanonicalVisualization = {
      jenisGrafik: 'bar',
      dataGrafik: {
        kind: 'bar',
        groups: [
          { groupName: 'Kelas Kontrol', mean: 68.5, sd: 5.2, n: 30 },
          { groupName: 'Kelas Eksperimen', mean: 82.4, sd: 4.8, n: 30 },
        ],
      },
      labelX: 'Kelompok',
      labelY: 'Rata-rata Nilai',
    }

    const { container } = render(<VisualizationPanel visualisasi={tTestVis} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()

    // Assert two actual group bars rendered as SVG rect elements
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(2)

    expect(container.textContent).toContain('Kelas Kontrol')
    expect(container.textContent).toContain('Kelas Eksperimen')
    expect(container.textContent).toContain('68.5')
    expect(container.textContent).toContain('82.4')
  })

  it('C. Correlation: renders scatter plot with actual paired data points', () => {
    const correlationVis: CanonicalVisualization = {
      jenisGrafik: 'scatter',
      dataGrafik: {
        kind: 'scatter',
        points: [
          { x: 2, y: 55 },
          { x: 4, y: 68 },
          { x: 6, y: 78 },
          { x: 8, y: 88 },
        ],
      },
      labelX: 'Waktu Belajar (Jam)',
      labelY: 'Nilai Tes',
    }

    const { container } = render(<VisualizationPanel visualisasi={correlationVis} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()

    // Assert actual SVG circles are rendered for each point
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(4)
  })

  it('D. Regression: renders scatter + trendline using backend metadata without client recalculation', () => {
    const backendSlope = 5.25
    const backendIntercept = 42.1
    const backendR2 = 0.942

    const regressionVis: CanonicalVisualization = {
      jenisGrafik: 'scatter',
      dataGrafik: {
        kind: 'scatter',
        points: [
          { x: 2, y: 52 },
          { x: 4, y: 63 },
          { x: 6, y: 74 },
          { x: 8, y: 84 },
          { x: 10, y: 95 },
        ],
        trendline: {
          slope: backendSlope,
          intercept: backendIntercept,
          rSquared: backendR2,
        },
      },
      labelX: 'Jam Belajar',
      labelY: 'Nilai Ujian',
    }

    const { container } = render(<VisualizationPanel visualisasi={regressionVis} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()

    // Circles for data points
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(5)

    // Trendline and equations display backend metadata
    expect(container.textContent).toContain('R² = 0.9420')
    expect(container.textContent).toContain('42.10 + 5.25x')

    // Verifies slope in equation
    expect(container.textContent).toContain('5.25x')
  })

  it('Regression Chart explicitly displays fallback note if trendline metadata is absent', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ]

    const { container } = render(<RegressionChart data={points} />)

    // When backend slope/intercept are not passed, frontend DOES NOT recalculate OLS
    expect(container.textContent).toContain('Garis regresi tidak tersedia untuk hasil ini.')
  })
})

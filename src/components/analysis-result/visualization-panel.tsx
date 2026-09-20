import { BarComparisonChart } from '@/components/analysis-result/bar-comparison-chart'
import { HistogramChart } from '@/components/analysis-result/histogram-chart'
import { RegressionChart } from '@/components/analysis-result/regression-chart'
import { ScatterChart } from '@/components/app/scatter-chart'
import { Card } from '@/components/ui/card'
import type { CanonicalVisualization } from '@/lib/types'

export interface VisualizationPanelProps {
  visualisasi: CanonicalVisualization
}

export function VisualizationPanel({ visualisasi }: VisualizationPanelProps) {
  const { dataGrafik, labelX, labelY, jenisGrafik } = visualisasi

  const renderChart = () => {
    switch (dataGrafik.kind) {
      case 'histogram':
        return (
          <HistogramChart
            data={
              dataGrafik.bins && dataGrafik.bins.length > 0 ? dataGrafik.bins : dataGrafik.values
            }
            labelX={labelX || 'Nilai'}
            labelY={labelY || 'Frekuensi'}
          />
        )

      case 'bar':
        return (
          <BarComparisonChart groups={dataGrafik.groups} labelY={labelY || 'Rata-rata Kelompok'} />
        )

      case 'scatter':
        if (dataGrafik.trendline) {
          return (
            <RegressionChart
              data={dataGrafik.points}
              slope={dataGrafik.trendline.slope}
              intercept={dataGrafik.trendline.intercept}
              rSquared={dataGrafik.trendline.rSquared}
              labelX={labelX || 'Variabel Bebas (X)'}
              labelY={labelY || 'Variabel Terikat (Y)'}
            />
          )
        }

        return (
          <ScatterChart
            data={dataGrafik.points}
            labelX={labelX || 'Variabel X'}
            labelY={labelY || 'Variabel Y'}
            showTrendline={false}
          />
        )

      default:
        return (
          <div
            role="region"
            aria-label="Grafik tidak tersedia"
            className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
          >
            <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
          </div>
        )
    }
  }

  const chartDisplayType =
    dataGrafik.kind === 'scatter' && dataGrafik.trendline
      ? 'Regresi (Scatter + Trendline)'
      : jenisGrafik

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-semibold text-ink">Visualisasi Hasil Statistik</h3>
            <p className="text-xs text-muted-foreground">
              Grafik otomatis jenis:{' '}
              <span className="capitalize font-mono font-medium text-electric">
                {chartDisplayType}
              </span>
            </p>
          </div>
        </div>
        {renderChart()}
      </div>
    </Card>
  )
}

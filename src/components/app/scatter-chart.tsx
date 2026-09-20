export interface Point {
  x: number
  y: number
}

export interface ScatterChartProps {
  data: Point[]
  labelX: string
  labelY: string
  showTrendline?: boolean
  trendline?: {
    slope: number
    intercept: number
    rSquared?: number
  }
}

// Lightweight, dependency-free scatter plot.
// Data-driven component — coordinates are computed purely from actual points.
export function ScatterChart({
  data,
  labelX,
  labelY,
  showTrendline = false,
  trendline,
}: ScatterChartProps) {
  const width = 640
  const height = 380
  const pad = { top: 24, right: 24, bottom: 48, left: 52 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  // Section J: strictly show EmptyState if data is empty — no hardcoded fallback
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        role="region"
        aria-label="Area diagram sebar kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">
          Dataset korelasi tidak memiliki pasangan nilai (X, Y) yang valid.
        </p>
      </div>
    )
  }

  const validPoints = data.filter(
    (d) =>
      typeof d.x === 'number' &&
      typeof d.y === 'number' &&
      Number.isFinite(d.x) &&
      Number.isFinite(d.y),
  )

  if (validPoints.length === 0) {
    return (
      <div
        role="region"
        aria-label="Area diagram sebar kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">Semua titik pasangan data bernilai tidak valid atau NaN.</p>
      </div>
    )
  }

  const xs = validPoints.map((d) => d.x)
  const ys = validPoints.map((d) => d.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1

  const sx = (x: number) => pad.left + ((x - minX) / spanX) * plotW
  const sy = (y: number) => pad.top + plotH - ((y - minY) / spanY) * plotH

  // Trend line strictly driven by canonical trendline metadata if provided and enabled (Phase 11)
  const lineY =
    (showTrendline || trendline) &&
    trendline &&
    typeof trendline.slope === 'number' &&
    Number.isFinite(trendline.slope) &&
    typeof trendline.intercept === 'number' &&
    Number.isFinite(trendline.intercept)
      ? (x: number) => trendline.slope * x + trendline.intercept
      : null

  const gridY = Array.from({ length: 5 }, (_, i) => minY + (spanY / 4) * i)

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Diagram sebar hubungan ${labelX} dengan ${labelY}`}
      >
        {/* Horizontal grid + Y ticks */}
        {gridY.map((gy, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              y1={sy(gy)}
              x2={width - pad.right}
              y2={sy(gy)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={pad.left - 10}
              y={sy(gy)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px] tabular-nums"
            >
              {Math.round(gy)}
            </text>
          </g>
        ))}

        {/* Optional Trend line */}
        {lineY !== null && (
          <line
            x1={sx(minX)}
            y1={sy(lineY(minX))}
            x2={sx(maxX)}
            y2={sy(lineY(maxX))}
            className="stroke-electric"
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        )}

        {/* Observation Points */}
        {validPoints.map((d, i) => (
          <circle
            key={i}
            cx={sx(d.x)}
            cy={sy(d.y)}
            r={5}
            className="fill-ink transition-transform hover:scale-125"
          />
        ))}

        {/* Axis labels */}
        <text
          x={pad.left + plotW / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-ink text-[12px] font-medium"
        >
          {labelX}
        </text>
        <text
          transform={`translate(14, ${pad.top + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink text-[12px] font-medium"
        >
          {labelY}
        </text>
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">
        {lineY !== null
          ? 'Setiap titik mewakili satu pasangan observasi; garis putus-putus adalah garis tren.'
          : 'Setiap titik mewakili satu pasangan observasi nilai variabel X dan Y.'}
      </figcaption>
    </figure>
  )
}

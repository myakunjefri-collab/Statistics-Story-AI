export interface RegressionPoint {
  x: number
  y: number
}

export interface RegressionChartProps {
  data: RegressionPoint[]
  slope?: number
  intercept?: number
  rSquared?: number
  equation?: string
  labelX?: string
  labelY?: string
}

export function RegressionChart({
  data,
  slope: propSlope,
  intercept: propIntercept,
  rSquared: propR2,
  equation: propEquation,
  labelX = 'Variabel X (Bebas)',
  labelY = 'Variabel Y (Terikat)',
}: RegressionChartProps) {
  const width = 640
  const height = 380
  const pad = { top: 24, right: 32, bottom: 48, left: 56 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  // Section J: strictly show EmptyState if data is empty — no hardcoded mock fallback
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        role="region"
        aria-label="Area grafik regresi kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">
          Dataset regresi tidak memiliki pasangan nilai (X, Y) yang valid.
        </p>
      </div>
    )
  }

  const validData = data.filter(
    (d) =>
      typeof d.x === 'number' &&
      typeof d.y === 'number' &&
      Number.isFinite(d.x) &&
      Number.isFinite(d.y),
  )

  if (validData.length === 0) {
    return (
      <div
        role="region"
        aria-label="Area grafik regresi kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">Dataset regresi tidak memiliki titik numerik yang valid.</p>
      </div>
    )
  }

  const xs = validData.map((d) => d.x)
  const ys = validData.map((d) => d.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1

  const sx = (x: number) => pad.left + ((x - minX) / spanX) * plotW
  const sy = (y: number) => pad.top + plotH - ((y - minY) / spanY) * plotH

  // Backend is the single source of truth for slope and intercept (Phase 10)
  // NEVER recalculate OLS parameters on the frontend
  const hasTrendline =
    typeof propSlope === 'number' &&
    Number.isFinite(propSlope) &&
    typeof propIntercept === 'number' &&
    Number.isFinite(propIntercept)

  const slope = hasTrendline ? propSlope : undefined
  const intercept = hasTrendline ? propIntercept : undefined

  const lineY =
    hasTrendline && slope !== undefined && intercept !== undefined
      ? (x: number) => slope * x + intercept
      : null

  const gridY = Array.from({ length: 5 }, (_, i) => minY + (spanY / 4) * i)

  const equationDisplay =
    hasTrendline && slope !== undefined && intercept !== undefined
      ? propEquation || `ŷ = ${intercept.toFixed(2)} + ${slope.toFixed(2)}x`
      : null

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Diagram regresi linear sederhana ${labelX} terhadap ${labelY}`}
      >
        {/* Horizontal grid lines */}
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
              {gy.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Fitted Linear Regression Line from backend statistical engine */}
        {lineY !== null && (
          <line
            x1={sx(minX)}
            y1={sy(lineY(minX))}
            x2={sx(maxX)}
            y2={sy(lineY(maxX))}
            className="stroke-electric"
            strokeWidth={2.5}
          />
        )}

        {/* Observation Data Points */}
        {validData.map((d, i) => (
          <circle
            key={i}
            cx={sx(d.x)}
            cy={sy(d.y)}
            r={5}
            className="fill-ink hover:fill-electric transition-colors"
          />
        ))}

        {/* Equation Badge inside chart area */}
        <g transform={`translate(${pad.left + 16}, ${pad.top + 20})`}>
          <rect
            x={0}
            y={0}
            width={240}
            height={44}
            rx={6}
            className="fill-surface stroke-border shadow-sm"
          />
          {equationDisplay ? (
            <>
              <text x={12} y={18} className="fill-ink text-[11px] font-mono font-medium">
                Persamaan: {equationDisplay}
              </text>
              {propR2 !== undefined && Number.isFinite(propR2) ? (
                <text x={12} y={34} className="fill-muted-foreground text-[11px] font-mono">
                  R² = {propR2.toFixed(4)}
                </text>
              ) : null}
            </>
          ) : (
            <text x={12} y={26} className="fill-muted-foreground text-[11px] italic">
              Garis regresi tidak tersedia untuk hasil ini.
            </text>
          )}
        </g>

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
          ? 'Garis biru tebal merepresentasikan garis estimasi regresi (Ordinary Least Squares) dari engine statistik.'
          : 'Garis regresi tidak tersedia untuk hasil ini.'}
      </figcaption>
    </figure>
  )
}

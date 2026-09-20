export interface HistogramBin {
  binLabel: string
  count: number
  min: number
  max: number
}

export interface HistogramChartProps {
  data: number[] | HistogramBin[]
  labelX?: string
  labelY?: string
}

export function HistogramChart({
  data,
  labelX = 'Rentang Nilai',
  labelY = 'Frekuensi',
}: HistogramChartProps) {
  const width = 640
  const height = 360
  const pad = { top: 24, right: 24, bottom: 48, left: 52 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  // Prepare bins strictly from actual data without mock fallbacks (Section J & K)
  let bins: HistogramBin[] = []

  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'number') {
      const nums = (data as number[]).filter(
        (n) => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n),
      )
      if (nums.length > 0) {
        const min = Math.min(...nums)
        const max = Math.max(...nums)

        if (min === max) {
          // All values are identical (Section K requirement)
          bins = [
            {
              binLabel: `${min.toFixed(1)}`,
              count: nums.length,
              min: min - 0.5,
              max: max + 0.5,
            },
          ]
        } else {
          const binCount = Math.max(3, Math.min(8, Math.round(Math.sqrt(nums.length))))
          const step = (max - min) / binCount

          bins = Array.from({ length: binCount }, (_, i) => {
            const binMin = min + i * step
            const binMax = i === binCount - 1 ? max : min + (i + 1) * step
            const count = nums.filter((val) =>
              i === binCount - 1 ? val >= binMin && val <= binMax : val >= binMin && val < binMax,
            ).length
            return {
              binLabel: `${binMin.toFixed(1)} - ${binMax.toFixed(1)}`,
              count,
              min: binMin,
              max: binMax,
            }
          })
        }
      }
    } else {
      bins = data as HistogramBin[]
    }
  }

  // Section J: strictly show EmptyState if data is empty — never fake chart data
  if (bins.length === 0 || bins.every((b) => b.count === 0)) {
    return (
      <div
        role="region"
        aria-label="Area grafik histogram kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">Dataset deskriptif tidak memiliki nilai numerik yang valid.</p>
      </div>
    )
  }

  const maxCount = Math.max(...bins.map((b) => b.count), 1)
  const barWidth = plotW / bins.length
  const sy = (count: number) => pad.top + plotH - (count / maxCount) * plotH

  const gridY = Array.from({ length: 5 }, (_, i) => Math.round((maxCount / 4) * i))

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Histogram distribusi data ${labelX}`}
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
              {gy}
            </text>
          </g>
        ))}

        {/* Histogram Bars */}
        {bins.map((b, i) => {
          const bx = pad.left + i * barWidth
          const by = sy(b.count)
          const bHeight = pad.top + plotH - by
          const paddingInside = 4

          return (
            <g key={i} className="group">
              <rect
                x={bx + paddingInside}
                y={by}
                width={Math.max(1, barWidth - paddingInside * 2)}
                height={bHeight}
                rx={4}
                className="fill-ink/85 transition-colors group-hover:fill-electric"
              />
              <text
                x={bx + barWidth / 2}
                y={by - 6}
                textAnchor="middle"
                className="fill-ink text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {b.count}
              </text>
              <text
                x={bx + barWidth / 2}
                y={pad.top + plotH + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {b.binLabel}
              </text>
            </g>
          )
        })}

        {/* Axis Labels */}
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
        Histogram frekuensi observasi numerik berdistribusi dalam interval kelompok kelas data.
      </figcaption>
    </figure>
  )
}

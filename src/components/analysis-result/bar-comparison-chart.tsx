export interface GroupComparisonData {
  groupName: string
  mean: number
  sd?: number
  n?: number
}

export interface BarComparisonChartProps {
  groups: GroupComparisonData[]
  labelY?: string
}

export function BarComparisonChart({
  groups,
  labelY = 'Rata-rata (Mean)',
}: BarComparisonChartProps) {
  const width = 640
  const height = 360
  const pad = { top: 32, right: 48, bottom: 48, left: 64 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  // Section J: strictly show EmptyState if data is empty — no hardcoded mock fallback
  if (!Array.isArray(groups) || groups.length === 0) {
    return (
      <div
        role="region"
        aria-label="Area grafik perbandingan kelompok kosong"
        className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground"
      >
        <p className="font-medium text-ink">Belum ada data yang dapat divisualisasikan.</p>
        <p className="mt-1 text-xs">Data perbandingan dua kelompok tidak tersedia.</p>
      </div>
    )
  }

  const safeGroups = groups.slice(0, 2)
  const maxVal = Math.max(
    ...safeGroups.map((g) => {
      const base = typeof g.mean === 'number' && Number.isFinite(g.mean) ? g.mean : 0
      const err = typeof g.sd === 'number' && Number.isFinite(g.sd) ? g.sd : 0
      return base + err
    }),
    1,
  )
  const maxMean = maxVal * 1.15
  const sy = (val: number) => pad.top + plotH - (val / (maxMean || 1)) * plotH

  const gridY = Array.from({ length: 5 }, (_, i) => Math.round((maxMean / 4) * i))
  const slotWidth = plotW / safeGroups.length
  const barWidth = Math.min(100, slotWidth * 0.45)

  const group1Name = safeGroups[0]?.groupName || 'Kelompok 1'
  const group2Name = safeGroups[1]?.groupName || 'Kelompok 2'

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Diagram batang perbandingan ${group1Name} dan ${group2Name}`}
      >
        {/* Horizontal grid */}
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

        {/* Comparison Bars */}
        {safeGroups.map((g, i) => {
          const centerX = pad.left + i * slotWidth + slotWidth / 2
          const barX = centerX - barWidth / 2
          const barY = sy(g.mean)
          const barH = pad.top + plotH - barY
          const isSecond = i === 1

          return (
            <g key={i}>
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barH}
                rx={6}
                className={isSecond ? 'fill-electric' : 'fill-ink'}
              />
              {/* Value label on top of bar */}
              <text
                x={centerX}
                y={barY - 8}
                textAnchor="middle"
                className="fill-ink text-[12px] font-semibold tabular-nums"
              >
                {g.mean.toFixed(2)}
              </text>

              {/* Error bar for standard deviation if available */}
              {g.sd != null && g.sd > 0 ? (
                <g className="stroke-muted-foreground" strokeWidth={1.5}>
                  <line x1={centerX} y1={sy(g.mean - g.sd)} x2={centerX} y2={sy(g.mean + g.sd)} />
                  <line
                    x1={centerX - 8}
                    y1={sy(g.mean + g.sd)}
                    x2={centerX + 8}
                    y2={sy(g.mean + g.sd)}
                  />
                  <line
                    x1={centerX - 8}
                    y1={sy(g.mean - g.sd)}
                    x2={centerX + 8}
                    y2={sy(g.mean - g.sd)}
                  />
                </g>
              ) : null}

              {/* Group Name below axis */}
              <text
                x={centerX}
                y={pad.top + plotH + 22}
                textAnchor="middle"
                className="fill-ink text-[12px] font-medium"
              >
                {g.groupName}
              </text>
              {g.n != null ? (
                <text
                  x={centerX}
                  y={pad.top + plotH + 38}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  n = {g.n}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* Y-axis label */}
        <text
          transform={`translate(16, ${pad.top + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink text-[12px] font-medium"
        >
          {labelY}
        </text>
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">
        Diagram batang membandingkan rerata kedua kelompok beserta rentang variabilitas standar
        deviasi.
      </figcaption>
    </figure>
  )
}

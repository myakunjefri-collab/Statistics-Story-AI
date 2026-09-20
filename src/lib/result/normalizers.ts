import {
  type CanonicalVisualization,
  type ContohKasus,
  canonicalVisualizationSchema,
  type JenisAnalisis,
  type Narasi,
  type NilaiStatistik,
  type VisualizationData,
  visualizationDataSchema,
} from '@/lib/validation'
import { formatStatisticalValues } from './format-statistics'

/**
 * Normalizes raw string to canonical analysis type enum.
 * Rejects unknown or empty analysis types explicitly (Phase 4).
 * NEVER silently defaults to 'Deskriptif'.
 */
export function normalizeAnalysisType(raw?: string): JenisAnalisis {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Jenis analisis tidak boleh kosong atau tidak terdefinisi.')
  }

  const map: Record<string, JenisAnalisis> = {
    deskriptif: 'Deskriptif',
    Deskriptif: 'Deskriptif',
    uji_t: 'Uji t',
    'Uji t': 'Uji t',
    korelasi: 'Korelasi',
    Korelasi: 'Korelasi',
    regresi: 'Regresi',
    Regresi: 'Regresi',
  }

  const resolved = map[raw]
  if (!resolved) {
    throw new Error(`Jenis analisis "${raw}" tidak valid atau tidak didukung.`)
  }

  return resolved
}

/**
 * Adapts raw database visualization metadata into canonical domain visualization model.
 * Enforces strict numerical validation: NEVER coerces invalid numbers to 0 (Phase 4 & 6).
 */
export function normalizeVisualization(
  rawVis:
    | {
        jenis_grafik?: string
        data_grafik?: unknown
      }
    | null
    | undefined,
  jenisUji: JenisAnalisis,
): CanonicalVisualization {
  const rawData = (
    typeof rawVis?.data_grafik === 'object' && rawVis.data_grafik !== null ? rawVis.data_grafik : {}
  ) as Record<string, unknown>

  // 1. Resolve canonical chart type (maps legacy 'regression' to 'scatter')
  let resolvedKind: 'histogram' | 'bar' | 'scatter' = 'histogram'
  const rawKind = (rawVis?.jenis_grafik || '').toLowerCase()

  if (rawKind === 'bar' || jenisUji === 'Uji t') {
    resolvedKind = 'bar'
  } else if (
    rawKind === 'scatter' ||
    rawKind === 'regression' ||
    jenisUji === 'Korelasi' ||
    jenisUji === 'Regresi'
  ) {
    resolvedKind = 'scatter'
  } else {
    resolvedKind = 'histogram'
  }

  // 2. Resolve axis labels
  const labelX =
    typeof rawData.labelX === 'string' && rawData.labelX.trim()
      ? rawData.labelX.trim()
      : jenisUji === 'Deskriptif'
        ? 'Nilai'
        : jenisUji === 'Uji t'
          ? 'Kelompok'
          : jenisUji === 'Regresi'
            ? 'Variabel Bebas (X)'
            : 'Variabel X'

  const labelY =
    typeof rawData.labelY === 'string' && rawData.labelY.trim()
      ? rawData.labelY.trim()
      : jenisUji === 'Deskriptif'
        ? 'Frekuensi'
        : jenisUji === 'Uji t'
          ? 'Rata-rata'
          : jenisUji === 'Regresi'
            ? 'Variabel Terikat (Y)'
            : 'Variabel Y'

  // 3. Build canonical visualization data without silent coercion
  let dataGrafik: VisualizationData

  if (resolvedKind === 'histogram') {
    let values: number[] = []
    if (rawData.kind === 'histogram' && Array.isArray(rawData.values)) {
      values = rawData.values.filter(
        (v): v is number => typeof v === 'number' && Number.isFinite(v),
      )
    } else if (Array.isArray(rawData.values)) {
      values = rawData.values.filter(
        (v): v is number => typeof v === 'number' && Number.isFinite(v),
      )
    } else if (Array.isArray(rawData)) {
      values = (rawData as unknown[]).filter(
        (v): v is number => typeof v === 'number' && Number.isFinite(v),
      )
    }

    dataGrafik = {
      kind: 'histogram',
      values,
    }
  } else if (resolvedKind === 'bar') {
    let groups: { groupName: string; mean: number; sd?: number; n?: number }[] = []

    if (rawData.kind === 'bar' && Array.isArray(rawData.groups)) {
      groups = (
        rawData.groups as { groupName?: unknown; mean?: unknown; sd?: unknown; n?: unknown }[]
      )
        .filter(
          (g) =>
            typeof g.mean === 'number' &&
            Number.isFinite(g.mean) &&
            typeof g.groupName === 'string' &&
            g.groupName.trim().length > 0,
        )
        .map((g) => ({
          groupName: (g.groupName as string).trim(),
          mean: g.mean as number,
          sd: typeof g.sd === 'number' && Number.isFinite(g.sd) ? g.sd : undefined,
          n: typeof g.n === 'number' && Number.isFinite(g.n) ? g.n : undefined,
        }))
    } else if (rawData.group1 && rawData.group2) {
      const g1 = rawData.group1 as Record<string, unknown>
      const g2 = rawData.group2 as Record<string, unknown>
      const g1Mean = typeof g1.mean === 'number' && Number.isFinite(g1.mean) ? g1.mean : null
      const g2Mean = typeof g2.mean === 'number' && Number.isFinite(g2.mean) ? g2.mean : null

      if (g1Mean !== null && g2Mean !== null) {
        groups = [
          {
            groupName:
              typeof g1.name === 'string' && g1.name.trim() ? g1.name.trim() : 'Kelompok 1',
            mean: g1Mean,
            sd:
              typeof g1.standardDeviation === 'number' && Number.isFinite(g1.standardDeviation)
                ? g1.standardDeviation
                : undefined,
            n: typeof g1.n === 'number' && Number.isFinite(g1.n) ? g1.n : undefined,
          },
          {
            groupName:
              typeof g2.name === 'string' && g2.name.trim() ? g2.name.trim() : 'Kelompok 2',
            mean: g2Mean,
            sd:
              typeof g2.standardDeviation === 'number' && Number.isFinite(g2.standardDeviation)
                ? g2.standardDeviation
                : undefined,
            n: typeof g2.n === 'number' && Number.isFinite(g2.n) ? g2.n : undefined,
          },
        ]
      }
    } else if (Array.isArray(rawData)) {
      groups = (rawData as Record<string, unknown>[])
        .filter((d) => {
          const m = typeof d.mean === 'number' ? d.mean : d.y
          return typeof m === 'number' && Number.isFinite(m)
        })
        .map((d, idx) => ({
          groupName:
            typeof d.groupName === 'string' && d.groupName.trim()
              ? d.groupName.trim()
              : `Kelompok ${idx + 1}`,
          mean: (typeof d.mean === 'number' ? d.mean : d.y) as number,
          sd: typeof d.sd === 'number' && Number.isFinite(d.sd) ? d.sd : undefined,
          n: typeof d.n === 'number' && Number.isFinite(d.n) ? d.n : undefined,
        }))
    }

    dataGrafik = {
      kind: 'bar',
      groups,
    }
  } else {
    // Scatter (Korelasi & Regresi)
    let points: { x: number; y: number }[] = []

    const extractPoints = (arr: unknown[]): { x: number; y: number }[] => {
      return arr
        .map((p) => {
          if (typeof p === 'object' && p !== null) {
            const pt = p as Record<string, unknown>
            if (
              typeof pt.x === 'number' &&
              typeof pt.y === 'number' &&
              Number.isFinite(pt.x) &&
              Number.isFinite(pt.y)
            ) {
              return { x: pt.x, y: pt.y }
            }
          }
          return null
        })
        .filter((p): p is { x: number; y: number } => p !== null)
    }

    if (rawData.kind === 'scatter' && Array.isArray(rawData.points)) {
      points = extractPoints(rawData.points)
    } else if (Array.isArray(rawData.points)) {
      points = extractPoints(rawData.points)
    } else if (Array.isArray(rawData)) {
      points = extractPoints(rawData)
    }

    let trendline: { slope: number; intercept: number; rSquared?: number } | undefined

    if (rawData.kind === 'scatter' && rawData.trendline) {
      const tl = rawData.trendline as Record<string, unknown>
      if (
        typeof tl.slope === 'number' &&
        Number.isFinite(tl.slope) &&
        typeof tl.intercept === 'number' &&
        Number.isFinite(tl.intercept)
      ) {
        trendline = {
          slope: tl.slope,
          intercept: tl.intercept,
          rSquared:
            typeof tl.rSquared === 'number' && Number.isFinite(tl.rSquared)
              ? tl.rSquared
              : undefined,
        }
      }
    } else if (rawData.stats) {
      const stats = rawData.stats as Record<string, unknown>
      if (
        typeof stats.slope === 'number' &&
        Number.isFinite(stats.slope) &&
        typeof stats.intercept === 'number' &&
        Number.isFinite(stats.intercept)
      ) {
        trendline = {
          slope: stats.slope,
          intercept: stats.intercept,
          rSquared:
            typeof stats.rSquared === 'number' && Number.isFinite(stats.rSquared)
              ? stats.rSquared
              : undefined,
        }
      }
    }

    dataGrafik = {
      kind: 'scatter',
      points,
      trendline,
    }
  }

  // Strictly validate against canonical schema
  const validatedDataGrafik = visualizationDataSchema.parse(dataGrafik)

  return canonicalVisualizationSchema.parse({
    jenisGrafik: resolvedKind,
    dataGrafik: validatedDataGrafik,
    labelX,
    labelY,
  })
}

export function normalizeNarrative(
  rawNarasi:
    | {
        bahasa?: string
        isi_narasi?: string
        sumber_narasi?: string
      }
    | null
    | undefined,
): Narasi {
  const bahasa = rawNarasi?.bahasa || 'id'
  const isiNarasi =
    typeof rawNarasi?.isi_narasi === 'string' && rawNarasi.isi_narasi.trim().length > 0
      ? rawNarasi.isi_narasi
      : 'Narasi interpretasi tidak tersedia.'
  const sumberNarasi = rawNarasi?.sumber_narasi === 'fallback' ? 'fallback' : 'ai'
  const isFallback = sumberNarasi === 'fallback'

  return {
    bahasa,
    isiNarasi,
    sumberNarasi,
    isFallback,
  }
}

export function normalizeContohKasus(
  rawKasus:
    | {
        bahasa?: string
        deskripsi_kasus?: string
      }
    | null
    | undefined,
): ContohKasus {
  return {
    bahasa: rawKasus?.bahasa || 'id',
    deskripsiKasus:
      typeof rawKasus?.deskripsi_kasus === 'string' && rawKasus.deskripsi_kasus.trim().length > 0
        ? rawKasus.deskripsi_kasus
        : 'Contoh kasus kontekstual belum tersedia untuk hasil analisis ini.',
  }
}

export function normalizeStatisticalValues(
  jenisUji: JenisAnalisis,
  nilaiStatistik: unknown,
): NilaiStatistik[] {
  return formatStatisticalValues(jenisUji, nilaiStatistik)
}

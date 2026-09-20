import type { NilaiStatistik } from '@/lib/types'

/**
 * Safely format a numerical value to a clean string representation.
 * Prevents NaN, Infinity, undefined, or [object Object] from leaking to the UI.
 * NEVER returns '0' for invalid numbers, because 0 is a mathematically valid value.
 */
export function formatNumberSafely(val: unknown, decimals = 4): string {
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || Number.isNaN(val)) {
      return '-'
    }
    // Round to given decimals and format with standard Indonesian decimal separator
    const rounded = Number(val.toFixed(decimals))
    return rounded.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })
  }

  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (
      trimmed === '' ||
      trimmed === 'NaN' ||
      trimmed === 'Infinity' ||
      trimmed === '-Infinity' ||
      trimmed === 'undefined' ||
      trimmed === 'null' ||
      trimmed.includes('[object')
    ) {
      return '-'
    }
    const parsedNum = Number(trimmed)
    if (!Number.isNaN(parsedNum) && Number.isFinite(parsedNum)) {
      return Number(parsedNum.toFixed(decimals)).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
    }
    return trimmed
  }

  return '-'
}

function formatModeSafely(mode: unknown, modeDescription?: unknown): string {
  if (Array.isArray(mode)) {
    if (mode.length === 0) return 'Tidak ada modus unik'
    const validModes = mode.filter((m) => typeof m === 'number' && Number.isFinite(m))
    if (validModes.length === 0) return 'Tidak ada modus unik'
    return validModes.map((m) => formatNumberSafely(m, 2)).join(', ')
  }
  if (typeof modeDescription === 'string' && modeDescription.trim()) {
    return modeDescription
  }
  if (typeof mode === 'number' && Number.isFinite(mode)) {
    return formatNumberSafely(mode, 2)
  }
  return 'Tidak ada'
}

/**
 * Strongly-typed formatter for statistical results across all 4 supported analysis types.
 * Pure and deterministic.
 */
export function formatStatisticalValues(jenisUji: unknown, statsInput: unknown): NilaiStatistik[] {
  const stats = (typeof statsInput === 'object' && statsInput !== null ? statsInput : {}) as Record<
    string,
    unknown
  >

  switch (jenisUji) {
    case 'Deskriptif': {
      const mean = formatNumberSafely(stats.mean)
      const median = formatNumberSafely(stats.median)
      const mode = formatModeSafely(stats.mode, stats.modeDescription)
      const sd = formatNumberSafely(
        stats.sampleStandardDeviation ?? stats.standardDeviation ?? stats.stdDev,
      )
      const min = formatNumberSafely(stats.minimum ?? stats.min)
      const max = formatNumberSafely(stats.maximum ?? stats.max)
      const n = stats.n !== undefined ? String(stats.n) : '-'
      const variance = formatNumberSafely(stats.variance)
      const range = formatNumberSafely(stats.range)

      return [
        { label: 'Mean', nilai: mean, keterangan: 'Rata-rata sampel' },
        { label: 'Median', nilai: median, keterangan: 'Nilai tengah data terurut' },
        { label: 'Modus', nilai: mode, keterangan: 'Nilai frekuensi kemunculan tertinggi' },
        { label: 'Std. Deviasi', nilai: sd, keterangan: 'Simpangan baku sampel' },
        { label: 'Minimum', nilai: min, keterangan: 'Nilai terendah' },
        { label: 'Maksimum', nilai: max, keterangan: 'Nilai tertinggi' },
        { label: 'Jumlah Sampel (n)', nilai: n, keterangan: 'Banyaknya observasi' },
        {
          label: 'Rentang (Range)',
          nilai: range,
          keterangan: 'Selisih nilai maksimum dan minimum',
        },
        { label: 'Varians', nilai: variance, keterangan: 'Kuadrat simpangan baku' },
      ]
    }

    case 'Uji t': {
      const t = formatNumberSafely(stats.tStatistic ?? stats.t)
      const pVal = stats.pValue ?? stats.p_value
      const isNumericP = typeof pVal === 'number' && Number.isFinite(pVal)
      const pValue = isNumericP ? formatNumberSafely(pVal, 4) : '—'
      const df = formatNumberSafely(stats.degreesOfFreedom ?? stats.df, 2)
      const meanDiff = formatNumberSafely(stats.meanDifference)

      const g1 = stats.group1 as Record<string, unknown> | undefined
      const g2 = stats.group2 as Record<string, unknown> | undefined
      const meanG1 = formatNumberSafely(g1?.mean ?? stats.mean1)
      const meanG2 = formatNumberSafely(g2?.mean ?? stats.mean2)
      const nameG1 = typeof g1?.name === 'string' && g1.name ? g1.name : 'Kelompok 1'
      const nameG2 = typeof g2?.name === 'string' && g2.name ? g2.name : 'Kelompok 2'

      const isSig = isNumericP
        ? pVal < 0.05
          ? 'Signifikan (p < 0,05)'
          : 'Tidak signifikan (p ≥ 0,05)'
        : 'Tingkat signifikansi tidak tersedia'

      return [
        { label: 't-Hitung', nilai: t, keterangan: 'Statistik uji t' },
        { label: 'p-value', nilai: pValue, keterangan: isSig },
        { label: 'Derajat Kebebasan (df)', nilai: df, keterangan: 'Derajat kebebasan uji' },
        {
          label: 'Selisih Mean',
          nilai: meanDiff,
          keterangan: 'Perbedaan rata-rata antar kelompok',
        },
        { label: `Mean ${nameG1}`, nilai: meanG1, keterangan: `Rata-rata ${nameG1}` },
        { label: `Mean ${nameG2}`, nilai: meanG2, keterangan: `Rata-rata ${nameG2}` },
      ]
    }

    case 'Korelasi': {
      const r = formatNumberSafely(stats.r)
      const pVal = stats.pValue ?? stats.p_value
      const isNumericP = typeof pVal === 'number' && Number.isFinite(pVal)
      const pValue = isNumericP ? formatNumberSafely(pVal, 4) : '—'
      const rNum = typeof stats.r === 'number' && Number.isFinite(stats.r) ? stats.r : null
      const r2 = formatNumberSafely(rNum !== null ? rNum * rNum : stats.rSquared, 4)
      const df = stats.degreesOfFreedom !== undefined ? String(stats.degreesOfFreedom) : '-'
      const direction =
        typeof stats.direction === 'string'
          ? stats.direction
          : rNum !== null
            ? rNum > 0
              ? 'Positif'
              : rNum < 0
                ? 'Negatif'
                : 'Nol'
            : '-'
      const strength = typeof stats.strength === 'string' ? stats.strength : '-'
      const n = stats.n !== undefined ? String(stats.n) : '-'

      const pValDesc = isNumericP
        ? pVal < 0.05
          ? 'Signifikan (p < 0,05)'
          : 'Tidak signifikan (p ≥ 0,05)'
        : 'Tingkat signifikansi tidak tersedia'

      return [
        {
          label: 'Koefisien Korelasi (r)',
          nilai: r,
          keterangan: `${strength !== '-' ? strength : 'Hubungan'} (${direction})`,
        },
        {
          label: 'p-value',
          nilai: pValue,
          keterangan: pValDesc,
        },
        {
          label: 'Koefisien Determinasi (R²)',
          nilai: r2,
          keterangan: 'Proporsi variasi yang dijelaskan',
        },
        { label: 'Arah Hubungan', nilai: direction, keterangan: 'Arah korelasi variabel' },
        { label: 'Kekuatan Hubungan', nilai: strength, keterangan: 'Tingkat keeratan korelasi' },
        { label: 'Derajat Kebebasan (df)', nilai: df, keterangan: 'Derajat kebebasan' },
        { label: 'Jumlah Sampel (n)', nilai: n, keterangan: 'Pasangan data yang diuji' },
      ]
    }

    case 'Regresi': {
      const slope = formatNumberSafely(stats.slope ?? stats.a)
      const intercept = formatNumberSafely(stats.intercept ?? stats.b)
      const r2 = formatNumberSafely(stats.rSquared ?? stats.r2)
      const equation =
        typeof stats.equation === 'string' && stats.equation.trim()
          ? stats.equation
          : `Y = ${slope}X + ${intercept}`
      const n = stats.n !== undefined ? String(stats.n) : '-'
      const se =
        stats.standardError !== undefined ? formatNumberSafely(stats.standardError) : undefined

      const items: NilaiStatistik[] = [
        {
          label: 'Koefisien Regresi (Slope)',
          nilai: slope,
          keterangan: 'Perubahan Y terhadap unit X',
        },
        { label: 'Konstanta (Intercept)', nilai: intercept, keterangan: 'Nilai Y saat X = 0' },
        { label: 'Koefisien Determinasi (R²)', nilai: r2, keterangan: 'Variasi terjelaskan model' },
        { label: 'Persamaan Regresi', nilai: equation, keterangan: 'Model linear estimasi' },
        { label: 'Jumlah Sampel (n)', nilai: n, keterangan: 'Total pasangan data' },
      ]

      if (se) {
        items.push({ label: 'Standar Error', nilai: se, keterangan: 'Kesalahan baku estimasi' })
      }

      return items
    }

    default: {
      return [{ label: 'STATUS', nilai: 'Selesai', keterangan: 'Kalkulasi berhasil diselesaikan' }]
    }
  }
}

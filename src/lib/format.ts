// Formatting helpers shared across the app.

const bulan = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

// Formats an ISO date (YYYY-MM-DD) into readable Indonesian, e.g. "12 September 2026".
export function formatTanggal(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return `${day} ${bulan[month - 1]} ${year}`
}

// Today's date as an ISO string (YYYY-MM-DD).
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatNumber(val?: number, decimals = 2): string {
  if (val === undefined || val === null || Number.isNaN(val)) return '-'
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return 'Tanggal tidak valid'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

import type { NormalizedDataset, ParsedColumn } from './types'

/**
 * Splits a CSV line taking into account quoted fields and commas/semicolons inside quotes.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Detects the most probable delimiter from the first few lines.
 */
function detectDelimiter(text: string): string {
  const firstLines = text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .slice(0, 5)
  if (firstLines.length === 0) return ','

  const commaCount = firstLines.reduce((acc, l) => acc + (l.match(/,/g) || []).length, 0)
  const semiCount = firstLines.reduce((acc, l) => acc + (l.match(/;/g) || []).length, 0)
  const tabCount = firstLines.reduce((acc, l) => acc + (l.match(/\t/g) || []).length, 0)

  if (semiCount > commaCount && semiCount > tabCount) return ';'
  if (tabCount > commaCount && tabCount > semiCount) return '\t'
  return ','
}

/**
 * Parses raw CSV string into a NormalizedDataset (FR 03 / TC-03).
 */
export function parseCsv(csvContent: string, fileName = 'data.csv'): NormalizedDataset {
  if (!csvContent || csvContent.trim().length === 0) {
    throw new Error('Berkas CSV kosong; tidak ada data yang dapat dianalisis.')
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    throw new Error('Berkas CSV tidak memuat baris data yang valid.')
  }

  const delimiter = detectDelimiter(csvContent)
  const parsedRows = lines.map((l) => parseCsvLine(l, delimiter))

  if (parsedRows.length === 0) {
    throw new Error('Gagal menguraikan baris CSV.')
  }

  const firstRow = parsedRows[0] ?? []
  if (firstRow.length === 0) {
    throw new Error('Baris pertama CSV kosong.')
  }

  // Determine whether the first row is a header
  const isHeaderRow = firstRow.some((cell) => Number.isNaN(Number(cell.replace(/,/g, '.'))))
  let headers: string[]
  let dataRows: string[][]

  if (isHeaderRow) {
    headers = firstRow.map((h, idx) => (h.trim() ? h.trim() : `Kolom_${idx + 1}`))
    dataRows = parsedRows.slice(1)
  } else {
    headers = firstRow.map((_, idx) => `Kolom_${idx + 1}`)
    dataRows = parsedRows
  }

  const colCount = headers.length
  const rowCount = dataRows.length

  const columns: ParsedColumn[] = headers.map((name, colIdx) => {
    const rawValues = dataRows.map((row) => row[colIdx] ?? '')
    let validNumeric = 0
    let missing = 0

    const numericValues = rawValues.map((val) => {
      const trimmed = val.trim()
      if (
        trimmed === '' ||
        trimmed === '-' ||
        trimmed.toLowerCase() === 'null' ||
        trimmed.toLowerCase() === 'na'
      ) {
        missing++
        return null
      }
      // Support comma decimal separator (e.g. 3,14 -> 3.14)
      const normalized = trimmed.replace(',', '.')
      const num = Number(normalized)
      if (Number.isFinite(num)) {
        validNumeric++
        return num
      }
      missing++
      return null
    })

    const isNumeric = validNumeric > 0 && validNumeric >= rowCount * 0.5

    return {
      name,
      values: numericValues,
      isNumeric,
      totalRows: rowCount,
      validNumericCount: validNumeric,
      missingCount: missing,
    }
  })

  return {
    fileName,
    format: 'csv',
    headers,
    rawRows: dataRows,
    columns,
    rowCount,
    columnCount: colCount,
  }
}

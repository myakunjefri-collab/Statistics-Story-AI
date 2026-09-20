import * as XLSX from 'xlsx'
import type { NormalizedDataset, ParsedColumn } from './types'

/**
 * Parses raw Excel file buffer (.xlsx / .xls) into a NormalizedDataset (FR 04).
 */
export function parseExcel(
  buffer: ArrayBuffer | Uint8Array,
  fileName = 'data.xlsx',
): NormalizedDataset {
  if (!buffer || buffer.byteLength === 0) {
    throw new Error('Berkas Excel kosong; tidak ada data yang dapat dibaca.')
  }

  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch (err) {
    throw new Error(
      `Gagal membaca berkas Excel: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const sheetNames = workbook.SheetNames
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('Berkas Excel tidak memiliki lembar kerja (worksheet).')
  }

  const firstSheetName = sheetNames[0]
  if (!firstSheetName) {
    throw new Error('Nama sheet pertama tidak ditemukan.')
  }

  const worksheet = workbook.Sheets[firstSheetName]
  if (!worksheet) {
    throw new Error(`Lembar kerja "${firstSheetName}" kosong atau tidak dapat diakses.`)
  }

  // Convert worksheet to 2D array of values
  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    defval: null,
    raw: false,
  })

  const validRows = rawRows.filter((r) => Array.isArray(r) && r.some((c) => c !== null && c !== ''))
  if (validRows.length === 0) {
    throw new Error('Lembar kerja Excel tidak memuat baris data yang valid.')
  }

  const firstRow = validRows[0] ?? []
  const isHeaderRow = firstRow.some((cell) => {
    if (typeof cell === 'string') {
      return Number.isNaN(Number(cell.replace(/,/g, '.')))
    }
    return false
  })

  let headers: string[]
  let dataRows: (string | number | null)[][]

  if (isHeaderRow) {
    headers = firstRow.map((cell, idx) => (cell ? String(cell).trim() : `Kolom_${idx + 1}`))
    dataRows = validRows.slice(1)
  } else {
    headers = firstRow.map((_, idx) => `Kolom_${idx + 1}`)
    dataRows = validRows
  }

  const colCount = headers.length
  const rowCount = dataRows.length

  const columns: ParsedColumn[] = headers.map((name, colIdx) => {
    let validNumeric = 0
    let missing = 0

    const numericValues = dataRows.map((row) => {
      const cell = row[colIdx]
      if (cell === null || cell === undefined || cell === '') {
        missing++
        return null
      }

      if (typeof cell === 'number') {
        if (Number.isFinite(cell)) {
          validNumeric++
          return cell
        }
        missing++
        return null
      }

      const str = String(cell).trim().replace(',', '.')
      const num = Number(str)
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
    format: 'xlsx',
    headers,
    rawRows: dataRows,
    columns,
    rowCount,
    columnCount: colCount,
  }
}

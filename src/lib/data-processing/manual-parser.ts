import { parseCsv } from './csv-parser'
import type { NormalizedDataset, ParsedColumn } from './types'

/**
 * Parses raw text input from manual textarea (FR 02 / TC-05).
 * Supports tabular CSV-like format or single-row comma/space-separated numbers.
 */
export function parseManualInput(rawText: string): NormalizedDataset {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Input teks manual kosong; mohon masukkan data numerik.')
  }

  const trimmed = rawText.trim()

  // Check if it's multi-line or contains comma/tab separated columns
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // Case 1: Single line of comma or space separated numbers
  if (
    lines.length === 1 &&
    !lines[0]?.includes('\t') &&
    ((lines[0]?.match(/,/g) || []).length > 0 || (lines[0]?.match(/\s+/g) || []).length > 0)
  ) {
    const tokens = (lines[0] ?? '').split(/[\s,]+/).filter((t) => t.length > 0)
    const values: (number | null)[] = []
    let validCount = 0

    for (const t of tokens) {
      const num = Number(t)
      if (Number.isFinite(num)) {
        values.push(num)
        validCount++
      } else {
        values.push(null)
      }
    }

    if (validCount === 0) {
      throw new Error('Tidak ditemukan nilai numerik yang valid pada input manual.')
    }

    const column: ParsedColumn = {
      name: 'Nilai',
      values,
      isNumeric: true,
      totalRows: values.length,
      validNumericCount: validCount,
      missingCount: values.length - validCount,
    }

    return {
      format: 'manual',
      headers: ['Nilai'],
      rawRows: values.map((v) => [v]),
      columns: [column],
      rowCount: values.length,
      columnCount: 1,
    }
  }

  // Case 2: Multi-line tabular format (e.g. headers and rows)
  try {
    const dataset = parseCsv(trimmed, 'manual_input.txt')
    dataset.format = 'manual'
    return dataset
  } catch {
    // Fallback: extract all numbers in the entire string as a single column
    const allNumbers = trimmed.match(/-?\d+(?:\.\d+)?/g)
    if (!allNumbers || allNumbers.length === 0) {
      throw new Error('Format input manual tidak valid atau tidak memuat angka.')
    }

    const values = allNumbers.map((n) => Number(n)).filter(Number.isFinite)
    const column: ParsedColumn = {
      name: 'Nilai',
      values,
      isNumeric: true,
      totalRows: values.length,
      validNumericCount: values.length,
      missingCount: 0,
    }

    return {
      format: 'manual',
      headers: ['Nilai'],
      rawRows: values.map((v) => [v]),
      columns: [column],
      rowCount: values.length,
      columnCount: 1,
    }
  }
}

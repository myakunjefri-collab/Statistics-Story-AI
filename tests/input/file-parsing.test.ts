import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/lib/data-processing/csv-parser'
import { parseManualInput } from '@/lib/data-processing/manual-parser'
import { validateDatasetForAnalysis } from '@/lib/data-processing/data-validator'
import { parseExcel } from '@/lib/data-processing/excel-parser'
import * as XLSX from 'xlsx'

describe('Data Ingestion Engine (TC03, TC04, TC05)', () => {
  it('TC03: Upload berkas CSV valid', () => {
    const validCsv = `jam_belajar,nilai_ujian\n2,55\n4,68\n6,75\n8,88\n10,95`
    const dataset = parseCsv(validCsv)

    expect(dataset.rowCount).toBe(5)
    expect(dataset.headers).toEqual(['jam_belajar', 'nilai_ujian'])
    expect(dataset.columns[0]?.values[0]).toBe(2)
    expect(dataset.columns[1]?.values[0]).toBe(55)

    // Layer A & B Validation
    const validation = validateDatasetForAnalysis(dataset, 'korelasi', {
      columnX: 'jam_belajar',
      columnY: 'nilai_ujian',
    })

    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('TC04: Upload berkas tidak valid (format tidak didukung, e.g. PDF atau teks korup)', () => {
    // Non-tabular text or missing delimiter
    const malformedText = `This is a PDF header or unstructured text with no clear rows`
    const dataset = parseCsv(malformedText)

    // Dataset with only 1 column and 0 rows or inconsistent data
    const validation = validateDatasetForAnalysis(dataset, 'korelasi')
    expect(validation.isValid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('TC05: Input data manual (data numerik lengkap)', () => {
    const manualData = `jam_belajar,nilai\n2,58\n4,63\n6,70\n8,85\n10,92`
    const dataset = parseManualInput(manualData)

    expect(dataset.rowCount).toBe(5)
    expect(dataset.headers).toEqual(['jam_belajar', 'nilai'])

    // Validate for regression
    const regValidation = validateDatasetForAnalysis(dataset, 'regresi', {
      columnX: 'jam_belajar',
      columnY: 'nilai',
    })
    expect(regValidation.isValid).toBe(true)
  })

  it('Excel parser (.xlsx/.xls) parses binary buffer correctly', () => {
    // Create a real Excel workbook in memory with xlsx
    const ws = XLSX.utils.aoa_to_sheet([
      ['kelompok', 'skor'],
      ['Kontrol', 65],
      ['Kontrol', 70],
      ['Kontrol', 72],
      ['Eksperimen', 80],
      ['Eksperimen', 85],
      ['Eksperimen', 88],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const dataset = parseExcel(buffer)
    expect(dataset.rowCount).toBe(6)
    expect(dataset.headers).toEqual(['kelompok', 'skor'])

    // Validate for t-test
    const tTestVal = validateDatasetForAnalysis(dataset, 'uji_t', {
      column1: 'kelompok',
      column2: 'skor',
    })
    expect(tTestVal.isValid).toBe(true)
  })

  it('Rejects CSV with empty values or non-numeric entries on calculation columns', () => {
    const dirtyCsv = `x,y\n1,10\n2,tidak_ada\n3,30`
    const dataset = parseCsv(dirtyCsv)

    const yCol = dataset.columns.find((c) => c.name === 'y')
    expect(yCol?.missingCount).toBe(1)
  })
})

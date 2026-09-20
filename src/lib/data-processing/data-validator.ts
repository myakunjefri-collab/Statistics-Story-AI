import type {
  ExtractedDataShape,
  LayerAValidationResult,
  LayerBValidationResult,
  NormalizedDataset,
} from './types'

/**
 * Layer A: Generic Dataset Validation (Sebelum memilih analisis)
 * Memeriksa integritas tabular, keberadaan data, NaN, Infinity, dan batasan baris.
 */
export function validateLayerA(dataset: NormalizedDataset): LayerAValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!dataset) {
    return { isValid: false, errors: ['Dataset tidak ditemukan.'], warnings }
  }

  if (dataset.rowCount === 0) {
    errors.push('Dataset tidak memuat baris data.')
  }

  if (dataset.columnCount === 0) {
    errors.push('Dataset tidak memiliki kolom.')
  }

  if (dataset.rowCount > 10000) {
    errors.push('Jumlah baris melebihi batas prototipe (maksimal 10.000 baris).')
  }

  const numericCols = dataset.columns.filter((c) => c.isNumeric)
  if (numericCols.length === 0) {
    errors.push('Tidak ditemukan kolom numerik yang valid pada dataset.')
  }

  for (const col of dataset.columns) {
    if (col.missingCount > 0) {
      warnings.push(`Kolom "${col.name}" memiliki ${col.missingCount} baris kosong/tidak valid.`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    dataset,
  }
}

/**
 * Layer B: Analysis-Specific Validation
 * Memvalidasi prasyarat matematis unik untuk masing-masing jenis analisis statistik.
 */
export function validateLayerB(
  analysisType: 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi',
  dataset: NormalizedDataset,
  selectedColumns?: {
    column1?: string
    column2?: string
    groupColumn?: string
    valueColumn?: string
  },
): LayerBValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const findCol = (name?: string) => {
    if (!name) return undefined
    return dataset.columns.find((c) => c.name.toLowerCase() === name.toLowerCase())
  }

  switch (analysisType) {
    case 'Deskriptif': {
      const col = findCol(selectedColumns?.column1) ?? dataset.columns.find((c) => c.isNumeric)
      if (!col) {
        errors.push('Pilih satu kolom numerik untuk analisis statistik deskriptif.')
        return { isValid: false, errors, warnings }
      }

      const values = col.values.filter((v): v is number => v !== null && Number.isFinite(v))
      if (values.length < 1) {
        errors.push(`Kolom "${col.name}" tidak memuat data numerik yang valid.`)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedData: { kind: 'descriptive', numericVector: values },
      }
    }

    case 'Uji t': {
      // Skenario A: 1 grouping column (kategorikal) + 1 value column (numerik)
      const groupCol =
        findCol(selectedColumns?.groupColumn) || dataset.columns.find((c) => !c.isNumeric)
      const valCol =
        findCol(selectedColumns?.valueColumn) ||
        (selectedColumns?.column2 && selectedColumns.column2 !== groupCol?.name
          ? findCol(selectedColumns.column2)
          : undefined) ||
        dataset.columns.find((c) => c.isNumeric)

      if (groupCol && valCol && groupCol.name !== valCol.name) {
        const groupMap = new Map<string, number[]>()
        const groupColIdx = dataset.headers.indexOf(groupCol.name)
        const valColIdx = dataset.headers.indexOf(valCol.name)

        if (groupColIdx !== -1 && valColIdx !== -1) {
          for (const row of dataset.rawRows) {
            const grpKey = String(row[groupColIdx] ?? '').trim()
            const val = Number(row[valColIdx])
            if (grpKey && !Number.isNaN(val) && Number.isFinite(val)) {
              if (!groupMap.has(grpKey)) groupMap.set(grpKey, [])
              groupMap.get(grpKey)?.push(val)
            }
          }

          if (groupMap.size === 2) {
            const keys = Array.from(groupMap.keys())
            const grp1Name = keys[0] ?? 'Kelompok 1'
            const grp2Name = keys[1] ?? 'Kelompok 2'
            const vals1 = groupMap.get(grp1Name) ?? []
            const vals2 = groupMap.get(grp2Name) ?? []

            if (vals1.length < 2 || vals2.length < 2) {
              errors.push('Setiap kelompok uji t harus memiliki minimal 2 sampel data numerik.')
            }

            return {
              isValid: errors.length === 0,
              errors,
              warnings,
              extractedData: {
                kind: 't-test',
                group1: { name: grp1Name, values: vals1 },
                group2: { name: grp2Name, values: vals2 },
              },
            }
          }
        }
      }

      // Skenario B: Dua kolom numerik terpisah (Kelompok 1 & Kelompok 2)
      const col1 = findCol(selectedColumns?.column1)
      const col2 = findCol(selectedColumns?.column2)

      if (col1 && col2 && col1.name !== col2.name) {
        const vals1 = col1.values.filter((v): v is number => v !== null && Number.isFinite(v))
        const vals2 = col2.values.filter((v): v is number => v !== null && Number.isFinite(v))

        if (vals1.length < 2) {
          errors.push(
            `Kelompok "${col1.name}" membutuhkan minimal 2 sampel data (ditemukan ${vals1.length}).`,
          )
        }
        if (vals2.length < 2) {
          errors.push(
            `Kelompok "${col2.name}" membutuhkan minimal 2 sampel data (ditemukan ${vals2.length}).`,
          )
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          extractedData: {
            kind: 't-test',
            group1: { name: col1.name, values: vals1 },
            group2: { name: col2.name, values: vals2 },
          },
        }
      }

      // Default fallback: ambil dua kolom numerik pertama jika tidak ditentukan
      const numericCols = dataset.columns.filter((c) => c.isNumeric)
      if (numericCols.length < 2) {
        errors.push('Uji t membutuhkan minimal 2 kelompok/kolom data numerik.')
        return { isValid: false, errors, warnings }
      }

      const c1 = numericCols[0]
      const c2 = numericCols[1]
      if (!c1 || !c2) {
        errors.push('Gagal mengekstrak kolom data untuk Uji t.')
        return { isValid: false, errors, warnings }
      }

      const v1 = c1.values.filter((v): v is number => v !== null && Number.isFinite(v))
      const v2 = c2.values.filter((v): v is number => v !== null && Number.isFinite(v))

      if (v1.length < 2 || v2.length < 2) {
        errors.push('Setiap kelompok uji t harus memiliki minimal 2 sampel numerik.')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedData: {
          kind: 't-test',
          group1: { name: c1.name, values: v1 },
          group2: { name: c2.name, values: v2 },
        },
      }
    }

    case 'Korelasi': {
      const colX = findCol(selectedColumns?.column1)
      const colY = findCol(selectedColumns?.column2)

      const numCols = dataset.columns.filter((c) => c.isNumeric)
      const xCol = colX ?? numCols[0]
      const yCol = colY ?? numCols[1]

      if (!xCol || !yCol || xCol.name === yCol.name) {
        errors.push('Analisis korelasi membutuhkan 2 variabel numerik yang berbeda.')
        return { isValid: false, errors, warnings }
      }

      // Extract paired rows where both values are non-null
      const pairX: number[] = []
      const pairY: number[] = []
      const maxRows = Math.min(xCol.values.length, yCol.values.length)

      for (let i = 0; i < maxRows; i++) {
        const valX = xCol.values[i]
        const valY = yCol.values[i]
        if (
          typeof valX === 'number' &&
          Number.isFinite(valX) &&
          typeof valY === 'number' &&
          Number.isFinite(valY)
        ) {
          pairX.push(valX)
          pairY.push(valY)
        }
      }

      if (pairX.length < 3) {
        errors.push(
          `Korelasi membutuhkan minimal 3 pasangan data numerik lengkap (ditemukan ${pairX.length}).`,
        )
      }

      // Check for zero-variance
      const meanX = pairX.length > 0 ? pairX.reduce((a, b) => a + b, 0) / pairX.length : 0
      const meanY = pairY.length > 0 ? pairY.reduce((a, b) => a + b, 0) / pairY.length : 0
      const varX = pairX.reduce((acc, v) => acc + (v - meanX) ** 2, 0)
      const varY = pairY.reduce((acc, v) => acc + (v - meanY) ** 2, 0)

      if (pairX.length >= 3 && (varX === 0 || varY === 0)) {
        errors.push('Varians pada salah satu variabel bernilai nol; korelasi tidak dapat dihitung.')
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedData: { kind: 'bivariate', x: pairX, y: pairY },
      }
    }

    case 'Regresi': {
      const colX = findCol(selectedColumns?.column1)
      const colY = findCol(selectedColumns?.column2)

      const numCols = dataset.columns.filter((c) => c.isNumeric)
      const xCol = colX ?? numCols[0]
      const yCol = colY ?? numCols[1]

      if (!xCol || !yCol || xCol.name === yCol.name) {
        errors.push(
          'Analisis regresi membutuhkan 1 variabel independen (X) dan 1 variabel dependen (Y).',
        )
        return { isValid: false, errors, warnings }
      }

      const pairX: number[] = []
      const pairY: number[] = []
      const maxRows = Math.min(xCol.values.length, yCol.values.length)

      for (let i = 0; i < maxRows; i++) {
        const valX = xCol.values[i]
        const valY = yCol.values[i]
        if (
          typeof valX === 'number' &&
          Number.isFinite(valX) &&
          typeof valY === 'number' &&
          Number.isFinite(valY)
        ) {
          pairX.push(valX)
          pairY.push(valY)
        }
      }

      if (pairX.length < 3) {
        errors.push(
          `Regresi membutuhkan minimal 3 pasangan data numerik lengkap (ditemukan ${pairX.length}).`,
        )
      }

      const meanX = pairX.length > 0 ? pairX.reduce((a, b) => a + b, 0) / pairX.length : 0
      const varX = pairX.reduce((acc, v) => acc + (v - meanX) ** 2, 0)

      if (pairX.length >= 3 && varX === 0) {
        errors.push(
          'Varians variabel independen (X) bernilai nol; garis regresi linier vertikal tidak dapat dimodelkan.',
        )
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        extractedData: { kind: 'bivariate', x: pairX, y: pairY },
      }
    }
  }
}

export function validateDatasetForAnalysis(
  dataset: NormalizedDataset,
  analysisType: string,
  selectedColumns?: {
    column1?: string
    column2?: string
    columnX?: string
    columnY?: string
    groupColumn?: string
    valueColumn?: string
  },
): { isValid: boolean; errors: string[]; warnings: string[]; extractedData?: ExtractedDataShape } {
  const layerA = validateLayerA(dataset)
  if (!layerA.isValid) {
    return { isValid: false, errors: layerA.errors, warnings: layerA.warnings }
  }

  const normalizedTypeMap: Record<string, 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'> = {
    deskriptif: 'Deskriptif',
    Deskriptif: 'Deskriptif',
    uji_t: 'Uji t',
    'Uji t': 'Uji t',
    korelasi: 'Korelasi',
    Korelasi: 'Korelasi',
    regresi: 'Regresi',
    Regresi: 'Regresi',
  }

  const mappedType = normalizedTypeMap[analysisType]
  if (!mappedType) {
    return {
      isValid: false,
      errors: [`Jenis analisis "${analysisType}" tidak valid atau tidak didukung.`],
      warnings: layerA.warnings,
    }
  }

  const layerB = validateLayerB(mappedType, dataset, {
    column1: selectedColumns?.column1 || selectedColumns?.columnX,
    column2: selectedColumns?.column2 || selectedColumns?.columnY,
    groupColumn: selectedColumns?.groupColumn,
  })

  return {
    isValid: layerB.isValid,
    errors: [...layerA.errors, ...layerB.errors],
    warnings: [...layerA.warnings, ...layerB.warnings],
    extractedData: layerB.extractedData,
  }
}

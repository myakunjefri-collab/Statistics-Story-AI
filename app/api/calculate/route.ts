import { type NextRequest, NextResponse } from 'next/server'
import { generateInterpretationWithFallback } from '@/lib/ai'
import { getSessionFromRequest } from '@/lib/auth/session'
import {
  type NormalizedDataset,
  parseCsv,
  parseExcel,
  parseManualInput,
  validateLayerA,
  validateLayerB,
} from '@/lib/data-processing'
import {
  type RegressionResult,
  type StatisticalResult,
  type TTestResult,
  calculateCorrelation,
  calculateDescriptive,
  calculateRegression,
  calculateTTest,
} from '@/lib/statistics'
import { AnalysisRepository } from '@/lib/storage/repositories/analysis-repository'
import {
  type VisualizationData,
  calculateRequestSchema,
  visualizationDataSchema,
} from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // 1. Strict Server-Side Authentication Verification (NFR 01)
    const session = getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Autentikasi diperlukan. Silakan masuk terlebih dahulu.' },
        { status: 401 },
      )
    }

    const userId = session.userId

    // 2. Parse Raw JSON & Validate with Canonical Request Schema (Phase 2 & Section G)
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Format JSON permintaan tidak valid.' },
        { status: 400 },
      )
    }

    const parseResult = calculateRequestSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasi skema permintaan gagal.',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const {
      namaAnalisis,
      jenisAnalisis,
      formatData,
      rawContent,
      fileBase64,
      fileName,
      selectedColumns,
      language,
      dataset: preParsedDataset,
    } = parseResult.data

    // 3. Parse Raw Content into Normalized Dataset
    let normalizedDataset: NormalizedDataset | undefined =
      typeof preParsedDataset === 'object' && preParsedDataset !== null
        ? (preParsedDataset as NormalizedDataset)
        : undefined
    if (!normalizedDataset) {
      if (formatData === 'xlsx') {
        if (!fileBase64) {
          return NextResponse.json(
            { success: false, message: 'File Excel base64 tidak boleh kosong.' },
            { status: 400 },
          )
        }
        const buffer = Buffer.from(fileBase64, 'base64')
        normalizedDataset = parseExcel(buffer, fileName || 'uploaded_data.xlsx')
      } else {
        let content = rawContent
        if (!content && fileBase64) {
          content = Buffer.from(fileBase64, 'base64').toString('utf-8')
        }
        if (!content || content.trim().length === 0) {
          return NextResponse.json(
            { success: false, message: 'Konten data masukan tidak boleh kosong.' },
            { status: 400 },
          )
        }

        if (formatData === 'csv') {
          normalizedDataset = parseCsv(content, fileName || 'uploaded_data.csv')
        } else if (formatData === 'manual') {
          normalizedDataset = parseManualInput(content)
        } else {
          return NextResponse.json(
            { success: false, message: `Format data "${formatData}" tidak didukung.` },
            { status: 400 },
          )
        }
      }
    }

    // 4. Layer A: Generic Tabular Validation
    const valA = validateLayerA(normalizedDataset)
    if (!valA.isValid) {
      return NextResponse.json(
        { success: false, message: 'Validasi data tabular gagal.', errors: valA.errors },
        { status: 422 },
      )
    }

    // 5. Layer B: Analysis-Specific Validation
    const valB = validateLayerB(jenisAnalisis, normalizedDataset, selectedColumns)
    if (!valB.isValid || !valB.extractedData) {
      return NextResponse.json(
        { success: false, message: 'Prasyarat data untuk jenis analisis tidak terpenuhi.', errors: valB.errors },
        { status: 422 },
      )
    }

    // 6. Execute Pure Mathematical Statistical Engine
    let statsResult: StatisticalResult
    let pValue: number | null = null

    try {
      switch (jenisAnalisis) {
        case 'Deskriptif': {
          const vector = valB.extractedData.numericVector ?? []
          statsResult = calculateDescriptive(vector)
          break
        }
        case 'Uji t': {
          const g1 = valB.extractedData.group1?.values ?? []
          const g2 = valB.extractedData.group2?.values ?? []
          const res = calculateTTest(g1, g2, {
            group1Name: valB.extractedData.group1?.name,
            group2Name: valB.extractedData.group2?.name,
          })
          statsResult = res
          pValue = res.pValue
          break
        }
        case 'Korelasi': {
          const x = valB.extractedData.x ?? []
          const y = valB.extractedData.y ?? []
          const res = calculateCorrelation(x, y)
          statsResult = res
          pValue = res.pValue
          break
        }
        case 'Regresi': {
          const x = valB.extractedData.x ?? []
          const y = valB.extractedData.y ?? []
          statsResult = calculateRegression(x, y)
          break
        }
        default:
          return NextResponse.json(
            { success: false, message: `Jenis analisis "${jenisAnalisis}" tidak didukung.` },
            { status: 400 },
          )
      }
    } catch (mathErr) {
      return NextResponse.json(
        { success: false, message: mathErr instanceof Error ? mathErr.message : 'Kesalahan kalkulasi statistik.' },
        { status: 422 },
      )
    }

    // 7. Invoke AI Provider OUTSIDE Database Transaction (NFR 05 / Phase 9)
    const aiOutput = await generateInterpretationWithFallback({
      analysisType: jenisAnalisis,
      statisticalResult: statsResult,
      language,
      datasetSummary: {
        rowCount: normalizedDataset.rowCount,
        columnCount: normalizedDataset.columnCount,
        variables: normalizedDataset.headers,
      },
    })

    // 8. Prepare Visualization Metadata (Canonical Schema)
    let jenisGrafik: 'histogram' | 'bar' | 'scatter' | 'regression' = 'histogram'
    let dataGrafik: VisualizationData
    let labelX = 'Variabel X'
    let labelY = 'Variabel Y'

    if (jenisAnalisis === 'Deskriptif') {
      jenisGrafik = 'histogram'
      const values = valB.extractedData.numericVector ?? []
      dataGrafik = {
        kind: 'histogram',
        values,
      }
      labelX = selectedColumns?.valueColumn || selectedColumns?.column1 || 'Nilai'
      labelY = 'Frekuensi'
    } else if (jenisAnalisis === 'Uji t') {
      jenisGrafik = 'bar'
      const tRes = statsResult as TTestResult
      dataGrafik = {
        kind: 'bar',
        groups: [
          {
            groupName: tRes.group1.name || 'Kelompok 1',
            mean: tRes.group1.mean,
            sd: tRes.group1.standardDeviation,
            n: tRes.group1.n,
          },
          {
            groupName: tRes.group2.name || 'Kelompok 2',
            mean: tRes.group2.mean,
            sd: tRes.group2.standardDeviation,
            n: tRes.group2.n,
          },
        ],
      }
      labelX = selectedColumns?.groupColumn || 'Kelompok'
      labelY = selectedColumns?.valueColumn || selectedColumns?.column2 || 'Rata-rata'
    } else if (jenisAnalisis === 'Korelasi') {
      jenisGrafik = 'scatter'
      const xs = valB.extractedData.x ?? []
      const ys = valB.extractedData.y ?? []
      const points: { x: number; y: number }[] = []
      const len = Math.min(xs.length, ys.length)
      for (let i = 0; i < len; i++) {
        const px = xs[i]
        const py = ys[i]
        if (
          typeof px === 'number' &&
          typeof py === 'number' &&
          Number.isFinite(px) &&
          Number.isFinite(py)
        ) {
          points.push({ x: px, y: py })
        }
      }
      dataGrafik = {
        kind: 'scatter',
        points,
      }
      labelX = selectedColumns?.columnX || selectedColumns?.column1 || 'Variabel X'
      labelY = selectedColumns?.columnY || selectedColumns?.column2 || 'Variabel Y'
    } else if (jenisAnalisis === 'Regresi') {
      jenisGrafik = 'regression'
      const regRes = statsResult as RegressionResult
      const xs = valB.extractedData.x ?? []
      const ys = valB.extractedData.y ?? []
      const points: { x: number; y: number }[] = []
      const len = Math.min(xs.length, ys.length)
      for (let i = 0; i < len; i++) {
        const px = xs[i]
        const py = ys[i]
        if (
          typeof px === 'number' &&
          typeof py === 'number' &&
          Number.isFinite(px) &&
          Number.isFinite(py)
        ) {
          points.push({ x: px, y: py })
        }
      }
      dataGrafik = {
        kind: 'scatter',
        points,
        trendline: {
          slope: regRes.slope,
          intercept: regRes.intercept,
          rSquared: regRes.rSquared,
        },
      }
      labelX = selectedColumns?.columnX || selectedColumns?.column1 || 'Variabel Bebas (X)'
      labelY = selectedColumns?.columnY || selectedColumns?.column2 || 'Variabel Terikat (Y)'
    } else {
      dataGrafik = { kind: 'histogram', values: [] }
    }

    // Validate visualization payload using Zod before database persistence (Section F.5)
    const validatedDataGrafik = visualizationDataSchema.parse(dataGrafik)

    // 9. Execute Atomic Database Transaction (POST-AI Processing)
    const savedRecord = await AnalysisRepository.saveAtomic(
      {
        analisis: {
          id_pengguna: userId,
          jenis_analisis: jenisAnalisis,
          nama_analisis: namaAnalisis,
          tanggal: new Date(),
          status: 'Selesai',
        },
        dataset: {
          nama_file: normalizedDataset.fileName || 'input_data',
          format_data: formatData,
          data_konten: normalizedDataset.rawRows,
          sumber_input: 'web_form',
        },
        hasil: {
          jenis_uji: jenisAnalisis,
          nilai_statistik: statsResult,
          p_value: pValue,
        },
        narasi: {
          bahasa: aiOutput.language,
          isi_narasi: aiOutput.narrative,
          sumber_narasi: aiOutput.sumber,
        },
        visualisasi: {
          jenis_grafik: jenisGrafik,
          data_grafik: {
            ...validatedDataGrafik,
            labelX,
            labelY,
          },
        },
        contohKasus: {
          deskripsi_kasus: aiOutput.exampleCase,
          bahasa: aiOutput.language,
        },
      },
      userId,
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Analisis statistik dan interpretasi berhasil diselesaikan.',
        analysisId: savedRecord.analisis.id_analisis,
        result: statsResult,
        narrative: aiOutput.narrative,
        data: savedRecord,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[API Calculate Error]', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan internal server saat kalkulasi.',
      },
      { status: 500 },
    )
  }
}

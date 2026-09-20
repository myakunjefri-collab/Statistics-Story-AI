import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseCsv } from '../src/lib/data-processing/csv-parser'
import { formatStatisticalValues } from '../src/lib/result/format-statistics'
import { normalizeVisualization } from '../src/lib/result/normalizers'
import {
  calculateCorrelation,
  calculateDescriptive,
  calculateRegression,
  calculateTTest,
} from '../src/lib/statistics'

export interface BenchmarkMetric {
  name: string
  level: 'Pure Engine' | 'Application Pipeline'
  datasetSize: number
  iterations: number
  warmupIterations: number
  minMs: number
  maxMs: number
  avgMs: number
  medianMs: number
  thresholdMs: number
  passed: boolean
}

function generateDeterministicData(size: number, seed = 42): number[] {
  const result: number[] = new Array(size)
  let s = seed
  for (let i = 0; i < size; i++) {
    // Linear congruential generator for deterministic pseudorandom numbers
    s = (s * 1664525 + 1013904223) % 4294967296
    result[i] = (s / 4294967296) * 100
  }
  return result
}

function runBenchmark(
  name: string,
  level: 'Pure Engine' | 'Application Pipeline',
  fn: () => void,
  datasetSize: number,
  iterations = 30,
  warmup = 5,
  thresholdMs = 5000,
): BenchmarkMetric {
  // Warmup
  for (let i = 0; i < warmup; i++) {
    fn()
  }

  const times: number[] = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }

  times.sort((a, b) => a - b)
  const minMs = times[0] ?? 0
  const maxMs = times[times.length - 1] ?? 0
  const avgMs = times.reduce((sum, t) => sum + t, 0) / times.length
  const mid = Math.floor(times.length / 2)
  const medianMs =
    times.length % 2 !== 0 ? (times[mid] ?? 0) : ((times[mid - 1] ?? 0) + (times[mid] ?? 0)) / 2

  return {
    name,
    level,
    datasetSize,
    iterations,
    warmupIterations: warmup,
    minMs: Number(minMs.toFixed(4)),
    maxMs: Number(maxMs.toFixed(4)),
    avgMs: Number(avgMs.toFixed(4)),
    medianMs: Number(medianMs.toFixed(4)),
    thresholdMs,
    passed: medianMs <= thresholdMs,
  }
}

export function runAllBenchmarks(): BenchmarkMetric[] {
  const n = 1000
  const data1 = generateDeterministicData(n, 123)
  const data2 = generateDeterministicData(n, 456)
  const halfN = Math.floor(n / 2)
  const group1 = data1.slice(0, halfN)
  const group2 = data1.slice(halfN)

  // Level A: Pure Engine Benchmarks
  const pureResults: BenchmarkMetric[] = [
    runBenchmark(
      'Statistik Deskriptif (FR07)',
      'Pure Engine',
      () => calculateDescriptive(data1),
      n,
    ),
    runBenchmark(
      'Uji t Dua Sampel Welch (FR08)',
      'Pure Engine',
      () => calculateTTest(group1, group2),
      n,
    ),
    runBenchmark(
      'Korelasi Pearson (FR09)',
      'Pure Engine',
      () => calculateCorrelation(data1, data2),
      n,
    ),
    runBenchmark(
      'Regresi Linier Sederhana OLS (FR10)',
      'Pure Engine',
      () => calculateRegression(data1, data2),
      n,
    ),
  ]

  // Level B: Application Pipeline Benchmarks (CSV parsing -> data extraction -> computation -> canonical result & formatting)
  const csvDescriptive = `nilai\n${data1.map((v) => v.toFixed(2)).join('\n')}`
  const csvTTest = `kelompok,skor\n${data1.map((v, i) => `${i < halfN ? 'A' : 'B'},${v.toFixed(2)}`).join('\n')}`
  const csvCorrelation = `x,y\n${data1.map((v, i) => `${v.toFixed(2)},${(data2[i] ?? 0).toFixed(2)}`).join('\n')}`
  const csvRegression = `x,y\n${data1.map((v, i) => `${v.toFixed(2)},${(data2[i] ?? 0).toFixed(2)}`).join('\n')}`

  const pipelineResults: BenchmarkMetric[] = [
    runBenchmark(
      'Deskriptif Application Pipeline (CSV -> Parse -> Calc -> Format)',
      'Application Pipeline',
      () => {
        const parsed = parseCsv(csvDescriptive)
        const col = parsed.columns.find((c) => c.name === 'nilai')
        const vals = col ? col.values.filter((v): v is number => v !== null) : []
        const res = calculateDescriptive(vals)
        formatStatisticalValues('Deskriptif', res)
        normalizeVisualization(
          { jenis_grafik: 'histogram', data_grafik: { values: vals } },
          'Deskriptif',
        )
      },
      n,
    ),
    runBenchmark(
      'Uji t Application Pipeline (CSV -> Parse -> Group -> Calc -> Format)',
      'Application Pipeline',
      () => {
        const parsed = parseCsv(csvTTest)
        const valCol = parsed.columns.find((c) => c.name === 'skor')
        const g1: number[] = []
        const g2: number[] = []
        parsed.rawRows.forEach((row, idx) => {
          const val = valCol?.values[idx]
          if (val != null) {
            if (row[0] === 'A') g1.push(val)
            else g2.push(val)
          }
        })
        const res = calculateTTest(g1, g2)
        formatStatisticalValues('Uji t', res)
        normalizeVisualization(
          {
            jenis_grafik: 'bar',
            data_grafik: {
              kind: 'bar',
              groups: [
                { groupName: 'A', mean: res.group1.mean },
                { groupName: 'B', mean: res.group2.mean },
              ],
            },
          },
          'Uji t',
        )
      },
      n,
    ),
    runBenchmark(
      'Korelasi Application Pipeline (CSV -> Parse -> Pairs -> Calc -> Format)',
      'Application Pipeline',
      () => {
        const parsed = parseCsv(csvCorrelation)
        const xCol = parsed.columns.find((c) => c.name === 'x')
        const yCol = parsed.columns.find((c) => c.name === 'y')
        const xs = xCol?.values.filter((v): v is number => v !== null) ?? []
        const ys = yCol?.values.filter((v): v is number => v !== null) ?? []
        const res = calculateCorrelation(xs, ys)
        formatStatisticalValues('Korelasi', res)
        normalizeVisualization(
          {
            jenis_grafik: 'scatter',
            data_grafik: {
              kind: 'scatter',
              points: xs.slice(0, 50).map((x, idx) => ({ x, y: ys[idx] ?? 0 })),
            },
          },
          'Korelasi',
        )
      },
      n,
    ),
    runBenchmark(
      'Regresi Application Pipeline (CSV -> Parse -> Pairs -> Calc -> Format)',
      'Application Pipeline',
      () => {
        const parsed = parseCsv(csvRegression)
        const xCol = parsed.columns.find((c) => c.name === 'x')
        const yCol = parsed.columns.find((c) => c.name === 'y')
        const xs = xCol?.values.filter((v): v is number => v !== null) ?? []
        const ys = yCol?.values.filter((v): v is number => v !== null) ?? []
        const res = calculateRegression(xs, ys)
        formatStatisticalValues('Regresi', res)
        normalizeVisualization(
          {
            jenis_grafik: 'scatter',
            data_grafik: {
              kind: 'scatter',
              points: xs.slice(0, 50).map((x, idx) => ({ x, y: ys[idx] ?? 0 })),
              trendline: {
                slope: res.slope,
                intercept: res.intercept,
                rSquared: res.rSquared,
              },
            },
          },
          'Regresi',
        )
      },
      n,
    ),
  ]

  return [...pureResults, ...pipelineResults]
}

if (process.argv[1]?.endsWith('benchmark-statistics.ts')) {
  console.log('\n============================================================')
  console.log('   NFR02 TWO-LEVEL STATISTICAL PERFORMANCE BENCHMARK')
  console.log('============================================================')
  console.log(
    `Environment: Node ${process.version} | ${os.platform()} ${os.arch()} | CPUs: ${os.cpus().length}`,
  )
  console.log('Config     : N = 1,000 | Iterations = 30 | Warmup = 5')
  console.log('Requirement: NFR02 <= 5,000 ms per analysis (AI external wait strictly excluded)\n')

  const results = runAllBenchmarks()
  let allPassed = true

  const pureEngineResults = results.filter((x) => x.level === 'Pure Engine')
  const pipelineResults = results.filter((x) => x.level === 'Application Pipeline')

  console.log('### Level A: Pure Statistical Engine Computations')
  console.log('| Analisis | Sampel (N) | Iterasi | Warmup | Median (ms) | Min (ms) | Max (ms) | Target | Status |')
  console.log('|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|')
  for (const r of pureEngineResults) {
    if (!r.passed) allPassed = false
    console.log(
      `| ${r.name} | ${r.datasetSize} | ${r.iterations} | ${r.warmupIterations} | ${r.medianMs.toFixed(3)} ms | ${r.minMs.toFixed(3)} ms | ${r.maxMs.toFixed(3)} ms | <= ${r.thresholdMs} ms | ${r.passed ? 'VERIFIED' : 'FAILED'} |`,
    )
  }

  console.log('\n### Level B: Application Statistical-Processing Pipeline (CSV Parse -> Select -> Calc -> Format -> Viz Normalize)')
  console.log('| Analisis Pipeline | Sampel (N) | Iterasi | Warmup | Median (ms) | Min (ms) | Max (ms) | Target | Status |')
  console.log('|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|')
  for (const r of pipelineResults) {
    if (!r.passed) allPassed = false
    console.log(
      `| ${r.name} | ${r.datasetSize} | ${r.iterations} | ${r.warmupIterations} | ${r.medianMs.toFixed(3)} ms | ${r.minMs.toFixed(3)} ms | ${r.maxMs.toFixed(3)} ms | <= ${r.thresholdMs} ms | ${r.passed ? 'VERIFIED' : 'FAILED'} |`,
    )
  }

  // Export JSON artifact
  const benchmarkArtifact = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
    },
    datasetSize: 1000,
    iterations: 30,
    warmupIterations: 5,
    thresholdMs: 5000,
    overallStatus: allPassed ? 'VERIFIED' : 'FAILED',
    scopeLimitation:
      'This benchmark strictly measures Pure Engine (Level A) and Application Statistical-Processing Pipeline (Level B). It excludes HTTP server overhead, session/auth verification, PostgreSQL I/O, database network latency, external AI API latency, and client-side browser rendering.',
    levelA_PureEngine: pureEngineResults,
    levelB_ApplicationPipeline: pipelineResults,
  }

  const artifactPath = path.resolve(process.cwd(), 'docs/benchmark-results.json')
  fs.writeFileSync(artifactPath, JSON.stringify(benchmarkArtifact, null, 2), 'utf-8')
  console.log('\nBenchmark artifact written to docs/benchmark-results.json')

  console.log('\n--- NFR02 Evaluation ---')
  console.log(`NFR02 STATUS: ${allPassed ? 'VERIFIED — ENGINEERING BENCHMARK' : 'FAILED'}`)
  console.log(
    'Evidence    : Application Statistical-Processing Pipeline benchmark <= 5,000 ms on N=1,000 sample.',
  )
  console.log(
    'Scope Note  : This benchmark measures statistical algorithms and data processing pipeline only; it does not represent total HTTP/API request lifecycle and strictly excludes external AI waiting time.',
  )
  console.log('============================================================\n')

  if (!allPassed) {
    process.exit(1)
  }
}

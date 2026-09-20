import { describe, expect, it } from 'vitest'
import { runAllBenchmarks } from '../../scripts/benchmark-statistics'

describe('NFR02: Statistical Computation Performance Benchmark', () => {
  it('executes two-level benchmark (Pure Engine and Application Pipeline) in under 5,000 ms on N=1,000 sample', () => {
    const results = runAllBenchmarks()

    expect(results).toHaveLength(8)
    for (const metric of results) {
      // Must pass the NFR02 threshold (5,000 ms)
      expect(metric.passed).toBe(true)
      expect(metric.medianMs).toBeLessThanOrEqual(5000)
    }

    // Pure math calculations in V8 on 1,000 numbers typically take < 20 ms
    const pureEngine = results.filter((r) => r.level === 'Pure Engine')
    expect(pureEngine).toHaveLength(4)
    for (const metric of pureEngine) {
      expect(metric.medianMs).toBeLessThan(100)
    }

    // End-to-end data pipeline (CSV parsing + stats + formatting + viz normalization)
    const pipeline = results.filter((r) => r.level === 'Application Pipeline')
    expect(pipeline).toHaveLength(4)
    for (const metric of pipeline) {
      expect(metric.medianMs).toBeLessThan(500)
    }
  })
})

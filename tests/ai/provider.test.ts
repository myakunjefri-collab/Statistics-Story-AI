import { describe, it, expect } from 'vitest'
import { FallbackProvider } from '@/lib/ai/fallback-provider'
import { ExternalLLMProvider } from '@/lib/ai/external-provider'
import { aiInterpretationOutputSchema } from '@/lib/ai/schemas'
import type { AIProviderGenerateOptions } from '@/lib/ai/ai-provider'

describe('AI Provider & Narrative Generation (TC10 & TC12)', () => {
  const sampleDescriptiveInput: AIProviderGenerateOptions = {
    analysisType: 'Deskriptif',
    statisticalResult: {
      jenisUji: 'Deskriptif',
      n: 30,
      mean: 78.5,
      median: 80,
      mode: [80],
      modeDescription: '80',
      sampleStandardDeviation: 6.2,
      populationStandardDeviation: 6.1,
      variance: 38.44,
      minimum: 65,
      maximum: 95,
      range: 30,
      q1: 72,
      q3: 85,
      iqr: 13,
    },
    language: 'id',
  }

  const sampleTTestInput: AIProviderGenerateOptions = {
    analysisType: 'Uji t',
    statisticalResult: {
      jenisUji: 'Uji t',
      testMethod: "Welch's Two-Sample t-Test (Unequal Variance)",
      isTwoTailed: true,
      group1: { name: 'Eksperimen', n: 15, mean: 82.5, standardDeviation: 5.1, variance: 26.01 },
      group2: { name: 'Kontrol', n: 15, mean: 71.0, standardDeviation: 5.8, variance: 33.64 },
      tStatistic: 3.45,
      degreesOfFreedom: 28,
      pValue: 0.0018,
      meanDifference: 11.5,
      isSignificant: true,
    },
    language: 'id',
  }

  it('TC10: Generasi narasi interpretatif valid (Fallback deterministic engine)', async () => {
    const provider = new FallbackProvider()
    const output = await provider.generateInterpretation(sampleDescriptiveInput)

    // Verify Zod schema compliance
    const validated = aiInterpretationOutputSchema.safeParse(output)
    expect(validated.success).toBe(true)

    // Content checks
    expect(output.narrative.length).toBeGreaterThan(30)
    expect(output.narrative).toContain('78.50')
    expect(output.exampleCase.length).toBeGreaterThan(20)
    expect(output.language).toBe('id')
    expect(output.sumber).toBe('fallback')
  })

  it('TC10: t-Test narrative generation distinguishes significance based on p-value', async () => {
    const provider = new FallbackProvider()
    const output = await provider.generateInterpretation(sampleTTestInput)

    expect(output.narrative).toContain('signifikan')
    expect(output.exampleCase).toContain('metode belajar')
    expect(output.language).toBe('id')
  })

  it('TC12: Penanganan error layanan AI (timeout / network error tanpa crash)', async () => {
    // Instantiate ExternalLLMProvider with non-existent or invalid configuration to simulate failure
    const brokenProvider = new ExternalLLMProvider('gemini', 'dummy-invalid-key-for-test')

    // Expecting the provider to throw a controlled error or fail gracefully when network is unreachable
    await expect(brokenProvider.generateInterpretation(sampleDescriptiveInput)).rejects.toThrow()

    // Resilient fallback execution ensures the system does not crash
    const fallbackProvider = new FallbackProvider()
    const resilientOutput = await fallbackProvider.generateInterpretation(sampleDescriptiveInput)

    expect(resilientOutput).toBeDefined()
    expect(resilientOutput.narrative).toBeDefined()
    expect(resilientOutput.sumber).toBe('fallback')
  })

  it('Validates AI output schema rejection of missing fields', () => {
    const invalidOutput = {
      narrative: 'Just a text without required exampleCase or language',
    }
    const res = aiInterpretationOutputSchema.safeParse(invalidOutput)
    expect(res.success).toBe(false)
  })
})

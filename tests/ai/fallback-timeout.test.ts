import { describe, it, expect, vi } from 'vitest'
import { generateInterpretationWithFallback } from '@/lib/ai/provider-factory'
import { ExternalLLMProvider } from '@/lib/ai/external-provider'
import type { AIProvider, AIProviderGenerateOptions } from '@/lib/ai/ai-provider'
import { aiInterpretationOutputSchema } from '@/lib/ai/schemas'

describe('TC12 & NFR05: AI Provider Resilience & Timeout Fallback Orchestration', () => {
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

  const sampleRegressionInput: AIProviderGenerateOptions = {
    analysisType: 'Regresi',
    statisticalResult: {
      jenisUji: 'Regresi',
      method: 'Simple Linear Regression',
      n: 25,
      slope: 1.85,
      intercept: 12.3,
      rSquared: 0.88,
      standardError: 0.42,
      equation: 'y = 1.85*x + 12.3',
      isSignificant: true,
    },
    language: 'id',
  }

  it('TC12: External AI timeout triggers transparent rule-based fallback without application crash', async () => {
    // 1. Create a simulated external provider that throws a Gateway Timeout error
    const timingOutProvider: AIProvider = {
      name: 'Simulated Timeout External Provider',
      generateInterpretation: vi.fn().mockImplementation(async () => {
        // Simulate delay then timeout
        await new Promise((resolve) => setTimeout(resolve, 50))
        throw new Error('504 Gateway Timeout: External AI service did not respond within deadline.')
      }),
    }

    // 2. Call the orchestrator
    const result = await generateInterpretationWithFallback(
      sampleDescriptiveInput,
      timingOutProvider,
    )

    // 3. Assert fallback was invoked
    expect(timingOutProvider.generateInterpretation).toHaveBeenCalledTimes(1)
    expect(result).toBeDefined()
    expect(result.sumber).toBe('fallback')
    expect(result.language).toBe('id')

    // 4. Assert narrative & exampleCase integrity
    expect(result.narrative).toBeDefined()
    expect(result.narrative.length).toBeGreaterThan(20)
    expect(result.narrative).toContain('78.50') // Contains actual mean
    expect(result.exampleCase).toBeDefined()
    expect(result.exampleCase.length).toBeGreaterThan(15)

    // 5. Assert compliance with canonical schema
    const parsed = aiInterpretationOutputSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('TC12: External AI network failure (ECONNREFUSED) gracefully falls back', async () => {
    const brokenProvider: AIProvider = {
      name: 'Simulated Network Error Provider',
      generateInterpretation: vi.fn().mockRejectedValue(new Error('ECONNREFUSED: Connection refused by upstream LLM')),
    }

    const result = await generateInterpretationWithFallback(
      sampleRegressionInput,
      brokenProvider,
    )

    expect(brokenProvider.generateInterpretation).toHaveBeenCalledTimes(1)
    expect(result.sumber).toBe('fallback')
    expect(result.narrative).toContain('1.85') // Contains slope
    expect(result.exampleCase.length).toBeGreaterThan(10)
  })

  it('External AI success returns primary provider output with sumber = ai', async () => {
    const successfulProvider: AIProvider = {
      name: 'Mock Gemini Successful Provider',
      generateInterpretation: vi.fn().mockResolvedValue({
        narrative: 'Interpretasi berbasis LLM eksternal: Data regresi menunjukkan tren positif yang kuat.',
        exampleCase: 'Contoh nyata: Setiap kenaikan jam belajar 1 unit berasosiasi dengan kenaikan skor 1.85 poin.',
        language: 'id',
        sumber: 'ai',
      }),
    }

    const result = await generateInterpretationWithFallback(
      sampleRegressionInput,
      successfulProvider,
    )

    expect(successfulProvider.generateInterpretation).toHaveBeenCalledTimes(1)
    expect(result.sumber).toBe('ai')
    expect(result.narrative).toContain('Interpretasi berbasis LLM eksternal')
    expect(result.exampleCase).toContain('Contoh nyata')
  })

  it('Simulates network timeout in ExternalLLMProvider with environment variable configuration', async () => {
    const prevEnv = process.env.AI_PROVIDER
    const prevKey = process.env.AI_API_KEY
    process.env.AI_PROVIDER = 'gemini'
    process.env.AI_API_KEY = 'test-fake-key'

    // Mock global fetch to abort with timeout
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const abortError = new Error('The operation was aborted due to timeout')
      abortError.name = 'AbortError'
      throw abortError
    })

    try {
      const result = await generateInterpretationWithFallback(sampleDescriptiveInput)

      expect(fetchSpy).toHaveBeenCalled()
      expect(result.sumber).toBe('fallback')
      expect(result.narrative).toBeDefined()
      expect(result.exampleCase).toBeDefined()
    } finally {
      fetchSpy.mockRestore()
      process.env.AI_PROVIDER = prevEnv
      process.env.AI_API_KEY = prevKey
    }
  })
})

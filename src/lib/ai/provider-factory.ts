import type { AIProvider, AIProviderGenerateOptions } from './ai-provider'
import { ExternalLLMProvider } from './external-provider'
import { FallbackProvider } from './fallback-provider'
import type { AIInterpretationOutput } from './schemas'

export function getAIProvider(overrideType?: string, apiKey?: string): AIProvider {
  const providerType = (overrideType || process.env.AI_PROVIDER || 'fallback').toLowerCase()
  const key = apiKey || process.env.AI_API_KEY || 'default_test_key'

  if (providerType === 'gemini') {
    return new ExternalLLMProvider('gemini', key)
  }

  if (providerType === 'openai') {
    return new ExternalLLMProvider('openai', key)
  }

  return new FallbackProvider()
}

/**
 * Orchestrates AI interpretation generation with automatic transparent fallback.
 * Ensures the system NEVER crashes when external AI fails or times out (NFR 05 / TC-12).
 */
export async function generateInterpretationWithFallback(
  options: AIProviderGenerateOptions,
  customPrimaryProvider?: AIProvider,
): Promise<AIInterpretationOutput> {
  const primaryProvider = customPrimaryProvider ?? getAIProvider()
  const fallbackProvider = new FallbackProvider()

  // If primary is already fallback, just run it
  if (primaryProvider instanceof FallbackProvider) {
    return fallbackProvider.generateInterpretation(options)
  }

  try {
    return await primaryProvider.generateInterpretation(options)
  } catch (error) {
    console.warn(
      `[AI Provider] Panggilan ke ${primaryProvider.name} gagal atau timeout: ${
        error instanceof Error ? error.message : String(error)
      }. Beralih ke Rule-Based Fallback.`,
    )
    return fallbackProvider.generateInterpretation(options)
  }
}

import type { AIProvider, AIProviderGenerateOptions } from './ai-provider'
import { type AIInterpretationOutput, aiInterpretationOutputSchema } from './schemas'

export class ExternalLLMProvider implements AIProvider {
  readonly name: string
  private apiKey: string
  private providerType: 'gemini' | 'openai'

  constructor(providerType: 'gemini' | 'openai' = 'gemini', apiKey?: string) {
    this.providerType = providerType
    this.name = providerType === 'gemini' ? 'Google Gemini AI' : 'OpenAI'
    this.apiKey = apiKey || process.env.AI_API_KEY || ''
  }

  async generateInterpretation(
    options: AIProviderGenerateOptions,
  ): Promise<AIInterpretationOutput> {
    if (!this.apiKey) {
      throw new Error(`API Key untuk ${this.name} tidak terkonfigurasi pada server.`)
    }

    const { analysisType, statisticalResult, language = 'id' } = options

    const prompt = `Anda adalah ahli statistika edukatif dan data storyteller handal.
Tugas Anda adalah membuat narasi interpretasi hasil statistik dan satu contoh kasus/analogi dunia nyata yang mudah dipahami mahasiswa.

Jenis Analisis: ${analysisType}
Hasil Komputasi Statistik:
${JSON.stringify(statisticalResult, null, 2)}
Bahasa Target: ${language === 'id' ? 'Bahasa Indonesia' : 'English'}

Kembalikan HANYA JSON valid dalam format berikut (tanpa markdown blok, tanpa kutip di luar JSON):
{
  "narrative": "Penjelasan interpretasi mendalam, ramah pemula, dan presisi secara statistik",
  "exampleCase": "Satu analogi dunia nyata atau studi kasus kontekstual yang relevan",
  "language": "${language}",
  "sumber": "ai"
}`

    // Call external LLM API with 8-second timeout enforcement (NFR 05 / Phase 9)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      if (this.providerType === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        })

        if (!res.ok) {
          throw new Error(`Gemini API error HTTP ${res.status}: ${await res.text()}`)
        }

        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
        }
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!textResponse) throw new Error('Respon Gemini tidak memuat teks.')

        const parsedJson = JSON.parse(textResponse)
        parsedJson.sumber = 'ai'
        return aiInterpretationOutputSchema.parse(parsedJson)
      }

      // OpenAI Fallback implementation
      const url = 'https://api.openai.com/v1/chat/completions'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        throw new Error(`OpenAI API error HTTP ${res.status}: ${await res.text()}`)
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const textResponse = data.choices?.[0]?.message?.content
      if (!textResponse) throw new Error('Respon OpenAI tidak memuat teks.')

      const parsedJson = JSON.parse(textResponse)
      parsedJson.sumber = 'ai'
      return aiInterpretationOutputSchema.parse(parsedJson)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export { ExternalLLMProvider as ExternalAIProvider }

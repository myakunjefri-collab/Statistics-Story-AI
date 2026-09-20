import { z } from 'zod'

export const aiInterpretationOutputSchema = z.object({
  narrative: z.string().min(10, 'Narasi interpretasi minimal 10 karakter.'),
  exampleCase: z.string().min(10, 'Contoh kasus minimal 10 karakter.'),
  language: z.enum(['id', 'en']).default('id'),
  sumber: z.enum(['ai', 'fallback']).default('ai'),
})

export type AIInterpretationOutput = z.infer<typeof aiInterpretationOutputSchema>

export {
  type CalculateRequest,
  calculateRequestSchema,
} from '@/lib/validation'
export { aiInterpretationOutputSchema as aiOutputSchema }

'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function CopyNarrativeButton({ text }: { text: string }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast('Narasi disalin ke papan klip.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Gagal menyalin narasi.', 'error')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="border-ivory/20 text-ivory hover:border-ivory hover:bg-ivory/10"
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? 'Tersalin' : 'Salin Narasi'}
    </Button>
  )
}

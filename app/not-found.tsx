import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <p className="font-mono text-sm uppercase tracking-widest text-electric">404</p>
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">Halaman Tidak Ditemukan</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL yang dimasukkan
          salah.
        </p>
        <div className="pt-2">
          <Link href="/" className={cn(buttonVariants({ variant: 'default' }))}>
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}

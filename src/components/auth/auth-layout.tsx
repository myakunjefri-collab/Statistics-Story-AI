import { Sparkles } from 'lucide-react'
import { AuthForm } from '@/components/auth/auth-form'
import { Link } from '@/lib/navigation'

export interface AuthLayoutProps {
  mode: 'login' | 'register'
}

export function AuthLayout({ mode }: AuthLayoutProps) {
  const isRegister = mode === 'register'

  return (
    <main className="min-h-dvh bg-navy px-6 py-8 text-ivory sm:px-10">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div className="hidden space-y-8 lg:block">
          <Link href="/" className="font-serif text-2xl italic">
            Statistics Story AI
          </Link>
          <div className="max-w-xl space-y-5">
            <Sparkles className="size-6 text-cyan" aria-hidden="true" />
            <p className="font-serif text-5xl leading-[0.95] text-pretty">
              Dari angka menjadi cerita. Dari perhitungan menjadi pemahaman.
            </p>
            <p className="max-w-md text-sm leading-relaxed text-ivory/60">
              Ruang tenang untuk membaca data, menemukan pola, dan menyusun cerita yang bermakna.
            </p>
          </div>
        </div>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-ivory/10 bg-ivory p-6 text-ink shadow-2xl shadow-black/20 sm:p-9">
          <div className="mb-8 space-y-3">
            <Link href="/" className="font-serif text-xl italic text-ink lg:hidden">
              Statistics Story AI
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-electric">
              {isRegister ? 'Mulai perjalanan' : 'Selamat datang kembali'}
            </p>
            <h1 className="font-serif text-4xl leading-tight">
              {isRegister ? 'Buat Akun Anda.' : 'Selamat Datang Kembali.'}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isRegister
                ? 'Mulai ubah hasil statistik menjadi pemahaman yang lebih bermakna.'
                : 'Masuk untuk melanjutkan perjalanan Anda memahami data.'}
            </p>
          </div>
          <AuthForm mode={mode} />
        </section>
      </div>
    </main>
  )
}

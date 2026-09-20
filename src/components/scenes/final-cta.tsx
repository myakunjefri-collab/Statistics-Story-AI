import { Cta } from '@/components/cta'
import { HorizonLine, Reveal, RevealLine } from '@/components/primitives'

export function FinalCta() {
  return (
    <section
      id="mulai"
      className="relative flex min-h-screen items-center overflow-hidden bg-navy px-6 py-28 text-ivory md:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 40%, oklch(0.62 0.185 256 / 0.22), transparent 70%)',
        }}
      />

      {/* resolving regression line into the horizon */}
      <HorizonLine />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.35em] text-ivory/50">Mulai Sekarang</p>
        </Reveal>

        <h2 className="mx-auto mt-8 max-w-4xl text-balance font-serif text-5xl leading-[1.0] tracking-tight sm:text-6xl md:text-8xl">
          <RevealLine>Setiap Data</RevealLine>
          <RevealLine delay={0.12}>Punya Cerita.</RevealLine>
          <RevealLine delay={0.24}>
            <span className="italic text-electric">Temukan Ceritamu.</span>
          </RevealLine>
        </h2>

        <Reveal delay={0.35}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <Cta href="/login" tone="light" variant="primary">
              Mulai Mencoba
            </Cta>
            <Cta href="#cara-kerja" tone="light" variant="ghost">
              Pelajari Lebih Lanjut
            </Cta>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

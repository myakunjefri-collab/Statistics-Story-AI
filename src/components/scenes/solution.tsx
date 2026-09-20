import { Reveal, SceneLabel, SolutionPoster } from '@/components/primitives'

export function Solution() {
  return (
    <section className="relative overflow-hidden bg-navy px-6 py-28 text-ivory md:px-10 md:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, oklch(0.62 0.185 256 / 0.2), transparent 65%)',
        }}
      />
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <SceneLabel index="04" className="text-ivory/60">
              Solusi
            </SceneLabel>
          </Reveal>
          <h2 className="mt-10 text-balance font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            <Reveal>Angka Bukan</Reveal>
            <Reveal delay={0.1}>
              Sekadar <span className="italic text-electric">Angka.</span>
            </Reveal>
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ivory/70">
              Statistics Story AI menerjemahkan hasil analisis statistik menjadi penjelasan yang
              lebih mudah dipahami — menggabungkan data, visualisasi, dan narasi dalam satu
              rangkaian pemahaman.
            </p>
          </Reveal>
        </div>

        {/* editorial poster composition */}
        <Reveal delay={0.15} className="relative">
          <SolutionPoster />
        </Reveal>
      </div>
    </section>
  )
}

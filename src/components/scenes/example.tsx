import { ExampleScatter, Reveal, SceneLabel } from '@/components/primitives'

export function Example() {
  return (
    <section className="relative bg-ivory px-6 py-28 text-ink md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <SceneLabel index="08" className="text-ink/60">
            Contoh Nyata
          </SceneLabel>
        </Reveal>

        <div className="mt-14 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* big number + scatter */}
          <div>
            <Reveal>
              <div className="tnum font-serif text-7xl leading-none tracking-tight text-ink md:text-8xl">
                r = <span className="text-electric">0,78</span>
              </div>
            </Reveal>
            <Reveal delay={0.15} y={40}>
              <div className="mt-10 rounded-3xl border border-ink/10 bg-navy p-8">
                <ExampleScatter />
                <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-ivory/40">
                  Jam Belajar &times; Nilai Ujian
                </p>
              </div>
            </Reveal>
          </div>

          {/* unfolding story */}
          <div className="flex flex-col justify-center gap-12">
            <div>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-blue">Interpretasi</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 font-serif text-3xl leading-snug tracking-tight md:text-4xl">
                  Terdapat hubungan positif yang kuat antara kedua variabel.
                </p>
              </Reveal>
            </div>

            <div className="h-px w-full bg-ink/10" />

            <div>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-blue">Contoh Kasus</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 max-w-lg text-xl leading-relaxed text-ink/75">
                  Sebagai ilustrasi, semakin lama waktu belajar seorang mahasiswa, kecenderungannya
                  untuk memperoleh nilai yang lebih tinggi juga meningkat.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Reveal, SceneLabel } from '@/components/primitives'

const PAIRS = [
  {
    value: 'p-value = 0,032',
    meaning: 'Hasil signifikan secara statistik.',
  },
  {
    value: 'r = 0,78',
    meaning: 'Terdapat hubungan positif yang kuat antara kedua variabel.',
  },
  {
    value: 'R² = 0,64',
    meaning: 'Sebanyak 64% variasi dapat dijelaskan oleh model.',
  },
  {
    value: 'Mean = 72,4',
    meaning: 'Rata-rata nilai berada di atas titik tengah skala.',
  },
]

export function Problem() {
  return (
    <section
      id="tentang"
      className="relative overflow-hidden bg-ivory px-6 py-28 text-ink md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <SceneLabel index="02" className="text-ink/60">
            Masalah
          </SceneLabel>
        </Reveal>

        <div className="mt-10 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
          <div>
            <h2 className="max-w-2xl text-balance font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              <Reveal>Mendapatkan Angka yang Tepat</Reveal>
              <Reveal delay={0.1}>
                <span className="italic text-blue">Bukanlah Akhir.</span>
              </Reveal>
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/70">
                Mahasiswa sering mampu melakukan perhitungan statistik menggunakan Excel, SPSS,
                Python, atau R. Namun, memahami arti dari hasil tersebut dan menerjemahkannya
                menjadi kesimpulan yang bermakna masih menjadi tantangan.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-14 font-serif text-3xl italic text-ink/40 md:text-4xl">
                &hellip; apa arti dari angka tersebut?
              </p>
            </Reveal>
          </div>

          {/* numbers transforming into interpretation */}
          <ul className="flex flex-col gap-8">
            {PAIRS.map((pair, i) => (
              <TransformRow key={pair.value} pair={pair} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function TransformRow({ pair, index }: { pair: (typeof PAIRS)[number]; index: number }) {
  return (
    <li className="border-t border-ink/10 pt-6">
      <Reveal delay={index * 0.1}>
        <div className="tnum text-xl font-light tracking-tight text-ink/45 md:text-2xl">
          {pair.value}
        </div>
      </Reveal>
      <Reveal delay={index * 0.1 + 0.2}>
        <div className="mt-3 flex items-start gap-3">
          <span className="mt-2 h-px w-6 shrink-0 bg-electric" aria-hidden="true" />
          <p className="max-w-md text-lg leading-snug text-ink md:text-xl">{pair.meaning}</p>
        </div>
      </Reveal>
    </li>
  )
}

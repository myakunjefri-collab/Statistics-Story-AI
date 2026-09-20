import { AudienceMotif, Reveal, SceneLabel } from '@/components/primitives'

const AUDIENCE = [
  {
    n: '01',
    who: 'Mahasiswa',
    body: 'Memahami hasil statistik untuk tugas, penelitian, dan skripsi.',
    motif: 'dist',
  },
  {
    n: '02',
    who: 'Dosen dan Asisten Dosen',
    body: 'Sebagai alat bantu mengajar dan mendemonstrasikan interpretasi hasil statistik.',
    motif: 'compare',
  },
  {
    n: '03',
    who: 'Peneliti Pemula',
    body: 'Membantu memahami hasil analisis sebelum menyusun kesimpulan.',
    motif: 'conclude',
  },
] as const

export function Audience() {
  return (
    <section className="relative bg-ivory px-6 py-28 text-ink md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <SceneLabel index="10" className="text-ink/60">
            Untuk Siapa
          </SceneLabel>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-10 max-w-3xl text-balance font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl md:text-7xl">
            Dirancang untuk Mereka yang Belajar dan Bekerja dengan{' '}
            <span className="italic text-blue">Data.</span>
          </h2>
        </Reveal>

        <div className="mt-24 grid gap-16 md:grid-cols-3 md:gap-8">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.n} delay={i * 0.12} y={40}>
              <article className="flex h-full flex-col">
                <div className="relative mb-8 aspect-[3/4] overflow-hidden rounded-3xl border border-ink/10 bg-navy p-8">
                  <span className="tnum absolute right-6 top-6 font-serif text-4xl text-ivory/15">
                    {a.n}
                  </span>
                  <div className="flex h-full items-center justify-center">
                    <AudienceMotif kind={a.motif} />
                  </div>
                </div>
                <h3 className="font-serif text-3xl tracking-tight">{a.who}</h3>
                <p className="mt-4 max-w-xs text-lg leading-relaxed text-ink/70">{a.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

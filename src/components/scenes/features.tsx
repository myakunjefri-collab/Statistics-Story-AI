import { FeatureVisual, Reveal, SceneLabel } from '@/components/primitives'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    n: '01',
    title: 'Interpretasi Berbasis AI',
    body: 'Ubah hasil statistik menjadi narasi yang lebih mudah dipahami dan sesuai konteks penelitian Anda.',
    visual: 'ai',
  },
  {
    n: '02',
    title: 'Visualisasi Otomatis',
    body: 'Pahami pola data melalui grafik yang relevan — bar chart, histogram, hingga scatter plot.',
    visual: 'charts',
  },
  {
    n: '03',
    title: 'Contoh Kasus Nyata',
    body: 'Hubungkan hasil statistik dengan situasi yang lebih dekat dengan kehidupan sehari-hari.',
    visual: 'case',
  },
  {
    n: '04',
    title: 'Beragam Analisis Statistik',
    body: 'Statistik deskriptif, uji t, korelasi, dan regresi sederhana dalam satu tempat.',
    visual: 'analysis',
  },
] as const

export function Features() {
  return (
    <section id="fitur" className="relative bg-ivory px-6 py-28 text-ink md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <SceneLabel index="06" className="text-ink/60">
            Fitur
          </SceneLabel>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-10 max-w-2xl text-balance font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl md:text-7xl">
            Setiap Hasil Layak Untuk <span className="italic text-blue">Diceritakan.</span>
          </h2>
        </Reveal>

        <div className="mt-24 flex flex-col gap-28 md:gap-40">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.n} feature={f} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ feature, flip }: { feature: (typeof FEATURES)[number]; flip: boolean }) {
  return (
    <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
      <div className={cn(flip && 'lg:order-2')}>
        <Reveal>
          <span className="tnum font-serif text-5xl text-ink/15">{feature.n}</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h3 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{feature.title}</h3>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">{feature.body}</p>
        </Reveal>
      </div>

      <Reveal delay={0.15} y={40} className={cn(flip && 'lg:order-1')}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink/10 bg-navy p-8">
          <FeatureVisual kind={feature.visual} />
        </div>
      </Reveal>
    </article>
  )
}

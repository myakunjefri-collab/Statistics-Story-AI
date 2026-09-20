import { HowItWorksInteractive, Reveal, SceneLabel } from '@/components/primitives'

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="relative bg-ivory px-6 text-ink md:px-10">
      <div className="mx-auto max-w-[1400px] py-28 md:py-40">
        <Reveal>
          <SceneLabel index="05" className="text-ink/60">
            Cara Kerja
          </SceneLabel>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-10 max-w-3xl text-balance font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl md:text-7xl">
            Bagaimana Statistics Story AI Bekerja?
          </h2>
        </Reveal>

        <HowItWorksInteractive />
      </div>
    </section>
  )
}

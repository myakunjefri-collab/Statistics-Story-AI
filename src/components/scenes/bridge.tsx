import { BridgeParallax, Reveal } from '@/components/primitives'

const CALC = ['Mean', 'p-value', 'Korelasi', 'Regresi', 'R²']
const EXPLAIN = [
  'Apa artinya?',
  'Apakah hasilnya signifikan?',
  'Seberapa kuat hubungannya?',
  'Apa yang dapat disimpulkan?',
]

export function Bridge() {
  return (
    <section className="relative overflow-hidden bg-navy px-6 py-28 text-ivory md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-balance text-center font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl md:text-7xl">
            Menjembatani Kemampuan Menghitung dan{' '}
            <span className="italic text-electric">Menjelaskan.</span>
          </h2>
        </Reveal>

        <BridgeParallax calcList={CALC} explainList={EXPLAIN} />
      </div>
    </section>
  )
}

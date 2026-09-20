import { TransformationParallax } from '@/components/primitives'

const STEPS = ['Angka', 'Analisis', 'Narasi', 'Pemahaman']

export function Transformation() {
  return (
    <section aria-label="Dari angka menuju pemahaman" className="relative bg-navy text-ivory">
      <TransformationParallax steps={STEPS} />
    </section>
  )
}

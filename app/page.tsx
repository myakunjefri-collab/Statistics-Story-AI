import type { Metadata } from 'next'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Audience } from '@/components/scenes/audience'
import { Bridge } from '@/components/scenes/bridge'
import { DataTransform } from '@/components/scenes/data-transform'
import { Example } from '@/components/scenes/example'
import { Features } from '@/components/scenes/features'
import { FinalCta } from '@/components/scenes/final-cta'
import { Hero } from '@/components/scenes/hero'
import { HowItWorks } from '@/components/scenes/how-it-works'
import { Problem } from '@/components/scenes/problem'
import { Solution } from '@/components/scenes/solution'
import { Transformation } from '@/components/scenes/transformation'

export const metadata: Metadata = {
  title: 'Statistics Story AI — Dari Angka Menjadi Cerita',
  description:
    'Platform pembelajaran dan analisis statistik berbasis AI untuk mahasiswa dan dosen. Transformasikan angka deskriptif, uji-t, korelasi, dan regresi menjadi narasi komprehensif.',
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="overflow-x-clip">
        <Hero />
        <Problem />
        <Transformation />
        <Solution />
        <HowItWorks />
        <Features />
        <DataTransform />
        <Example />
        <Bridge />
        <Audience />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

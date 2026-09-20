'use client'

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { type ReactNode, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/* Small uppercase scene label, e.g. "MASALAH" */
export function SceneLabel({
  children,
  className,
  index,
}: {
  children: ReactNode
  className?: string
  index?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {index ? (
        <span className="tnum text-xs font-medium tracking-[0.3em] opacity-50">{index}</span>
      ) : null}
      <span className="h-px w-8 bg-current opacity-30" aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-[0.35em]">{children}</span>
    </div>
  )
}

/* Fade + rise reveal on scroll into view */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* Word-by-word masked reveal for large statements */
export function WordsReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  wordClassName?: string
  delay?: number
  as?: 'span' | 'div'
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <Tag className={cn('inline', className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-baseline">
          <motion.span
            className={cn('inline-block', wordClassName)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: '105%' }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/* Masked reveal line for editorial headers */
export function RevealLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref} className="block overflow-hidden">
      <motion.span
        className="block"
        initial={reduce ? { opacity: 0 } : { y: '110%' }}
        animate={isInView ? (reduce ? { opacity: 1 } : { y: 0 }) : undefined}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* Horizon line animation for final CTA */
export function HorizonLine() {
  const reduce = useReducedMotion()
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 w-full opacity-40"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 0 190 L 1200 40"
        stroke="oklch(0.62 0.185 256)"
        strokeWidth={2}
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/* Solution Scene: Editorial Poster Composition */
export function SolutionPoster() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      {/* base data plate */}
      <div className="absolute left-0 top-0 w-3/5 rounded-2xl border border-ivory/12 bg-ivory/[0.04] p-6 backdrop-blur-sm">
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-cyan/70">Data</p>
        <div className="mt-4 space-y-2.5">
          {[
            ['x', 'y'],
            ['4,1', '68'],
            ['5,6', '74'],
            ['7,2', '81'],
            ['8,9', '88'],
          ].map((row, i) => (
            <div
              key={i}
              className={`tnum flex justify-between text-sm ${
                i === 0 ? 'text-ivory/40' : 'text-ivory/80'
              }`}
            >
              <span>{row[0]}</span>
              <span>{row[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* chart card */}
      <div className="absolute bottom-16 right-0 w-3/5 rounded-2xl border border-ivory/12 bg-navy/60 p-5 backdrop-blur-md">
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-cyan/70">Visualisasi</p>
        <svg viewBox="0 0 200 120" className="mt-3 h-24 w-full" fill="none" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle
              key={i}
              cx={20 + i * 27}
              cy={95 - i * 11 + (i % 2 ? 8 : -6)}
              r={3}
              fill="oklch(0.78 0.11 220)"
            />
          ))}
          <motion.path
            d="M 20 95 L 182 25"
            stroke="oklch(0.62 0.185 256)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>

      {/* AI narrative chip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-4 left-6 max-w-[78%] rounded-2xl border border-electric/30 bg-electric/[0.12] p-5 backdrop-blur-md"
      >
        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-cyan">Narasi AI</p>
        <p className="mt-2 font-serif text-lg italic leading-snug text-ivory">
          &ldquo;Semakin tinggi nilai x, semakin tinggi pula y — sebuah hubungan positif yang
          kuat.&rdquo;
        </p>
      </motion.div>
    </div>
  )
}

/* Audience Scene: SVG motifs */
export function AudienceMotif({ kind }: { kind: 'dist' | 'compare' | 'conclude' }) {
  if (kind === 'dist') {
    return (
      <svg viewBox="0 0 180 140" className="w-full text-ivory" fill="none" aria-hidden="true">
        <motion.path
          d="M 10 120 C 45 120, 55 30, 90 30 C 125 30, 135 120, 170 120"
          stroke="oklch(0.62 0.185 256)"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <line
          x1="90"
          y1="30"
          x2="90"
          y2="120"
          stroke="oklch(0.78 0.11 220 / 0.5)"
          strokeDasharray="4 4"
        />
        <line x1="10" y1="120" x2="170" y2="120" stroke="oklch(1 0 0 / 0.15)" />
      </svg>
    )
  }

  if (kind === 'compare') {
    const bars = [50, 80, 65, 95]
    return (
      <svg viewBox="0 0 180 140" className="w-full text-ivory" fill="none" aria-hidden="true">
        <line x1="15" y1="120" x2="170" y2="120" stroke="oklch(1 0 0 / 0.15)" />
        {bars.map((h, i) => (
          <motion.rect
            key={i}
            x={25 + i * 36}
            y={120 - h}
            width={22}
            height={h}
            rx={2}
            fill={i % 2 ? 'oklch(0.62 0.185 256)' : 'oklch(0.78 0.11 220 / 0.55)'}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            style={{ transformOrigin: 'bottom' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          />
        ))}
      </svg>
    )
  }

  const pts = [
    [20, 110],
    [55, 90],
    [90, 95],
    [125, 55],
    [160, 35],
  ]
  return (
    <svg viewBox="0 0 180 140" className="w-full text-ivory" fill="none" aria-hidden="true">
      <line x1="15" y1="120" x2="170" y2="120" stroke="oklch(1 0 0 / 0.15)" />
      <motion.polyline
        points={pts.map((p) => p.join(',')).join(' ')}
        stroke="oklch(0.62 0.185 256)"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={4}
          fill="oklch(0.78 0.11 220)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
        />
      ))}
    </svg>
  )
}

/* Example Scene: Interactive Scatter SVG */
export function ExampleScatter() {
  const pts = [
    [30, 210],
    [70, 190],
    [95, 170],
    [140, 155],
    [175, 130],
    [210, 140],
    [250, 110],
    [290, 85],
    [330, 70],
    [360, 55],
  ]
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full" fill="none" aria-hidden="true">
      <line x1="20" y1="10" x2="20" y2="220" stroke="oklch(1 0 0 / 0.12)" />
      <line x1="20" y1="220" x2="390" y2="220" stroke="oklch(1 0 0 / 0.12)" />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={5}
          fill="oklch(0.78 0.11 220)"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.85, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
        />
      ))}
      <motion.path
        d="M 25 215 L 385 45"
        stroke="oklch(0.62 0.185 256)"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/* Features Scene: Feature Visual Components */
export function FeatureVisual({ kind }: { kind: 'ai' | 'charts' | 'case' | 'analysis' }) {
  if (kind === 'ai') {
    const lines = [
      { w: '92%', o: 1 },
      { w: '78%', o: 0.75 },
      { w: '85%', o: 0.55 },
      { w: '60%', o: 0.35 },
    ]
    return (
      <div className="flex h-full flex-col justify-center text-ivory">
        <p className="mb-4 text-[0.65rem] uppercase tracking-[0.25em] text-cyan/70">Narasi AI</p>
        <div className="tnum mb-5 font-serif text-3xl text-ivory/80">p = 0,032</div>
        <div className="flex flex-col gap-3">
          {lines.map((l, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: l.o, width: l.w }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="h-3 rounded-full bg-gradient-to-r from-electric to-cyan"
            />
          ))}
        </div>
      </div>
    )
  }

  if (kind === 'charts') {
    return (
      <div className="grid h-full grid-cols-2 gap-4 text-ivory">
        <div className="flex flex-col justify-end rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
          <svg viewBox="0 0 100 70" className="h-full w-full" fill="none" aria-hidden="true">
            {[30, 50, 40, 65, 45].map((h, i) => (
              <motion.rect
                key={i}
                x={8 + i * 18}
                y={70 - h}
                width={12}
                height={h}
                rx={1.5}
                fill="oklch(0.78 0.11 220 / 0.6)"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                style={{ transformOrigin: 'bottom' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />
            ))}
          </svg>
        </div>
        <div className="rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
          <svg viewBox="0 0 100 70" className="h-full w-full" fill="none" aria-hidden="true">
            {[
              [15, 55],
              [30, 45],
              [42, 50],
              [55, 32],
              [68, 38],
              [82, 20],
            ].map((p, i) => (
              <motion.circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r={3.5}
                fill="oklch(0.62 0.185 256)"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              />
            ))}
          </svg>
        </div>
        <div className="col-span-2 rounded-xl border border-ivory/10 bg-ivory/[0.03] p-4">
          <svg viewBox="0 0 200 50" className="h-full w-full" fill="none" aria-hidden="true">
            {[20, 35, 28, 45, 38, 30, 22, 15].map((h, i) => (
              <motion.rect
                key={i}
                x={8 + i * 24}
                y={50 - h}
                width={18}
                height={h}
                rx={1.5}
                fill="oklch(0.78 0.11 220 / 0.4)"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                style={{ transformOrigin: 'bottom' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              />
            ))}
          </svg>
        </div>
      </div>
    )
  }

  if (kind === 'case') {
    return (
      <div className="flex h-full flex-col justify-center text-ivory">
        <div className="tnum font-serif text-4xl text-ivory/80">r = 0,78</div>
        <div className="my-4 h-px w-16 bg-electric" />
        <p className="font-serif text-xl italic leading-snug text-ivory/90">
          &ldquo;Semakin lama waktu belajar, kecenderungan memperoleh nilai yang lebih tinggi juga
          meningkat.&rdquo;
        </p>
        <span className="mt-4 text-[0.65rem] uppercase tracking-[0.25em] text-cyan/70">
          Contoh kasus sehari-hari
        </span>
      </div>
    )
  }

  const items = ['Statistik Deskriptif', 'Uji t', 'Korelasi', 'Regresi Sederhana']
  return (
    <div className="flex h-full flex-col justify-center gap-3 text-ivory">
      {items.map((it, i) => (
        <motion.div
          key={it}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="flex items-center justify-between border-b border-ivory/10 pb-3"
        >
          <span className="text-lg text-ivory/85">{it}</span>
          <span className="tnum text-sm text-cyan/70">{`0${i + 1}`}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* Bridge Scene: Parallax motion */
export function BridgeParallax({
  calcList,
  explainList,
}: {
  calcList: readonly string[]
  explainList: readonly string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })
  const leftX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-30%', '0%'])
  const rightX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['30%', '0%'])
  const coreScale = useTransform(scrollYProgress, [0.4, 1], [0.9, 1])
  const coreOpacity = useTransform(scrollYProgress, [0.4, 0.85], [0, 1])

  return (
    <div ref={ref} className="mt-24 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
      {/* left: menghitung */}
      <motion.div style={{ x: leftX }} className="flex flex-col items-start gap-4 md:items-end">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/70">Menghitung</p>
        <ul className="flex flex-col gap-3 md:items-end">
          {calcList.map((c) => (
            <li
              key={c}
              className="tnum rounded-full border border-ivory/12 px-5 py-2 text-lg text-ivory/80"
            >
              {c}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* core */}
      <motion.div
        style={{ scale: coreScale, opacity: coreOpacity }}
        className="mx-auto my-8 max-w-[220px] rounded-3xl border border-electric/40 bg-electric/[0.12] px-8 py-10 text-center backdrop-blur-md md:my-0"
      >
        <p className="font-serif text-xl italic leading-tight text-ivory">Statistics Story AI</p>
        <div className="mx-auto mt-4 h-px w-10 bg-electric" />
        <p className="mt-4 text-sm text-ivory/60">di antara dua dunia</p>
      </motion.div>

      {/* right: menjelaskan */}
      <motion.div style={{ x: rightX }} className="flex flex-col items-start gap-4">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan/70">Menjelaskan</p>
        <ul className="flex flex-col gap-3">
          {explainList.map((e) => (
            <li
              key={e}
              className="rounded-full border border-ivory/12 px-5 py-2 text-lg text-ivory/80"
            >
              {e}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

/* Transformation Scene: Word scrub */
export function TransformationParallax({ steps }: { steps: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <div ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, oklch(0.62 0.185 256 / 0.16), transparent 70%)',
          }}
        />
        <p className="absolute top-16 text-xs uppercase tracking-[0.35em] text-ivory/40">
          Sebuah Perjalanan
        </p>
        {steps.map((word, i) => (
          <TransformationWord
            key={word}
            word={word}
            index={i}
            total={steps.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  )
}

function TransformationWord({
  word,
  index,
  total,
  progress,
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const reduce = useReducedMotion()
  const seg = 1 / total
  const start = index * seg
  const opacity = useTransform(
    progress,
    [start, start + seg * 0.35, start + seg * 0.75, start + seg],
    [0, 1, 1, 0],
  )
  const y = useTransform(progress, [start, start + seg], reduce ? [0, 0] : [80, -80])
  const scale = useTransform(progress, [start, start + seg * 0.4], [0.85, 1])

  return (
    <motion.span
      className="absolute font-serif text-6xl leading-none tracking-tight sm:text-8xl md:text-[11rem]"
      style={{ opacity, y, scale }}
    >
      {index === total - 1 ? <span className="italic text-electric">{word}</span> : word}
    </motion.span>
  )
}

/* DataTransform Scene: Interactive Stage Canvas */
export function DataTransformInteractive() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const stages = ['Tabel', 'Grafik', 'Narasi', 'Makna']

  return (
    <div ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 md:px-10">
          {/* headline */}
          <div className="pt-24 md:pt-28">
            <p className="text-xs uppercase tracking-[0.35em] text-ivory/40">Transformasi</p>
            <h2 className="mt-6 max-w-3xl text-balance font-serif text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
              Jangan Hanya Melihat <span className="italic text-electric">Tabelnya.</span>
            </h2>
          </div>

          {/* stage progress */}
          <div className="mt-10 flex gap-4 border-b border-ivory/10 pb-4">
            {stages.map((s, i) => (
              <StageTab
                key={s}
                label={s}
                index={i}
                progress={scrollYProgress}
                total={stages.length}
              />
            ))}
          </div>

          {/* stage canvas */}
          <div className="relative flex-1">
            <StagePanel progress={scrollYProgress} range={[0, 0.28]}>
              <TableStage />
            </StagePanel>
            <StagePanel progress={scrollYProgress} range={[0.25, 0.53]}>
              <ChartStage />
            </StagePanel>
            <StagePanel progress={scrollYProgress} range={[0.5, 0.78]}>
              <NarrativeStage />
            </StagePanel>
            <StagePanel progress={scrollYProgress} range={[0.75, 1]}>
              <MeaningStage />
            </StagePanel>
          </div>
        </div>
      </div>
    </div>
  )
}

function StageTab({
  label,
  index,
  progress,
  total,
}: {
  label: string
  index: number
  progress: MotionValue<number>
  total: number
}) {
  const start = index / total
  const end = (index + 1) / total
  const opacity = useTransform(progress, [start, start + 0.02, end - 0.02, end], [0.3, 1, 1, 0.3])
  return (
    <motion.span
      style={{ opacity }}
      className="flex items-center gap-2 text-sm uppercase tracking-[0.2em]"
    >
      <span className="tnum text-xs text-electric">{`0${index + 1}`}</span>
      {label}
    </motion.span>
  )
}

function StagePanel({
  children,
  progress,
  range,
}: {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}) {
  const reduce = useReducedMotion()
  const mid = (range[0] + range[1]) / 2
  const opacity = useTransform(progress, [range[0], mid - 0.03, mid + 0.03, range[1]], [0, 1, 1, 0])
  const y = useTransform(progress, range, reduce ? [0, 0] : [40, -40])
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {children}
    </motion.div>
  )
}

function TableStage() {
  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-ivory/12">
        {[
          ['Jam Belajar', 'Nilai Ujian'],
          ['2,5', '68'],
          ['4,0', '75'],
          ['6,5', '84'],
          ['8,0', '91'],
        ].map((row, i) => (
          <div
            key={i}
            className={`tnum grid grid-cols-2 gap-4 px-6 py-4 text-lg ${
              i === 0 ? 'border-b border-ivory/12 bg-ivory/[0.04] text-ivory/50' : 'text-ivory/85'
            }`}
          >
            {row.map((c, j) => (
              <span key={j} className={i > 0 && j === 1 ? 'text-electric' : ''}>
                {c}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartStage() {
  const pts = [
    [40, 240],
    [130, 200],
    [250, 150],
    [360, 90],
  ]
  return (
    <div className="w-full max-w-xl">
      <svg viewBox="0 0 420 280" className="h-auto w-full" fill="none" aria-hidden="true">
        <line x1="40" y1="20" x2="40" y2="250" stroke="oklch(1 0 0 / 0.15)" />
        <line x1="40" y1="250" x2="400" y2="250" stroke="oklch(1 0 0 / 0.15)" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={6} fill="oklch(0.78 0.11 220)" />
        ))}
        <path d="M 40 250 L 400 70" stroke="oklch(0.62 0.185 256)" strokeWidth={2.5} />
      </svg>
      <p className="mt-4 text-center text-sm uppercase tracking-[0.2em] text-ivory/40">
        Pola mulai terlihat
      </p>
    </div>
  )
}

function NarrativeStage() {
  return (
    <div className="max-w-xl text-center">
      <div className="tnum font-serif text-5xl text-ivory/70 md:text-6xl">r = 0,78</div>
      <p className="mt-8 font-serif text-2xl italic leading-snug text-ivory md:text-3xl">
        &ldquo;Terdapat hubungan positif yang kuat antara jam belajar dan nilai ujian.&rdquo;
      </p>
    </div>
  )
}

function MeaningStage() {
  return (
    <div className="max-w-xl text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan">Makna</p>
      <p className="mt-6 font-serif text-3xl leading-snug text-ivory md:text-4xl">
        Semakin banyak waktu yang diinvestasikan untuk belajar, semakin besar peluang memperoleh
        hasil yang lebih baik.
      </p>
    </div>
  )
}

/* HowItWorks Scene: Interactive Steps */
export function HowItWorksInteractive() {
  const [active, setActive] = useState(0)

  const steps = [
    {
      n: '01',
      title: 'Masukkan Data',
      body: 'Masukkan data secara manual atau unggah berkas CSV atau Excel. Sistem akan memvalidasi struktur data sebelum melanjutkan.',
    },
    {
      n: '02',
      title: 'Pilih Analisis',
      body: 'Tentukan metode yang sesuai dengan pertanyaan penelitian Anda — dari statistik deskriptif hingga regresi sederhana.',
      options: ['Statistik Deskriptif', 'Uji t', 'Korelasi', 'Regresi Sederhana'],
    },
    {
      n: '03',
      title: 'Analisis dan Interpretasi',
      body: 'Sistem memproses hasil statistik dan menerjemahkannya menjadi narasi interpretatif dengan bantuan AI.',
    },
    {
      n: '04',
      title: 'Pahami Hasilnya',
      body: 'Hasil akhir hadir sebagai cerita data yang utuh — narasi, visualisasi, dan contoh kasus.',
      outputs: ['Narasi', 'Visualisasi', 'Contoh Kasus'],
    },
  ]

  return (
    <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-20">
      {/* sticky visual */}
      <div className="hidden lg:block">
        <div className="sticky top-28 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-ink/10 bg-navy">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full w-full items-center justify-center p-12"
            >
              <StepVisual index={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* scrolling steps */}
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <motion.li
            key={step.n}
            onViewportEnter={() => setActive(i)}
            viewport={{ margin: '-45% 0px -45% 0px' }}
            className="flex min-h-[70vh] flex-col justify-center border-t border-ink/10 py-10 lg:min-h-[80vh]"
          >
            <span className="tnum font-serif text-6xl text-ink/15 md:text-7xl">{step.n}</span>
            <h3 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">{step.title}</h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">{step.body}</p>

            {step.options ? (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {step.options.map((o) => (
                  <span
                    key={o}
                    className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/75"
                  >
                    {o}
                  </span>
                ))}
              </div>
            ) : null}

            {step.outputs ? (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {step.outputs.map((o) => (
                  <span
                    key={o}
                    className="rounded-full bg-electric/10 px-4 py-1.5 text-sm font-medium text-blue"
                  >
                    {o}
                  </span>
                ))}
              </div>
            ) : null}

            {/* mobile inline visual */}
            <div className="mt-8 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-navy p-8 lg:hidden">
              <StepVisual index={i} />
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

function StepVisual({ index }: { index: number }) {
  if (index === 0) return <HowItWorksTableVisual />
  if (index === 1) return <HowItWorksOptionsVisual />
  if (index === 2) return <HowItWorksInterpretVisual />
  return <HowItWorksStoryVisual />
}

function HowItWorksTableVisual() {
  return (
    <div className="w-full max-w-xs text-ivory">
      <p className="mb-4 text-[0.65rem] uppercase tracking-[0.25em] text-cyan/70">Dataset</p>
      <div className="overflow-hidden rounded-xl border border-ivory/12">
        {[
          ['ID', 'Jam', 'Nilai'],
          ['1', '2,5', '68'],
          ['2', '4,0', '75'],
          ['3', '6,5', '84'],
          ['4', '8,0', '91'],
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`tnum grid grid-cols-3 gap-2 px-4 py-2.5 text-sm ${
              i === 0 ? 'border-b border-ivory/12 bg-ivory/5 text-ivory/50' : 'text-ivory/85'
            }`}
          >
            {row.map((c, j) => (
              <span key={j}>{c}</span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function HowItWorksOptionsVisual() {
  const opts = ['Statistik Deskriptif', 'Uji t', 'Korelasi', 'Regresi Sederhana']
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {opts.map((o, i) => (
        <motion.div
          key={o}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
          className={`rounded-xl border px-5 py-4 text-ivory ${
            i === 2 ? 'border-electric/50 bg-electric/15' : 'border-ivory/12 bg-ivory/[0.04]'
          }`}
        >
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cyan/60">
            Metode {i + 1}
          </span>
          <p className="mt-1 text-base">{o}</p>
        </motion.div>
      ))}
    </div>
  )
}

function HowItWorksInterpretVisual() {
  return (
    <div className="w-full max-w-xs text-ivory">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="tnum text-center font-serif text-5xl text-ivory/80"
      >
        r = 0,78
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="my-6 text-center text-2xl text-electric"
      >
        ↓
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="rounded-xl border border-electric/30 bg-electric/10 p-5 text-center font-serif text-xl italic leading-snug"
      >
        &ldquo;Terdapat hubungan positif yang kuat antara kedua variabel.&rdquo;
      </motion.p>
    </div>
  )
}

function HowItWorksStoryVisual() {
  const parts = ['Narasi', 'Visualisasi', 'Contoh Kasus']
  return (
    <div className="w-full max-w-xs text-ivory">
      <div className="mb-5 h-24 w-full rounded-xl border border-ivory/12 bg-ivory/[0.04] p-3">
        <svg viewBox="0 0 200 70" className="h-full w-full" fill="none" aria-hidden="true">
          {[40, 55, 30, 60, 45, 65].map((h, i) => (
            <motion.rect
              key={i}
              x={12 + i * 31}
              y={70 - h}
              width={18}
              height={h}
              rx={2}
              fill={i === 5 ? 'oklch(0.62 0.185 256)' : 'oklch(0.78 0.11 220 / 0.5)'}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'bottom' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            />
          ))}
        </svg>
      </div>
      <div className="flex flex-col gap-2.5">
        {parts.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
            className="flex items-center gap-3 text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric" />
            <span className="text-ivory/85">{p}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* Hero Scene: Interactive Visual & Canvas */
const FLOATERS = [
  { label: 'p-value', value: '0,032', x: '8%', y: '22%', size: 'text-2xl', depth: 60 },
  { label: 'r', value: '0,78', x: '78%', y: '18%', size: 'text-3xl', depth: 120 },
  { label: 'R²', value: '0,64', x: '68%', y: '68%', size: 'text-2xl', depth: 90 },
  { label: 'Mean', value: '72,4', x: '14%', y: '72%', size: 'text-xl', depth: 40 },
  { label: 'σ', value: '4,9', x: '88%', y: '46%', size: 'text-lg', depth: 150 },
  { label: 'n', value: '128', x: '4%', y: '48%', size: 'text-lg', depth: 30 },
]

export function HeroInteractive() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const fieldY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div ref={ref} className="relative min-h-screen">
      {/* soft radial data glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 70% 30%, oklch(0.62 0.185 256 / 0.22), transparent 70%), radial-gradient(50% 40% at 15% 80%, oklch(0.78 0.11 220 / 0.10), transparent 70%)',
        }}
      />

      {/* animated data field */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ y: reduce ? 0 : fieldY, opacity: reduce ? 1 : fade }}
      >
        <HeroRegressionCanvas />
        {FLOATERS.map((f, i) => (
          <HeroFloater key={f.label} data={f} index={i} reduce={!!reduce} />
        ))}
      </motion.div>

      {/* content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 pt-28 pb-20 md:px-10"
        style={{ y: reduce ? 0 : textY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md text-sm uppercase tracking-[0.35em] text-ivory/50"
        >
          Statistics Story AI
        </motion.p>

        <h1 className="mt-6 max-w-4xl text-balance font-serif text-6xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-[8.5rem]">
          <RevealLine delay={0.35}>Dari Angka</RevealLine>
          <RevealLine delay={0.5}>
            Menjadi <span className="italic text-electric">Cerita.</span>
          </RevealLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-xl text-lg leading-relaxed text-ivory/70"
        >
          Data dapat dihitung, tetapi juga perlu dipahami. Statistics Story AI membantu mahasiswa
          memahami hasil statistik melalui narasi, visualisasi, dan contoh kasus yang lebih mudah
          dipahami.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <a
            href="/login"
            className="rounded-full bg-electric px-7 py-3 text-sm font-semibold text-ivory transition-transform hover:scale-105"
          >
            Mulai Mencoba
          </a>
          <a
            href="#cara-kerja"
            className="rounded-full border border-ivory/20 px-7 py-3 text-sm font-medium text-ivory/80 transition-colors hover:border-ivory/40 hover:text-ivory"
          >
            Lihat Cara Kerjanya
          </a>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-ivory/40">
        Gulir
      </div>
    </div>
  )
}

function HeroFloater({
  data,
  index,
  reduce,
}: {
  data: (typeof FLOATERS)[number]
  index: number
  reduce: boolean
}) {
  return (
    <motion.div
      className="absolute select-none"
      style={{ left: data.x, top: data.y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        reduce
          ? { opacity: 0.5 }
          : {
              opacity: [0, 0.6, 0.45, 0.6],
              y: [0, -14, 0],
            }
      }
      transition={{
        opacity: { duration: 1.2, delay: 0.6 + index * 0.15 },
        y: { duration: 7 + index, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cyan/70">{data.label}</span>
      <div className={`tnum ${data.size} font-light text-ivory/80`}>{data.value}</div>
    </motion.div>
  )
}

function HeroRegressionCanvas() {
  const reduce = useReducedMotion()
  const points: [number, number][] = [
    [80, 420],
    [180, 380],
    [260, 340],
    [360, 330],
    [440, 280],
    [540, 250],
    [640, 210],
    [740, 180],
    [860, 120],
  ]
  return (
    <svg
      className="absolute right-0 top-1/2 hidden h-[560px] w-[720px] -translate-y-1/2 opacity-60 md:block"
      viewBox="0 0 900 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="reg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="oklch(0.78 0.11 220)" />
          <stop offset="1" stopColor="oklch(0.62 0.185 256)" />
        </linearGradient>
      </defs>
      {/* scatter dots */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1] + (i % 2 === 0 ? 18 : -22)}
          r={4}
          fill="oklch(0.78 0.11 220)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 + i * 0.08 }}
        />
      ))}
      {/* regression line */}
      <motion.path
        d="M 80 420 L 860 120"
        stroke="url(#reg)"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

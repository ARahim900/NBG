import { Suspense, lazy, useLayoutEffect, useRef } from 'react'
import {
  ArrowDown,
  Award,
  Baby,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  FlaskConical,
  Flower2,
  Handshake,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ViewId } from '../lib/dashboards'
import {
  demographics,
  department,
  mission,
  sections,
  values,
  vision,
  wilayats,
  type Section,
} from '../data/department'
import { mc } from '../data/nbg'
import { int } from '../lib/format'
import { animateHero } from '../lib/motion'
import { useMagnetic, useTilt } from '../lib/interactions'
import AnimatedNumber from '../components/ui/AnimatedNumber'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

interface ViewProps {
  onNavigate: (id: ViewId) => void
}

const VALUE_ICONS: Record<string, LucideIcon> = {
  scale: Scale,
  award: Award,
  flask: FlaskConical,
  users: Users,
  star: Star,
  shield: ShieldCheck,
  handshake: Handshake,
}
const SECTION_ICONS: Record<string, LucideIcon> = {
  woman: Flower2,
  reproductive: Stethoscope,
  child: Baby,
}
const SECTION_BAR: Record<Section['accent'], string> = {
  navy: 'before:bg-gradient-to-b before:from-azure before:to-navy',
  azure: 'before:bg-gradient-to-b before:from-glow before:to-azure',
  teal: 'before:bg-gradient-to-b before:from-teal before:to-teal-700',
}
const SECTION_ICONBG: Record<Section['accent'], string> = {
  navy: 'bg-tint/10 text-heading ring-1 ring-azure/25',
  azure: 'bg-azure/10 text-azure ring-1 ring-azure/30',
  teal: 'bg-teal/15 text-teal-700 ring-1 ring-teal/30 dark:text-teal',
}

const ancFor = (key: string): number =>
  mc.byWilayat2025.find((w) => w.wilayat === key)?.newAnc ?? 0

/** Core-value tile with pointer tilt. */
function ValueCard({ v }: { v: (typeof values)[number] }) {
  const ref = useTilt<HTMLElement>(8)
  const Icon = VALUE_ICONS[v.iconKey]
  return (
    <article ref={ref} className="card card-lift sheen group p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-600 text-glow shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
        <Icon className="h-5 w-5" />
      </span>
      <h3 dir="rtl" className="mt-3 font-ar text-lg font-bold text-heading">
        {v.ar}
      </h3>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-azure">
        {v.en}
      </p>
      <p dir="rtl" className="mt-2 font-ar text-[0.8rem] leading-relaxed text-ink/65">
        {v.descAr}
      </p>
    </article>
  )
}

/** Wilayat tile with its live ANC counter. */
function WilayatCard({ w }: { w: (typeof wilayats)[number] }) {
  const ref = useTilt<HTMLElement>(9)
  return (
    <article ref={ref} className="card card-lift group p-4 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mist text-heading ring-1 ring-glow/25 transition-all duration-300 group-hover:text-glow group-hover:shadow-glow-teal">
        <MapPin className="h-5 w-5" />
      </span>
      <h3 dir="rtl" className="mt-3 font-ar text-lg font-extrabold text-heading">
        {w.ar}
      </h3>
      <p className="text-xs font-semibold text-ink/55">{w.en}</p>
      <p dir="rtl" className="mt-1 font-ar text-[0.7rem] text-ink/45">
        {w.note}
      </p>
      <div className="mt-3 border-t border-line/10 pt-2">
        <AnimatedNumber
          value={int(ancFor(w.dataKey))}
          className="font-display text-base font-bold text-azure"
        />
        <p className="text-[0.62rem] font-medium uppercase tracking-wide text-ink/45">
          ANC 2025
        </p>
      </div>
    </article>
  )
}

export default function About({ onNavigate }: ViewProps) {
  const heroRef = useRef<HTMLElement>(null)
  const ctaRef = useMagnetic<HTMLButtonElement>(0.22)
  const cta2Ref = useMagnetic<HTMLButtonElement>(0.22)
  const finaleRef = useMagnetic<HTMLButtonElement>(0.18)

  useLayoutEffect(() => {
    if (!heroRef.current) return
    return animateHero(heroRef.current)
  }, [])

  return (
    <div className="space-y-12">
      {/* ===== Immersive hero — 3D helix, layered light, staged reveal ===== */}
      <section
        ref={heroRef}
        className="relative -mt-1 overflow-hidden rounded-3xl bg-[#071527] text-white shadow-card ring-1 ring-white/10"
        data-reveal
      >
        {/* 3D scene — fills the panel, content floats above it */}
        <div className="absolute inset-0 opacity-90 lg:left-1/3">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>
        {/* Light field & legibility gradients */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-azure/20 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-glow/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071527] via-[#071527]/80 to-transparent lg:via-[#071527]/55" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/50 to-transparent" />
        </div>

        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:py-20">
          <span className="chip bg-white/10 text-glow ring-1 ring-glow/30" data-hero>
            <Sparkles className="h-3.5 w-3.5" />
            الخطة الخمسية الحادية عشرة · 2026–2030
          </span>

          <h1
            dir="rtl"
            className="mt-6 max-w-3xl font-ar text-4xl font-extrabold leading-tight sm:text-6xl"
            data-hero
          >
            {department.nameAr}
          </h1>
          <p
            className="text-aurora mt-3 font-display text-xl font-bold sm:text-3xl"
            data-hero
          >
            {department.nameEn}
          </p>

          <div
            className="mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-glow via-azure to-warn shadow-glow-teal"
            data-hero
            aria-hidden="true"
          />

          <div
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75"
            data-hero
          >
            <span dir="rtl" className="flex items-center gap-2 font-ar">
              <MapPin className="h-4 w-4 text-glow" />
              {department.governorateAr}
            </span>
            <span dir="rtl" className="flex items-center gap-2 font-ar">
              <Building2 className="h-4 w-4 text-glow" />
              {department.authorityAr}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4" data-hero>
            <button ref={ctaRef} onClick={() => onNavigate('overview')} className="btn-glow">
              استعراض لوحات المؤشرات · View Dashboards
            </button>
            <button ref={cta2Ref} onClick={() => onNavigate('asd')} className="btn-ghost">
              المؤشرات الصحية 2023–2025
            </button>
          </div>

          {/* Quick stats — live counters */}
          <div
            className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4"
            data-hero
          >
            {[
              { v: int(demographics.population2025), en: 'Population 2025', ar: 'إجمالي السكان' },
              { v: int(demographics.under18Omani), en: 'Omanis under 18', ar: 'دون 18 عاماً' },
              { v: int(demographics.liveBirths2025), en: 'Live Births 2025', ar: 'المواليد الأحياء' },
              { v: `${demographics.birthRate2025}‰`, en: 'Crude Birth Rate', ar: 'معدل المواليد' },
            ].map((s) => (
              <div key={s.en}>
                <AnimatedNumber
                  value={s.v}
                  className="font-display text-2xl font-bold text-white sm:text-[1.7rem]"
                />
                <p className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white/55">
                  {s.en}
                </p>
                <p dir="rtl" className="font-ar text-[0.72rem] text-glow/70">
                  {s.ar}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-10 hidden items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/40 sm:flex"
            data-hero
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            Scroll to explore
          </div>
        </div>
      </section>

      {/* ===== Official letterhead ===== */}
      <section className="card flex justify-center px-6 py-7">
        <img
          src="/moh-logo-navy.png"
          alt="وزارة الصحة — Ministry of Health, Oman"
          className="block max-h-32 w-auto dark:hidden"
        />
        <img
          src="/moh-logo-white.png"
          alt=""
          aria-hidden="true"
          className="hidden max-h-32 w-auto dark:block"
        />
      </section>

      {/* ===== Vision & Mission ===== */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="card relative overflow-hidden p-6">
          <Eye
            className="pointer-events-none absolute -bottom-7 -left-7 h-36 w-36 text-azure/[0.07]"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint/10 text-heading ring-1 ring-azure/25">
              <Eye className="h-5 w-5" />
            </span>
            <div dir="rtl" className="font-ar">
              <h2 className="text-xl font-extrabold text-heading">الرؤية</h2>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                Vision
              </p>
            </div>
          </div>
          <p
            dir="rtl"
            className="mt-4 font-ar text-lg font-semibold leading-relaxed text-ink"
          >
            {vision.ar}
          </p>
          <p className="mt-3 border-t border-line/10 pt-3 text-sm leading-relaxed text-ink/60">
            {vision.en}
          </p>
        </article>

        <article className="card relative overflow-hidden p-6">
          <Compass
            className="pointer-events-none absolute -bottom-7 -left-7 h-36 w-36 text-teal/[0.1]"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/15 text-teal-700 ring-1 ring-teal/30 dark:text-teal">
              <Compass className="h-5 w-5" />
            </span>
            <div dir="rtl" className="font-ar">
              <h2 className="text-xl font-extrabold text-heading">الرسالة</h2>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                Mission
              </p>
            </div>
          </div>
          <p
            dir="rtl"
            className="mt-4 font-ar text-[0.98rem] font-medium leading-loose text-ink"
          >
            {mission.ar}
          </p>
          <p className="mt-3 border-t border-line/10 pt-3 text-sm leading-relaxed text-ink/60">
            {mission.en}
          </p>
        </article>
      </section>

      {/* ===== Values ===== */}
      <section>
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 className="text-2xl font-extrabold text-heading">القِيَم</h2>
          <p className="text-sm text-ink/55">
            القيم المؤسسية الموجِّهة للعمل · Our Core Values
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
          {values.map((v) => (
            <ValueCard key={v.en} v={v} />
          ))}
        </div>
      </section>

      {/* ===== Department sections / مهام الأقسام ===== */}
      <section>
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 className="text-2xl font-extrabold text-heading">مهام الأقسام</h2>
          <p className="text-sm text-ink/55">
            الأقسام الثلاثة للدائرة وأهدافها الاستراتيجية · Department Sections
          </p>
        </div>
        <div className="space-y-4">
          {sections.map((s) => {
            const Icon = SECTION_ICONS[s.iconKey]
            return (
              <article
                key={s.id}
                className={`card relative overflow-hidden p-6 before:absolute before:inset-y-0 before:right-0 before:w-1.5 before:content-[''] ${SECTION_BAR[s.accent]}`}
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  {/* Identity + description */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${SECTION_ICONBG[s.accent]}`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div dir="rtl" className="font-ar">
                        <h3 className="text-xl font-extrabold text-heading">{s.titleAr}</h3>
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                          {s.titleEn}
                        </p>
                      </div>
                    </div>
                    <p
                      dir="rtl"
                      className="mt-4 font-ar text-[0.92rem] leading-loose text-ink/80"
                    >
                      {s.descAr}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-ink/55">{s.descEn}</p>
                  </div>

                  {/* Objectives */}
                  <div className="lg:col-span-3">
                    <p
                      dir="rtl"
                      className="mb-3 font-ar text-sm font-bold text-heading/80"
                    >
                      الأهداف الاستراتيجية (2026–2030)
                    </p>
                    <ul dir="rtl" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {s.objectivesAr.map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 font-ar text-[0.85rem] leading-relaxed text-ink/80"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ===== Wilayats ===== */}
      <section>
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 className="text-2xl font-extrabold text-heading">ولايات شمال الباطنة</h2>
          <p className="text-sm text-ink/55">
            ست ولايات تغطيها خدمات الدائرة · The Six Wilayat of North Batinah
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
          {wilayats.map((w) => (
            <WilayatCard key={w.en} w={w} />
          ))}
        </div>
      </section>

      {/* ===== CTA finale ===== */}
      <section
        className="relative overflow-hidden rounded-3xl bg-[#071527] p-8 text-center text-white shadow-card ring-1 ring-white/10 sm:p-10"
        data-reveal
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-glow/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-azure/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/40 to-transparent" />
        </div>
        <div className="relative">
          <h2 dir="rtl" className="font-ar text-2xl font-extrabold">
            المؤشرات الصحية للأعوام 2023 و2024 و2025
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
            Explore eight monitoring dashboards — screening, maternal care, perinatal
            outcomes and family planning — across the six wilayat of North Batinah.
          </p>
          <button
            ref={finaleRef}
            onClick={() => onNavigate('overview')}
            className="btn-glow mt-6"
          >
            استعراض لوحات المؤشرات · Open Dashboards
          </button>
        </div>
      </section>
    </div>
  )
}

import {
  ArrowRight,
  Award,
  Baby,
  CheckCircle2,
  Compass,
  Eye,
  FlaskConical,
  Flower2,
  GraduationCap,
  Handshake,
  MapPin,
  Scale,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NAV_BY_ID, type ViewId } from '../lib/dashboards'
import {
  demographics,
  department,
  mission,
  sections,
  trainingPlan2027,
  values,
  vision,
  wilayats,
  type Section,
} from '../data/department'
import { mc } from '../data/nbg'
import { int } from '../lib/format'

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
  navy: 'bg-navy',
  azure: 'bg-azure',
  teal: 'bg-teal-700',
}
const SECTION_ICONBG: Record<Section['accent'], string> = {
  navy: 'bg-tint/10 text-heading ring-1 ring-azure/25',
  azure: 'bg-tint/10 text-heading ring-1 ring-azure/25',
  teal: 'bg-tint/10 text-heading ring-1 ring-azure/25',
}

/** New ANC registrations for a wilayat in 2025, or null when the source has none. */
const ancFor = (key: string): number | null =>
  mc.byWilayat2025.find((w) => w.wilayat === key)?.newAnc ?? null

/** Core-value tile. */
function ValueCard({ v }: { v: (typeof values)[number] }) {
  const Icon = VALUE_ICONS[v.iconKey]
  return (
    <article className="card card-lift group p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-control bg-navy text-glow">
        <Icon className="h-5 w-5" />
      </span>
      <h3 dir="rtl" className="mt-3 font-ar text-lg font-bold text-heading">
        {v.ar}
      </h3>
      <p dir="ltr" className="text-right text-eyebrow uppercase text-azure">
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
  const anc = ancFor(w.dataKey)
  return (
    <article className="card card-lift group p-4 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mist text-heading ring-1 ring-glow/25 transition-all duration-300 group-hover:text-glow">
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
        <p className="font-display text-base font-bold tabular-nums text-azure">
          {anc === null ? <span className="text-sm font-semibold text-ink/50">No data supplied</span> : int(anc)}
        </p>
        <p className="text-[0.62rem] font-medium uppercase tracking-wide text-ink/45">
          ANC 2025
        </p>
      </div>
    </article>
  )
}

export default function About({ onNavigate }: ViewProps) {
  return (
    <div className="space-y-8">
      <section
        aria-labelledby="home-hero-title"
        className="overflow-hidden rounded-xl border border-line/15"
        data-reveal
      >
        <div className="bg-navy px-5 pb-8 pt-6 text-center text-white sm:px-10 sm:pb-10 sm:pt-8">
          <img
            src="/moh-hero-logo.png"
            alt="Ministry of Health, Oman"
            width={284}
            height={162}
            className="mx-auto h-auto w-56 max-w-full object-contain"
          />
          <p className="mt-3 text-xs font-medium tracking-[0.12em] text-white/75">
            DGHS · NORTH AL BATINAH
          </p>
          <h1
            id="home-hero-title"
            dir="rtl"
            lang="ar"
            className="mx-auto mt-5 max-w-3xl font-ar text-3xl font-semibold leading-relaxed sm:text-4xl"
          >
            {department.nameAr}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-xl font-medium leading-snug sm:text-2xl">
            {department.nameEn}
          </p>
          <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-1 text-sm leading-relaxed text-white/75">
            <span lang="ar" dir="rtl" className="font-ar">الخطة الخمسية الحادية عشرة</span>
            <span>11th Five-Year Plan, 2026–2030</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="mx-auto mt-7 flex min-h-12 w-full max-w-sm flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg bg-teal px-5 py-3 text-sm font-semibold text-heading transition-opacity hover:opacity-90 focus-visible:outline-white sm:w-auto"
          >
            <span lang="ar" dir="rtl" className="font-ar">استعراض لوحات المؤشرات</span>
            <span aria-hidden="true">·</span>
            <span>View dashboards</span>
          </button>
        </div>

        <div className="bg-surface px-5 py-6 sm:px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.1em] text-ink/75">2025 at a glance</p>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
            {[
              { v: int(demographics.population2025), en: 'Population 2025', ar: 'إجمالي السكان' },
              { v: int(demographics.under18Omani), en: 'Omanis under 18', ar: 'دون 18 عاماً' },
              { v: int(demographics.liveBirths2025), en: 'Live Births 2025', ar: 'المواليد الأحياء' },
              { v: `${demographics.birthRate2025}‰`, en: 'Crude Birth Rate', ar: 'معدل المواليد' },
            ].map((stat) => (
              <div key={stat.en}>
                <dt className="text-sm leading-5 text-ink/80">{stat.en}</dt>
                <dd className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-heading sm:text-3xl">{stat.v}</dd>
                <dd lang="ar" dir="rtl" className="mt-1 text-left font-ar text-sm text-ink/75">{stat.ar}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== Vision & Mission ===== */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="card p-6">
          <div dir="rtl" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint/10 text-heading ring-1 ring-azure/25">
              <Eye className="h-5 w-5" />
            </span>
            <div className="font-ar">
              <h2 lang="ar" className="text-xl font-extrabold text-heading">الرؤية</h2>
              <p dir="ltr" className="text-right font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                Vision
              </p>
            </div>
          </div>
          <p
            dir="rtl"
            lang="ar"
            className="mt-4 font-ar text-lg font-semibold leading-relaxed text-ink"
          >
            {vision.ar}
          </p>
          <p dir="ltr" className="mt-3 border-t border-line/10 pt-3 text-left text-sm leading-relaxed text-ink/60">
            {vision.en}
          </p>
        </article>

        <article className="card p-6">
          <div dir="rtl" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint/10 text-heading ring-1 ring-azure/25">
              <Compass className="h-5 w-5" />
            </span>
            <div className="font-ar">
              <h2 lang="ar" className="text-xl font-extrabold text-heading">الرسالة</h2>
              <p dir="ltr" className="text-right font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                Mission
              </p>
            </div>
          </div>
          <p
            dir="rtl"
            lang="ar"
            className="mt-4 font-ar text-[0.98rem] font-medium leading-loose text-ink"
          >
            {mission.ar}
          </p>
          <p dir="ltr" className="mt-3 border-t border-line/10 pt-3 text-left text-sm leading-relaxed text-ink/60">
            {mission.en}
          </p>
        </article>
      </section>

      {/* ===== Values ===== */}
      <section>
        {/* Seven values + a title tile = an even 4 × 2 grid (2 × 4 on phones). */}
        <div dir="rtl" className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <div
            dir="rtl"
            className="flex flex-col justify-center rounded-[4px] bg-navy p-5 text-white dark:bg-navy-900"
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
            data-reveal
          >
            <h2 lang="ar" className="font-ar text-2xl font-bold">
              القِيَم
            </h2>
            <p dir="ltr" className="mt-1 text-right font-sans text-lg">Our Core Values</p>
            <span className="accent-tab mt-3 bg-glow" aria-hidden="true" />
            <p lang="ar" className="mt-3 font-ar text-[0.8rem] leading-relaxed text-white/75">
              القيم المؤسسية الموجِّهة للعمل
            </p>
          </div>
          {values.map((v) => (
            <ValueCard key={v.en} v={v} />
          ))}
        </div>
      </section>

      {/* ===== Department sections / مهام الأقسام ===== */}
      <section>
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 className="text-2xl font-extrabold text-heading">مهام الأقسام</h2>
          <p className="text-sm text-ink/70">الأقسام الثلاثة للدائرة وأهدافها الاستراتيجية</p>
          <p dir="ltr" className="mt-1 font-sans text-sm text-ink/70">Department Sections</p>
        </div>
        <div className="space-y-4">
          {sections.map((s) => {
            const Icon = SECTION_ICONS[s.iconKey]
            return (
              <article
                key={s.id}
                dir="rtl"
                className="card relative p-6"
              >
                {/* Section colour bar (starts below the cut corner). */}
                <span
                  className={`absolute bottom-0 right-0 top-[14px] w-1.5 ${SECTION_BAR[s.accent]}`}
                  aria-hidden="true"
                />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  {/* Identity + description */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${SECTION_ICONBG[s.accent]}`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="font-ar">
                        <h3 className="text-xl font-extrabold text-heading">{s.titleAr}</h3>
                        <p dir="ltr" className="text-right font-display text-xs font-semibold uppercase tracking-[0.14em] text-azure">
                          {s.titleEn}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 font-ar text-[0.92rem] leading-loose text-ink/80">
                      {s.descAr}
                    </p>
                    <p dir="ltr" className="mt-3 border-t border-line/10 pt-3 text-left text-xs leading-relaxed text-ink/60">
                      {s.descEn}
                    </p>
                  </div>

                  {/* Objectives */}
                  <div className="lg:col-span-3">
                    <p className="mb-3 font-ar text-sm font-bold text-heading/80">
                      الأهداف الاستراتيجية (2026–2030)
                    </p>
                    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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

      {/* ===== Child Health training plan 2027 / الخطة التدريبية 2027 ===== */}
      <section aria-labelledby="training-2027-title">
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 id="training-2027-title" className="text-2xl font-extrabold text-heading">
            {trainingPlan2027.titleAr}
          </h2>
          <p className="text-sm text-ink/70">{trainingPlan2027.ownerAr}</p>
          <p dir="ltr" className="mt-1 font-sans text-sm text-ink/70">
            {trainingPlan2027.titleEn} · {trainingPlan2027.ownerEn}
          </p>
        </div>
        <p className="sr-only">
          {trainingPlan2027.introAr} {trainingPlan2027.introEn}
        </p>
        <ol dir="rtl" className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {trainingPlan2027.items.map((item, i) => (
            <li key={item.en} className="card flex flex-col p-5">
              <div dir="rtl" className="flex items-start gap-3 font-ar">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-navy text-sm font-semibold tabular-nums text-glow"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold leading-snug text-heading">{item.ar}</h3>
                  <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink/80">{item.descAr}</p>
                </div>
              </div>
              <div dir="ltr" className="mt-3 border-t border-line/10 pt-3 text-left">
                <p className="text-sm font-semibold text-heading">{item.en}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{item.descEn}</p>
              </div>
              {item.view && (
                <button
                  type="button"
                  onClick={() => item.view && onNavigate(item.view)}
                  dir="ltr"
                  className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-label text-azure-700 hover:underline dark:text-glow"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  {NAV_BY_ID[item.view].name}
                </button>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-center justify-center gap-2 text-caption text-ink/60">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          {trainingPlan2027.items.length} programmes and workshops · Child Health Section
        </p>
      </section>

      {/* ===== Wilayats ===== */}
      <section>
        <div dir="rtl" className="mb-5 text-center font-ar" data-reveal>
          <h2 className="text-2xl font-extrabold text-heading">ولايات شمال الباطنة</h2>
          <p className="text-sm text-ink/70">ست ولايات تغطيها خدمات الدائرة</p>
          <p dir="ltr" className="mt-1 font-sans text-sm text-ink/70">The Six Wilayat of North Batinah</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
          {wilayats.map((w) => (
            <WilayatCard key={w.en} w={w} />
          ))}
        </div>
        <p className="mt-3 text-center text-caption text-ink/60">
          ANC by wilayat is reported for 2025 only; 2023 and 2024 wilayat figures are not in the
          source files. Governorate ANC for all three years is on the Overview.
        </p>
      </section>

      {/* ===== CTA finale ===== */}
      <section
        className="relative overflow-hidden rounded-[4px] bg-navy p-8 text-center text-white dark:bg-navy-900 sm:p-10"
        data-reveal
      >
        <div className="relative">
          <h2 dir="rtl" lang="ar" className="font-ar text-2xl font-extrabold">
            المؤشرات الصحية للأعوام 2023 و2024 و2025
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
            Explore the 2023, 2024 and 2025 monitoring dashboards — screening, maternal
            care, perinatal outcomes and family planning — across the six wilayat of North
            Batinah.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="btn-glow mt-6"
          >
            <span lang="ar" dir="rtl" className="font-ar">استعراض لوحات المؤشرات</span>
            <span aria-hidden="true">·</span>
            <span>Open Dashboards</span>
          </button>
        </div>
      </section>
    </div>
  )
}

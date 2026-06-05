import {
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
  navy: 'before:bg-navy',
  azure: 'before:bg-azure',
  teal: 'before:bg-teal-600',
}
const SECTION_ICONBG: Record<Section['accent'], string> = {
  navy: 'bg-tint/10 text-heading',
  azure: 'bg-azure/10 text-azure',
  teal: 'bg-teal/15 text-teal-700',
}

const ancFor = (key: string): number =>
  mc.byWilayat2025.find((w) => w.wilayat === key)?.newAnc ?? 0

export default function About({ onNavigate }: ViewProps) {
  return (
    <div className="space-y-10">
      {/* ===== Official letterhead ===== */}
      <section className="flex justify-center rounded-2xl border border-line/10 bg-white px-6 py-7 shadow-card transition-colors duration-300 dark:border-white/10 dark:bg-navy">
        <img
          src="/moh-logo-navy.png"
          alt="وزارة الصحة — Ministry of Health, Oman"
          className="block max-h-36 w-auto dark:hidden"
        />
        <img
          src="/moh-logo-white.png"
          alt=""
          aria-hidden="true"
          className="hidden max-h-36 w-auto dark:block"
        />
      </section>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-700 to-navy-800 px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-azure/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <span className="chip bg-white/10 text-teal">
            <Sparkles className="h-3.5 w-3.5" />
            الخطة الخمسية الحادية عشرة · 2026–2030
          </span>

          <h1
            dir="rtl"
            className="mt-5 font-ar text-3xl font-extrabold leading-tight sm:text-5xl"
          >
            {department.nameAr}
          </h1>
          <p className="mt-2 text-lg font-semibold text-teal sm:text-2xl">
            {department.nameEn}
          </p>

          <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-teal to-azure" />

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
            <span dir="rtl" className="flex items-center gap-2 font-ar">
              <MapPin className="h-4 w-4 text-teal" />
              {department.governorateAr}
            </span>
            <span dir="rtl" className="flex items-center gap-2 font-ar">
              <Building2 className="h-4 w-4 text-teal" />
              {department.authorityAr}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('overview')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-navy-900 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              استعراض لوحات المؤشرات · View Dashboards
            </button>
            <button
              onClick={() => onNavigate('asd')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              المؤشرات الصحية 2023–2025
            </button>
          </div>
        </div>
      </section>

      {/* ===== Governorate context ===== */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { v: int(demographics.population2025), labEn: 'Population (2025)', labAr: 'إجمالي السكان' },
          { v: int(demographics.under18Omani), labEn: 'Omanis under 18', labAr: 'العُمانيون دون 18' },
          { v: int(demographics.liveBirths2025), labEn: 'Live Births (2025)', labAr: 'المواليد الأحياء' },
          { v: `${demographics.birthRate2025}`, labEn: 'Crude Birth Rate', labAr: 'معدل المواليد الخام', unit: '‰' },
        ].map((s) => (
          <div key={s.labEn} className="card p-4 text-center">
            <p className="text-2xl font-extrabold tracking-tight text-heading">
              {s.v}
              {s.unit && <span className="text-base text-ink/40"> {s.unit}</span>}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-ink/65">{s.labEn}</p>
            <p dir="rtl" className="font-ar text-[0.72rem] text-ink/45">{s.labAr}</p>
          </div>
        ))}
      </section>

      {/* ===== Vision & Mission ===== */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="card relative overflow-hidden p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint/10 text-heading">
              <Eye className="h-5 w-5" />
            </span>
            <div dir="rtl" className="font-ar">
              <h2 className="text-xl font-extrabold text-heading">الرؤية</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-azure">
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
          <p className="mt-3 border-t border-line/5 pt-3 text-sm leading-relaxed text-ink/60">
            {vision.en}
          </p>
        </article>

        <article className="card relative overflow-hidden p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/15 text-teal-700">
              <Compass className="h-5 w-5" />
            </span>
            <div dir="rtl" className="font-ar">
              <h2 className="text-xl font-extrabold text-heading">الرسالة</h2>
              <p className="text-xs font-semibold uppercase tracking-wide text-azure">
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
          <p className="mt-3 border-t border-line/5 pt-3 text-sm leading-relaxed text-ink/60">
            {mission.en}
          </p>
        </article>
      </section>

      {/* ===== Values ===== */}
      <section>
        <div dir="rtl" className="mb-4 text-center font-ar">
          <h2 className="text-2xl font-extrabold text-heading">القِيَم</h2>
          <p className="text-sm text-ink/55">
            القيم المؤسسية الموجِّهة للعمل · Our Core Values
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
          {values.map((v) => {
            const Icon = VALUE_ICONS[v.iconKey]
            return (
              <article key={v.en} className="card p-4 transition-shadow hover:shadow-card-hover">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-600 text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 dir="rtl" className="mt-3 font-ar text-lg font-bold text-heading">
                  {v.ar}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-azure">
                  {v.en}
                </p>
                <p dir="rtl" className="mt-2 font-ar text-[0.8rem] leading-relaxed text-ink/65">
                  {v.descAr}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ===== Department sections / مهام الأقسام ===== */}
      <section>
        <div dir="rtl" className="mb-4 text-center font-ar">
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-azure">
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
        <div dir="rtl" className="mb-4 text-center font-ar">
          <h2 className="text-2xl font-extrabold text-heading">ولايات شمال الباطنة</h2>
          <p className="text-sm text-ink/55">
            ست ولايات تغطيها خدمات الدائرة · The Six Wilayat of North Batinah
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
          {wilayats.map((w) => (
            <article
              key={w.en}
              className="card group p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mist text-heading ring-1 ring-line/10">
                <MapPin className="h-5 w-5" />
              </span>
              <h3 dir="rtl" className="mt-3 font-ar text-lg font-extrabold text-heading">
                {w.ar}
              </h3>
              <p className="text-xs font-semibold text-ink/55">{w.en}</p>
              <p dir="rtl" className="mt-1 font-ar text-[0.7rem] text-ink/45">
                {w.note}
              </p>
              <div className="mt-3 border-t border-line/5 pt-2">
                <p className="text-base font-extrabold text-azure">{int(ancFor(w.dataKey))}</p>
                <p className="text-[0.62rem] font-medium uppercase tracking-wide text-ink/45">
                  ANC 2025
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== CTA footer ===== */}
      <section className="rounded-2xl border border-line/10 bg-surface p-6 text-center shadow-card">
        <h2 dir="rtl" className="font-ar text-xl font-extrabold text-heading">
          المؤشرات الصحية للأعوام 2023 و2024 و2025
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink/60">
          Explore eight monitoring dashboards — screening, maternal care, perinatal
          outcomes and family planning — across the six wilayat of North Batinah.
        </p>
        <button
          onClick={() => onNavigate('overview')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          استعراض لوحات المؤشرات · Open Dashboards
        </button>
      </section>
    </div>
  )
}

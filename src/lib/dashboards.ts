import {
  Apple,
  Baby,
  Brain,
  Dna,
  Droplets,
  Home,
  HeartPulse,
  LayoutDashboard,
  Microscope,
  ShieldAlert,
  Stethoscope,
  TestTubes,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type ViewId =
  | 'about'
  | 'overview'
  | 'asd'
  | 'ds'
  | 'md'
  | 'mt'
  | 'ca'
  | 'sn'
  | 'ns'
  | 'mc'
  | 'fp'
  | 'cn'
  | 'an'

/** Top-level grouping used to segregate the sidebar into care domains. */
export type NavGroup = 'general' | 'women' | 'children'

export interface ViewProps {
  onNavigate: (id: ViewId) => void
}

export interface NavItem {
  id: ViewId
  code: string
  name: string
  /** Short blurb shown on the overview cards. */
  blurb: string
  icon: LucideIcon
  group: NavGroup
}

export interface NavGroupMeta {
  id: Exclude<NavGroup, 'general'>
  label: string
  labelAr: string
}

/** Rendered as labelled sections in the sidebar, in this order. */
export const NAV_GROUPS: NavGroupMeta[] = [
  { id: 'women', label: "Women's Health", labelAr: 'صحة المرأة' },
  { id: 'children', label: "Children's Health", labelAr: 'صحة الطفل' },
]

export const NAV: NavItem[] = [
  // ── General ──
  {
    id: 'about',
    code: '',
    name: 'Home · الرئيسية',
    blurb: 'Vision, mission & department sections',
    icon: Home,
    group: 'general',
  },
  {
    id: 'overview',
    code: '',
    name: 'Overview',
    blurb: 'Governorate-wide headline indicators',
    icon: LayoutDashboard,
    group: 'general',
  },

  // ── Women's Health ──
  {
    id: 'mc',
    code: 'MC',
    name: 'Maternal Care',
    blurb: 'Antenatal, screening & delivery indicators',
    icon: Stethoscope,
    group: 'women',
  },
  {
    id: 'md',
    code: 'MD',
    name: 'Maternal Deaths',
    blurb: '10-year surveillance, causes & records',
    icon: HeartPulse,
    group: 'women',
  },
  {
    id: 'fp',
    code: 'FP',
    name: 'Family Planning',
    blurb: 'Contraceptive uptake & premarital screening',
    icon: Users,
    group: 'women',
  },

  // ── Children's Health ──
  {
    id: 'asd',
    code: 'ASD',
    name: 'ASD Early Screening',
    blurb: '18 & 24-month developmental (M-CHAT/R) screening',
    icon: Brain,
    group: 'children',
  },
  {
    id: 'ds',
    code: 'DS',
    name: 'Down Syndrome',
    blurb: 'Registry, associated morbidities & nutrition',
    icon: Dna,
    group: 'children',
  },
  {
    id: 'ca',
    code: 'CA',
    name: 'Congenital Anomalies',
    blurb: 'Notifications by facility, sector & trend',
    icon: Microscope,
    group: 'children',
  },
  {
    id: 'sn',
    code: 'SN',
    name: 'Stillbirth & Neonatal',
    blurb: 'Perinatal mortality & ICD-PM classification',
    icon: Baby,
    group: 'children',
  },
  {
    id: 'ns',
    code: 'NS',
    name: 'Newborn Screening',
    blurb: 'Congenital hypothyroidism (TSH), hearing & developmental visits',
    icon: TestTubes,
    group: 'children',
  },
  {
    id: 'mt',
    code: 'CM',
    name: 'Child Maltreatment',
    blurb: 'Notifications by wilayat, type & trend',
    icon: ShieldAlert,
    group: 'children',
  },
  {
    id: 'cn',
    code: 'CN',
    name: 'Child Nutrition',
    blurb: 'Malnutrition categories & infant feeding',
    icon: Apple,
    group: 'children',
  },
  {
    id: 'an',
    code: 'AN',
    name: 'Child Anaemia',
    blurb: '9 & 18-month anaemia screening',
    icon: Droplets,
    group: 'children',
  },
]

export const NAV_BY_ID: Record<ViewId, NavItem> = NAV.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<ViewId, NavItem>,
)

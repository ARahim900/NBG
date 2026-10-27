import {
  Apple,
  Baby,
  Brain,
  ClipboardList,
  Dna,
  Droplets,
  Home,
  HeartPulse,
  LayoutDashboard,
  Map as MapIcon,
  PieChart,
  Microscope,
  Milk,
  Network,
  Images,
  ShieldAlert,
  Stethoscope,
  TestTubes,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type ViewId =
  | 'about'
  | 'overview'
  | 'wch-team'
  | 'gallery'
  | 'pop'
  | 'map'
  | 'asd'
  | 'ds'
  | 'md'
  | 'mt'
  | 'ca'
  | 'sn'
  | 'ns'
  | 'children/newborn-screening/extended-newborn-screening-2026'
  | 'ecr'
  | 'mc'
  | 'fp'
  | 'cn'
  | 'bfhi'
  | 'an'

/** Top-level grouping used to segregate the sidebar into care domains. */
export type NavGroup = 'general' | 'region' | 'women' | 'children'

export interface ViewProps {
  onNavigate: (id: ViewId) => void
}

export interface NavItem {
  id: ViewId
  code: string
  name: string
  /** Short blurb shown on the overview cards. */
  blurb: string
  /** Label for the narrow mobile bottom bar, when `name` is too long. */
  short?: string
  icon: LucideIcon
  group: NavGroup
  parentId?: ViewId
}

export interface NavGroupMeta {
  id: Exclude<NavGroup, 'general'>
  label: string
  labelAr: string
}

/** Rendered as labelled sections in the sidebar, in this order. */
export const NAV_GROUPS: NavGroupMeta[] = [
  { id: 'region', label: 'Governorate', labelAr: 'المحافظة' },
  { id: 'women', label: "Women's & Reproductive Health", labelAr: 'صحة المرأة والصحة الإنجابية' },
  { id: 'children', label: "Children's Health", labelAr: 'صحة الطفل' },
]

export const NAV: NavItem[] = [
  // ── General ──
  {
    id: 'about',
    code: '',
    name: 'Home · الرئيسية',
    short: 'Home',
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

  {
    id: 'wch-team',
    code: '',
    name: 'WCH Team Structure',
    short: 'Team',
    blurb: 'Women and Child Health Department leadership and team structure',
    icon: Network,
    group: 'general',
  },

  {
    id: 'gallery',
    code: '',
    name: 'Gallery',
    blurb: 'Photographs and highlights from Women and Child Health activities',
    icon: Images,
    group: 'general',
  },

  // ── Governorate (population & geography) ──
  {
    id: 'map',
    code: 'MAP',
    name: 'Health Centre Map',
    blurb: 'Map of the six wilayat: population, under-5s, women 15–49 and ANC rate',
    icon: MapIcon,
    group: 'region',
  },
  {
    id: 'pop',
    code: 'POP',
    name: 'Population 2025',
    blurb: 'Catchment populations, age pyramid & coverage denominators',
    icon: PieChart,
    group: 'region',
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
    blurb: 'Congenital hypothyroidism (TSH) & neonatal hearing screening',
    icon: TestTubes,
    group: 'children',
  },
  {
    id: 'children/newborn-screening/extended-newborn-screening-2026',
    code: '',
    name: 'Extended Newborn Screening 2026',
    short: 'Extended Screening 2026',
    blurb: 'Provisional maternity and laboratory screening reports for 2026',
    icon: TestTubes,
    group: 'children',
    parentId: 'ns',
  },
  {
    id: 'ecr',
    code: 'ECR',
    name: 'Extra Child Health Register',
    short: 'Child Register',
    blurb: '3 & 4-year developmental visits and child-health programme activity',
    icon: ClipboardList,
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
    blurb: 'Malnutrition categories and cases by wilayat',
    icon: Apple,
    group: 'children',
  },
  {
    id: 'bfhi',
    code: '',
    name: 'Breast Feeding & BFHI',
    blurb: 'Breastfeeding specialists, training and infant-feeding patterns',
    icon: Milk,
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

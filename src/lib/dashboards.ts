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
  | 'mc'
  | 'fp'
  | 'cn'
  | 'an'

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
}

export const NAV: NavItem[] = [
  {
    id: 'about',
    code: '',
    name: 'Home · الرئيسية',
    blurb: 'Vision, mission & department sections',
    icon: Home,
  },
  {
    id: 'overview',
    code: '',
    name: 'Overview',
    blurb: 'Governorate-wide headline indicators',
    icon: LayoutDashboard,
  },
  {
    id: 'asd',
    code: 'ASD',
    name: 'ASD Early Screening',
    blurb: '18 & 24-month developmental (M-CHAT/R) screening',
    icon: Brain,
  },
  {
    id: 'ds',
    code: 'DS',
    name: 'Down Syndrome',
    blurb: 'Registry, associated morbidities & nutrition',
    icon: Dna,
  },
  {
    id: 'md',
    code: 'MD',
    name: 'Maternal Deaths',
    blurb: '10-year surveillance, causes & records',
    icon: HeartPulse,
  },
  {
    id: 'mt',
    code: 'CM',
    name: 'Child Maltreatment',
    blurb: 'Notifications by wilayat, type & trend',
    icon: ShieldAlert,
  },
  {
    id: 'ca',
    code: 'CA',
    name: 'Congenital Anomalies',
    blurb: 'Notifications by facility, sector & trend',
    icon: Microscope,
  },
  {
    id: 'sn',
    code: 'SN',
    name: 'Stillbirth & Neonatal',
    blurb: 'Perinatal mortality & ICD-PM classification',
    icon: Baby,
  },
  {
    id: 'mc',
    code: 'MC',
    name: 'Maternal Care',
    blurb: 'Antenatal, screening & delivery indicators',
    icon: Stethoscope,
  },
  {
    id: 'fp',
    code: 'FP',
    name: 'Family Planning',
    blurb: '5-year-plan, contraception & newborn screening',
    icon: Users,
  },
  {
    id: 'cn',
    code: 'CN',
    name: 'Child Nutrition',
    blurb: 'Malnutrition categories & infant feeding',
    icon: Apple,
  },
  {
    id: 'an',
    code: 'AN',
    name: 'Child Anaemia',
    blurb: '9 & 18-month anaemia screening',
    icon: Droplets,
  },
]

export const NAV_BY_ID: Record<ViewId, NavItem> = NAV.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<ViewId, NavItem>,
)

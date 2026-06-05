import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import type { ViewId } from './lib/dashboards'
import About from './views/About'
import Overview from './views/Overview'
import Asd from './views/Asd'
import DownSyndrome from './views/DownSyndrome'
import MaternalDeaths from './views/MaternalDeaths'
import ChildMaltreatment from './views/ChildMaltreatment'
import CongenitalAnomalies from './views/CongenitalAnomalies'
import StillbirthNeonatal from './views/StillbirthNeonatal'
import NewbornScreening from './views/NewbornScreening'
import MaternalCare from './views/MaternalCare'
import FamilyPlanning from './views/FamilyPlanning'
import ChildNutrition from './views/ChildNutrition'
import ChildAnaemia from './views/ChildAnaemia'

const VIEWS: Record<ViewId, (props: { onNavigate: (id: ViewId) => void }) => JSX.Element> = {
  about: About,
  overview: Overview,
  asd: Asd,
  ds: DownSyndrome,
  md: MaternalDeaths,
  mt: ChildMaltreatment,
  ca: CongenitalAnomalies,
  sn: StillbirthNeonatal,
  ns: NewbornScreening,
  mc: MaternalCare,
  fp: FamilyPlanning,
  cn: ChildNutrition,
  an: ChildAnaemia,
}

export default function App() {
  const [active, setActive] = useState<ViewId>('about')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = (id: ViewId) => {
    setActive(id)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const View = VIEWS[active]

  return (
    <div className="min-h-screen lg:pl-72">
      <Sidebar
        active={active}
        onSelect={navigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-col">
        <Header active={active} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={active} className="mx-auto max-w-7xl animate-fade-up">
            <View onNavigate={navigate} />
          </div>
        </main>
        <footer className="border-t border-line/10 bg-surface px-4 py-5 text-center text-xs text-ink/45 transition-colors duration-300 sm:px-6 lg:px-8">
          Health Monitoring Dashboards · North Batinah Governorate · Women &amp; Child
          Health Department · Ministry of Health, Oman · Data 2023–2025
        </footer>
      </div>
    </div>
  )
}

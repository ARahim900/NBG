import ExtendedNewbornScreening2026 from '../components/reports/ExtendedNewbornScreening2026'

export default function ExtendedNewbornScreening() {
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-caption text-ink/75">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>Children</li>
          <li aria-hidden="true">/</li>
          <li><a href="#/ns" className="underline underline-offset-4 hover:text-heading">Newborn Screening</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Extended Newborn Screening 2026</li>
        </ol>
      </nav>
      <ExtendedNewbornScreening2026 />
    </div>
  )
}

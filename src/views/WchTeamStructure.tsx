import { ArrowDown, ArrowRight, UserRound } from 'lucide-react'
import { director, teamDepartments, type TeamMember } from '../data/wchTeam'

function Portrait({ member }: { member: TeamMember }) {
  return member.photo ? (
    <img src={member.photo} alt={member.name} width={96} height={96} decoding="async"
      className="h-24 w-24 shrink-0 rounded-full border-2 border-teal object-cover" />
  ) : (
    <span role="img" aria-label={`Photograph not yet supplied for ${member.name}`}
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-teal bg-mist text-heading dark:text-glow">
      <UserRound className="h-7 w-7" aria-hidden="true" />
    </span>
  )
}

function Person({ member }: { member: TeamMember }) {
  return (
    <div tabIndex={0} role="group" aria-label={member.name}
      className="group flex flex-col items-center gap-3 rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-4 focus-visible:ring-offset-surface">
      <div className="rounded-full transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-card-hover group-focus-visible:-translate-y-1 group-focus-visible:scale-105 group-focus-visible:shadow-card-hover motion-reduce:!transform-none motion-reduce:!transition-none">
        <Portrait member={member} />
      </div>
      <div>
        <p className="text-base font-semibold leading-snug text-heading dark:text-white">{member.name}</p>
        <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-heading/80 dark:text-white/75">{member.nameAr}</p>
      </div>
    </div>
  )
}

function DownConnector() {
  return (
    <div aria-hidden="true" className="flex h-10 justify-center text-teal">
      <ArrowDown className="h-10 w-5" strokeWidth={1.5} />
    </div>
  )
}

export default function WchTeamStructure() {
  return (
    <section aria-label="Women and Child Health Department organisation chart" className="mx-auto max-w-6xl pb-4">
      <p id="team-chart-help" className="mb-3 text-sm text-heading/80 dark:text-white/75 sm:hidden">Swipe horizontally to view the full team structure.</p>
      <div role="region" aria-label="Team structure diagram" aria-describedby="team-chart-help" tabIndex={0} className="overflow-x-auto rounded-xl pb-4 outline-none focus-visible:ring-2 focus-visible:ring-azure">
        <div className="min-w-[640px] px-1 pt-2">
          <div className="grid items-center gap-6 grid-cols-4">
            <div className="card col-span-2 col-start-2 p-6">
              <h2 className="text-center text-xl font-semibold leading-snug text-heading dark:text-white">Women and Child Health Department</h2>
              <p lang="ar" dir="rtl" className="mt-2 text-center font-ar text-base text-heading/80 dark:text-white/75">دائرة صحة المرأة والطفل</p>
              <p className="mb-3 mt-5 text-center text-sm font-medium text-heading/75 dark:text-glow">Director · <span lang="ar" dir="rtl" className="font-ar">مديرة الدائرة</span></p>
              <Person member={director} />
              <span aria-hidden="true" className="absolute -bottom-8 left-1/2 h-8 border-l-2 border-teal" />
            </div>
            <aside aria-label="Coordination, linked to the department director" className="card col-start-4 mx-auto w-full max-w-sm px-4 py-5 text-center">
              <ArrowRight aria-hidden="true" className="absolute -left-6 top-1/2 h-5 w-6 -translate-y-1/2 text-teal" />
              <h3 className="font-semibold text-heading dark:text-white">Coordination</h3>
              <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-heading/75 dark:text-white/75">التنسيق</p>
              <p className="sr-only">Linked directly to the department director.</p>
            </aside>
          </div>

          <ul aria-label="Departments reporting to Dr. Khadija Al Kindi" className="relative mt-8 grid grid-cols-3 gap-6 pt-8">
            <li aria-hidden="true" className="absolute left-[calc((100%_-_3rem)/6)] right-[calc((100%_-_3rem)/6)] top-0 border-t-2 border-teal" />
            {teamDepartments.map((department) => (
              <li key={department.id} className="relative min-w-0">
                <span aria-hidden="true" className="absolute -top-8 left-1/2 h-8 border-l-2 border-teal" />
                <section aria-labelledby={`team-${department.id}`}>
                  <div className="card min-h-[332px] px-3 py-5 xl:min-h-[268px] xl:px-5">
                    <h3 id={`team-${department.id}`} className="flex min-h-12 items-center justify-center text-center text-base font-semibold xl:min-h-0 xl:text-lg text-heading dark:text-white">{department.name}</h3>
                    <p lang="ar" dir="rtl" className="mb-5 mt-1 text-center font-ar text-sm text-heading/80 dark:text-white/75">{department.nameAr}</p>
                    <Person member={department.lead} />
                  </div>
                  <DownConnector />
                  {department.member ? (
                    <div className="card p-5">
                      <Person member={department.member} />
                      <p className="mt-3 text-center text-sm font-medium text-heading/80 dark:text-white/80">{department.member.role}</p>
                      <p lang="ar" dir="rtl" className="mt-1 text-center font-ar text-sm text-heading/75 dark:text-white/75">{department.member.roleAr}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-navy/25 px-5 py-8 text-center dark:border-teal/40">
                      <p className="text-sm font-medium text-heading/75 dark:text-white/75">Staff to be confirmed</p>
                      <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-heading/65 dark:text-white/65">الكادر — يُستكمل</p>
                    </div>
                  )}
                </section>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

import { ArrowDown, ArrowRight, UserRound } from 'lucide-react'
import { director, teamDepartments, type TeamMember } from '../data/wchTeam'

function Portrait({ member }: { member: TeamMember }) {
  return member.photo ? (
    <img src={member.photo} alt={member.name} width={96} height={96} decoding="async"
      className="h-24 w-24 shrink-0 rounded-full border-2 border-[#A4C5BB] object-cover" />
  ) : (
    <span role="img" aria-label={`Photograph not yet supplied for ${member.name}`}
      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-[#A4C5BB] bg-[#A4C5BB]/15 text-[#4E4456] dark:text-[#A4C5BB]">
      <UserRound className="h-7 w-7" aria-hidden="true" />
    </span>
  )
}

function Person({ member }: { member: TeamMember }) {
  return (
    <div tabIndex={0} role="group" aria-label={member.name}
      className="group flex flex-col items-center gap-3 rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-[#A4C5BB] focus-visible:ring-offset-4 focus-visible:ring-offset-surface">
      <div className="rounded-full transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-[0_8px_20px_#4E445626] group-focus-visible:-translate-y-1 group-focus-visible:scale-105 group-focus-visible:shadow-[0_8px_20px_#4E445626] motion-reduce:!transform-none motion-reduce:!transition-none">
        <Portrait member={member} />
      </div>
      <div>
        <p className="text-base font-semibold leading-snug text-[#4E4456] dark:text-white">{member.name}</p>
        <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-[#4E4456]/80 dark:text-white/75">{member.nameAr}</p>
      </div>
    </div>
  )
}

function DownConnector() {
  return (
    <div aria-hidden="true" className="flex h-10 justify-center text-[#A4C5BB]">
      <ArrowDown className="h-10 w-5" strokeWidth={1.5} />
    </div>
  )
}

export default function WchTeamStructure() {
  return (
    <section aria-label="Women and Child Health Department organisation chart" className="mx-auto max-w-6xl pb-4">
      <div className="grid items-center gap-6 xl:grid-cols-4">
        <div className="relative rounded-2xl border border-[#4E4456]/25 bg-[#4E4456]/5 p-6 shadow-sm dark:border-[#A4C5BB]/30 dark:bg-[#4E4456]/20 xl:col-span-2 xl:col-start-2">
          <h2 className="text-center text-xl font-semibold leading-snug text-[#4E4456] dark:text-white">Women and Child Health Department</h2>
          <p lang="ar" dir="rtl" className="mt-2 text-center font-ar text-base text-[#4E4456]/80 dark:text-white/75">دائرة صحة المرأة والطفل</p>
          <p className="mb-3 mt-5 text-center text-sm font-medium text-[#4E4456]/75 dark:text-[#A4C5BB]">Director · <span lang="ar" dir="rtl" className="font-ar">مديرة الدائرة</span></p>
          <Person member={director} />
          <span aria-hidden="true" className="absolute -bottom-8 left-1/2 hidden h-8 border-l-2 border-[#A4C5BB] xl:block" />
        </div>
        <aside aria-label="Coordination, linked to the department director" className="relative mx-auto w-full max-w-sm rounded-xl border border-[#A4C5BB] bg-surface px-4 py-5 text-center xl:col-start-4">
          <ArrowRight aria-hidden="true" className="absolute -left-6 top-1/2 hidden h-5 w-6 -translate-y-1/2 text-[#A4C5BB] xl:block" />
          <h3 className="font-semibold text-[#4E4456] dark:text-white">Coordination</h3>
          <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-[#4E4456]/75 dark:text-white/75">التنسيق</p>
          <p className="sr-only">Linked directly to the department director.</p>
        </aside>
      </div>

      <ul aria-label="Departments reporting to Dr. Khadija Al Kindi" className="relative mt-8 grid gap-7 xl:grid-cols-3 xl:gap-6 xl:pt-8">
        <li aria-hidden="true" className="absolute left-[calc((100%_-_3rem)/6)] right-[calc((100%_-_3rem)/6)] top-0 hidden border-t-2 border-[#A4C5BB] xl:block" />
        {teamDepartments.map((department) => (
          <li key={department.id} className="relative min-w-0">
            <span aria-hidden="true" className="absolute -top-8 left-1/2 hidden h-8 border-l-2 border-[#A4C5BB] xl:block" />
            <section aria-labelledby={`team-${department.id}`}>
              <div className="rounded-2xl border border-[#A4C5BB] bg-[#A4C5BB]/15 p-5 shadow-sm xl:min-h-[250px]">
                <h3 id={`team-${department.id}`} className="text-center text-lg font-semibold text-[#4E4456] dark:text-white">{department.name}</h3>
                <p lang="ar" dir="rtl" className="mb-5 mt-1 text-center font-ar text-sm text-[#4E4456]/80 dark:text-white/75">{department.nameAr}</p>
                <Person member={department.lead} />
              </div>
              <DownConnector />
              {department.member ? (
                <div className="rounded-xl border border-[#4E4456]/20 bg-surface p-5 shadow-sm dark:border-[#A4C5BB]/40">
                  <Person member={department.member} />
                  <p className="mt-3 text-center text-sm font-medium text-[#4E4456]/80 dark:text-white/80">{department.member.role}</p>
                  <p lang="ar" dir="rtl" className="mt-1 text-center font-ar text-sm text-[#4E4456]/75 dark:text-white/75">{department.member.roleAr}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#4E4456]/25 px-5 py-8 text-center dark:border-[#A4C5BB]/40">
                  <p className="text-sm font-medium text-[#4E4456]/75 dark:text-white/75">Staff to be confirmed</p>
                  <p lang="ar" dir="rtl" className="mt-1 font-ar text-sm text-[#4E4456]/65 dark:text-white/65">الكادر — يُستكمل</p>
                </div>
              )}
            </section>
          </li>
        ))}
      </ul>
    </section>
  )
}

export interface TeamMember {
  name: string
  nameAr: string
  photo: string | null
}

export interface TeamDepartment {
  id: string
  name: string
  nameAr: string
  lead: TeamMember
  member?: TeamMember & { role: string; roleAr: string }
}

export const director: TeamMember = {
  name: 'Dr. Khadija Al Kindi',
  nameAr: 'د. خديجة الكندي',
  photo: '/team/khadija-al-kindi.jpg',
}

export const teamDepartments: TeamDepartment[] = [
  {
    id: 'women',
    name: "Women’s Health",
    nameAr: 'قسم صحة المرأة',
    lead: { name: 'Dr. Wafa Al Kiyumi', nameAr: 'د. وفاء الكيومية', photo: '/team/wafa-al-kiyumi.jpg' },
  },
  {
    id: 'reproductive',
    name: 'Reproductive Health',
    nameAr: 'قسم الصحة الإنجابية',
    lead: { name: 'Midwife Munira Al Balushi', nameAr: 'القابلة منيرة البلوشي', photo: '/team/munira-al-balushi.jpg' },
  },
  {
    id: 'child',
    name: 'Child Health',
    nameAr: 'قسم صحة الطفل',
    lead: { name: 'Dr. Wujood Al Shibli', nameAr: 'د. وجود الشبلي', photo: '/team/wajud-al-shibli.jpg' },
    member: {
      name: 'Dr. Khalid Al Raisi',
      nameAr: 'د. خالد الرئيسي',
      role: 'Child Protection Committee',
      roleAr: 'عضو لجنة حماية الطفل',
      photo: null,
    },
  },
]

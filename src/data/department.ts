import type { ViewId } from '../lib/dashboards'

/**
 * Department identity content — extracted verbatim from the official source
 * documents in the "fwd" folder:
 *   • Vision/Mission/Values: "Vision final 30-3" (EN) + "الرؤية نهائي بعد التعديل" (AR)
 *   • Section descriptions & objectives: صحة المرأة / الصحة الانجابية / صحة الطفل (PDF)
 */

export interface Bilingual {
  ar: string
  en: string
}

export const department = {
  nameAr: 'دائرة صحة المرأة والطفل',
  nameEn: 'Women & Child Health Department',
  governorateAr: 'محافظة شمال الباطنة',
  governorateEn: 'North Batinah Governorate',
  authorityAr: 'وزارة الصحة — سلطنة عُمان',
  authorityEn: 'Ministry of Health — Sultanate of Oman',
}

export const vision: Bilingual = {
  ar: 'نساء وأطفال ينعمون برعاية صحية عالية الجودة ومستدامة.',
  en: 'Women and children enjoy equitable access to high-quality, sustainable healthcare.',
}

export const mission: Bilingual = {
  ar: 'الارتقاء بصحة النساء والأطفال إلى أعلى المستويات من خلال تقديم خدمات صحية شاملة وعادلة وعالية الجودة، وتطوير السياسات الوطنية، وتعزيز الشراكات الفاعلة؛ بما يسهم في بناء أُسرٍ سليمة ومجتمع مزدهر.',
  en: 'To advance the health of women and children to the highest standards by delivering comprehensive and equitable healthcare services, developing national policies, and promoting effective partnerships — supporting resilient families and a prosperous society.',
}

export interface Value {
  ar: string
  en: string
  descAr: string
  iconKey: 'scale' | 'award' | 'flask' | 'users' | 'star' | 'shield' | 'handshake'
}

export const values: Value[] = [
  {
    ar: 'العدالة',
    en: 'Equity',
    descAr: 'ضمان الوصول العادل إلى الخدمات الصحية، مع إعطاء اهتمام خاص للفئات الأكثر احتياجًا.',
    iconKey: 'scale',
  },
  {
    ar: 'الجودة',
    en: 'Quality',
    descAr: 'الالتزام بأعلى معايير الجودة والسلامة في تقديم الرعاية الصحية.',
    iconKey: 'award',
  },
  {
    ar: 'الأدلة والابتكار',
    en: 'Evidence & Innovation',
    descAr: 'الاعتماد على البيانات والبحوث وأفضل الممارسات، وتشجيع الابتكار في توجيه السياسات وتطوير الخدمات.',
    iconKey: 'flask',
  },
  {
    ar: 'التمكين وبناء القدرات',
    en: 'Empowerment & Capacity',
    descAr: 'تعزيز قدرات الكادر الصحي والأسر والمجتمع من خلال التدريب ونقل المعرفة وتطوير المهارات.',
    iconKey: 'users',
  },
  {
    ar: 'التميز المؤسسي',
    en: 'Institutional Excellence',
    descAr: 'السعي المستمر نحو التميز في الأداء المؤسسي وتحقيق أفضل النتائج وفق المعايير الوطنية والدولية.',
    iconKey: 'star',
  },
  {
    ar: 'المرونة والاستجابة',
    en: 'Resilience & Responsiveness',
    descAr: 'القدرة على الاستجابة الفاعلة للتحديات الصحية والمتغيرات والطوارئ.',
    iconKey: 'shield',
  },
  {
    ar: 'التعاون والشراكة',
    en: 'Collaboration & Partnership',
    descAr: 'تعزيز العمل التكاملي والتعاون الفعّال مع الجهات المعنية والمجتمع المحلي والمنظمات الدولية.',
    iconKey: 'handshake',
  },
]

export interface Section {
  id: string
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  objectivesAr: string[]
  iconKey: 'woman' | 'reproductive' | 'child'
  accent: 'navy' | 'azure' | 'teal'
}

export const sections: Section[] = [
  {
    id: 'women',
    titleAr: 'قسم صحة المرأة',
    titleEn: "Women's Health",
    descAr:
      'برنامج تنفيذي يهدف إلى تحسين صحة النساء وتعزيز جودة حياتهن من خلال خدمات صحية شاملة ومتخصصة، مع تعزيز الوعي بحقوق المرأة الصحية، وتقليل معدلات الوفيات والمراضة، والكشف المبكر عن سرطان الثدي وعنق الرحم.',
    descEn:
      "Improves women's health and quality of life through comprehensive, specialised services — raising awareness of health rights, reducing mortality and morbidity, and enabling early detection of breast and cervical cancer.",
    objectivesAr: [
      'رفع الوعي المجتمعي حول صحة المرأة',
      'توفير حزمة من الفحوصات الدورية للكشف المبكر عن سرطان عنق الرحم وسرطان الثدي',
      'توفير خدمات تشخيص وعلاج أمراض النساء',
      'تقديم المشورة والدعم النفسي والعلاج للنساء خاصة في مرحلة سن الأمان',
      'تعزيز قدرات الكوادر الطبية في مجال صحة المرأة',
      'تعزيز حقوق المرأة في الصحة الجنسية والإنجابية ودعم مشاركتها في القرارات المتعلقة بصحتها',
    ],
    iconKey: 'woman',
    accent: 'navy',
  },
  {
    id: 'reproductive',
    titleAr: 'قسم الصحة الإنجابية',
    titleEn: 'Reproductive Health',
    descAr:
      'برنامج تنفيذي لتعزيز جودة وكفاءة خدمات الصحة الإنجابية بهدف خفض المراضة والوفيات المرتبطة بها، ويشمل الفحص قبل الزواج، والرعاية السابقة للحمل، ورعاية الحمل والولادة والنفاس، والتخطيط الأسري، وعلاج العقم.',
    descEn:
      'Improves the quality and efficiency of reproductive-health services to reduce related morbidity and mortality — covering premarital screening, pre-pregnancy and antenatal/postnatal care, family planning, and infertility treatment.',
    objectivesAr: [
      'تعزيز جودة خدمات رعاية الحوامل والولادة ورعاية الأم بعد الولادة',
      'تعزيز الكشف المبكر عن التشوهات الخلقية أثناء الحمل',
      'تعزيز خدمات تنظيم الأسرة والمباعدة بين الولادات',
      'استحداث خدمات خاصة بالرعاية السابقة للحمل',
      'تعزيز خدمة تشخيص وعلاج تأخر الإنجاب (العقم)',
      'تعزيز رصد ومراجعة مراضة ووفيات الأمهات',
    ],
    iconKey: 'reproductive',
    accent: 'azure',
  },
  {
    id: 'child',
    titleAr: 'قسم صحة الطفل',
    titleEn: 'Child Health',
    descAr:
      'تُعنى بتنفيذ البرامج المعنية بصحة الأطفال والمراهقين من الولادة حتى سن 18 عامًا، من خلال استراتيجيات تعزيزية ووقائية وعلاجية تهدف إلى الحد من الأمراض وتحسين المؤشرات الصحية، وبناء جيل صحي قادر على الإسهام في التنمية المستدامة.',
    descEn:
      'Delivers promotive, preventive and curative programmes for children and adolescents from birth to age 18 — reducing disease burden, promoting healthy behaviours, and building a healthy generation through evidence-based interventions.',
    objectivesAr: [
      'تطوير الخدمات والبرامج التي تقدم لصحة الطفل',
      'تعزيز التشريعات والسياسات الداعمة لصحة الطفل',
      'التوسع في برنامج التقصي والكشف المبكر',
      'تعزيز كفاءة برنامج حماية الطفل والإبلاغ عن الإساءة',
      'تحسين الخدمات للأطفال ذوي الإعاقة',
      'استحداث برنامج يُعنى بصحة المراهقين وتعزيز خدمات الطفولة المبكرة',
    ],
    iconKey: 'child',
    accent: 'teal',
  },
]

export interface Wilayat {
  ar: string
  en: string
  /** Key matching mc.byWilayat2025 english name, for live ANC stat. */
  dataKey: string
  note: string
}

/** Governorate context — North Batinah, 2025 (source: د وجود demographic sheet). */
export const demographics = {
  population2025: 940532,
  omani: 609097,
  nonOmani: 331435,
  under18Omani: 260964,
  liveBirths2025: 11742,
  birthRate2025: 19.3,
}

export const wilayats: Wilayat[] = [
  { ar: 'صُحار', en: 'Sohar', dataKey: 'Sohar', note: 'مركز المحافظة' },
  { ar: 'صُحم', en: 'Saham', dataKey: 'Saham', note: 'ولاية ساحلية' },
  { ar: 'السويق', en: 'As Suwayq', dataKey: 'As Suwayq', note: 'ولاية ساحلية' },
  { ar: 'الخابورة', en: 'Al Khabourah', dataKey: 'Al Khabourah', note: 'ولاية ساحلية' },
  { ar: 'شناص', en: 'Shinas', dataKey: 'Shinas', note: 'أقصى الشمال' },
  { ar: 'لِوى', en: 'Liwa', dataKey: 'Liwa', note: 'حدودية شمالية' },
]

export interface TrainingItem {
  ar: string
  descAr: string
  en: string
  descEn: string
  /** Dashboard covering the same programme, when there is one. */
  view?: ViewId
}

/** Child Health Section training plan for 2027 (supplied by the section, October 2026). */
export const trainingPlan2027 = {
  titleAr: 'الخطة التدريبية لعام 2027م',
  titleEn: 'Training Plan 2027',
  ownerAr: 'دائرة صحة المرأة والطفل – قسم صحة الطفل',
  ownerEn: 'Women & Child Health Department – Child Health Section',
  introAr: 'تتضمن الخطة التدريبية البرامج وورش العمل الآتية:',
  introEn: 'The training plan includes the following programmes and workshops:',
  items: [
    {
      ar: 'التعرّف المبكر على اضطراب طيف التوحد',
      descAr: 'التدريب على آليات الكشف المبكر، وإدارة مسارات التقييم والإحالة.',
      en: 'Early identification of autism spectrum disorder',
      descEn: 'Training in early detection and in managing assessment and referral pathways.',
      view: 'asd',
    },
    {
      ar: 'التدريب على دليل الرعاية الشمولية للطفل',
      descAr: 'تأهيل الكوادر الصحية لتطبيق مفاهيم الرعاية الشمولية والمتكاملة للأطفال وممارساتها.',
      en: 'Comprehensive child care guide training',
      descEn: 'Preparing health staff to apply the concepts and practices of comprehensive, integrated child care.',
    },
    {
      ar: 'التدريب على دليل وفيات الإملاص ووفيات حديثي الولادة',
      descAr: 'تعزيز كفاءة الكوادر الصحية في تطبيق الدليل، وآليات مراجعة الحالات وتحليلها، والتعامل معها.',
      en: 'Stillbirth and neonatal death guideline training',
      descEn: 'Strengthening staff competence in applying the guideline, in reviewing and analysing cases, and in case management.',
      view: 'sn',
    },
    {
      ar: 'النقل الآمن للأطفال ذوي الحالات الحرجة',
      descAr: 'رفع كفاءة الكوادر الصحية في إجراءات التقييم والتجهيز والنقل الآمن للأطفال ذوي الحالات الحرجة.',
      en: 'Safe transport of critically ill children',
      descEn: 'Improving staff competence in the assessment, preparation and safe transport of critically ill children.',
      view: 'ecr',
    },
    {
      ar: 'برنامج سوء التغذية لدى الأطفال',
      descAr: 'تعزيز مهارات الكوادر الصحية في الكشف المبكر عن حالات سوء التغذية، وتقييمها، والتدخل فيها، ومتابعتها.',
      en: 'Child malnutrition programme',
      descEn: 'Strengthening staff skills in the early detection, assessment, management and follow-up of malnutrition.',
      view: 'cn',
    },
    {
      ar: 'برنامج حماية الأطفال من الإساءة',
      descAr: 'تطوير مهارات الكوادر الصحية في الكشف المبكر عن حالات الإساءة، والإبلاغ عنها، والتعامل معها وفق الإجراءات المعتمدة.',
      en: 'Child protection from abuse programme',
      descEn: 'Developing staff skills in the early detection and reporting of abuse, and in managing cases according to approved procedures.',
      view: 'mt',
    },
    {
      ar: 'اليوم العالمي لمتلازمة داون',
      descAr: 'تنظيم فعالية توعوية مصحوبة بورشة تدريبية لنقاط الارتكاز؛ لتعزيز المعرفة، وتطوير خدمات متابعة الأطفال ذوي متلازمة داون ورعايتهم.',
      en: 'World Down Syndrome Day',
      descEn: 'An awareness event with a training workshop for focal points, to build knowledge and develop follow-up and care services for children with Down syndrome.',
      view: 'ds',
    },
    {
      ar: 'ورشة عمل في الرضاعة الطبيعية',
      descAr: 'تعزيز معارف الكوادر الصحية ومهاراتها في تقديم المشورة والدعم للأمهات، وتشجيع ممارسات الرضاعة الطبيعية.',
      en: 'Breastfeeding workshop',
      descEn: 'Strengthening staff knowledge and skills in counselling and supporting mothers, and in promoting breastfeeding.',
      view: 'bfhi',
    },
  ] satisfies TrainingItem[],
}

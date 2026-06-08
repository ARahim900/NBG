# NBG Health Dashboards — Women & Child Health (2023–2025)

An interactive dashboard for the **Health Monitoring Dashboards of North Batinah
Governorate (NBG)** — Women & Child Health Department, Ministry of Health, Oman.
It visualises eight indicator areas across **2023, 2024 and 2025**.

Colours follow the Ministry of Health Oman eHealth-portal palette (navy
`#144066` · azure `#2884c6` · teal `#7cb6bc`).

## Pages

- **Home (الرئيسية)** — bilingual department landing page: vision (الرؤية), mission
  (الرسالة), the seven institutional values (القيم), the three department sections
  (مهام الأقسام: صحة المرأة، الصحة الإنجابية، صحة الطفل) with their 2026–2030 strategic
  objectives, and the six wilayat of North Batinah. Content extracted verbatim from
  the official department documents.
- **Overview** — governorate-wide headline KPIs and trends.

## Dashboards

| Code | Dashboard | Highlights |
|------|-----------|------------|
| ASD | ASD Early Screening | 18 & 24-month M-CHAT/R coverage, monthly 2025, risk detection |
| DS  | Down Syndrome | Registry by centre, morbidities, nutrition, 2025 governorate registry |
| MD  | Maternal Deaths | 10-year surveillance, causes, recent records |
| CM  | Child Maltreatment | Notifications by wilayat & type, 2019–2025 trend |
| CA  | Congenital Anomalies | By facility & sector, MOH-vs-private split |
| SN  | Stillbirth & Neonatal | Monthly perinatal mortality, ICD-PM coding, 2025 summary |
| MC  | Maternal Care | Antenatal/screening/delivery indicators, 2025 by wilayat |
| FP  | Family Planning | Contraception, premarital & newborn screening |
| CN  | Child Nutrition | Malnutrition categories, by wilayat, infant-feeding (EB) curve |
| AN  | Child Anaemia | 9 & 18-month screening coverage and anaemia prevalence by wilayat |

## Tech stack

- **React + TypeScript + Vite**
- **Tailwind CSS** for styling
- **Recharts** for charts · **lucide-react** for icons
- All data is bundled (no backend) from `src/data/nbg.json`

## Run locally

```bash
npm install      # first time only
npm run dev      # start dev server → http://localhost:5173
```

## Build for production

```bash
npm run build    # outputs static files to dist/
npm run preview  # preview the production build locally
```

## Deploy to Netlify

The repo includes `netlify.toml` and `public/_redirects`, so deployment is
zero-config:

1. **Drag-and-drop:** run `npm run build`, then drag the `dist/` folder onto
   <https://app.netlify.com/drop>.
2. **Git / CLI:** connect the repo (build command `npm run build`, publish
   directory `dist`) — the settings are already in `netlify.toml`.

## Data sources & accuracy

Figures are extracted from the original NBG web app (2023–2024 granular detail)
and three 2025 source workbooks (ASD, MCH statistics, WCH KPIs). Honest data
caveats — e.g. Maternal Deaths has no 2025 count in the sources, and some 2025
figures are governorate-level only — are flagged in-app on the **Overview** page
and within each dashboard.

# NBG Health Dashboards — Women & Child Health (2023–2025)

An interactive dashboard for the **Health Monitoring Dashboards of North Batinah
Governorate (NBG)** — Women & Child Health Department, Ministry of Health, Oman.
It covers eleven indicator dashboards across **2023, 2024 and 2025**, plus the
2025 population estimates and a governorate map.

Colours follow the Ministry of Health Oman eHealth-portal palette (navy
`#144066` · azure `#2884c6` · teal `#7cb6bc`).

## Pages

Every page has its own link (for example `…/#/map`), so a page can be
bookmarked, shared, refreshed or reached with the Back button.

| Link | Page | What it shows |
|------|------|---------------|
| `#/about` | **Home (الرئيسية)** | Vision, mission, values, department sections and 2026–2030 objectives |
| `#/overview` | **Overview** | Governorate headline KPIs and multi-year trends |
| `#/map` | **Health Centre Map** | North Batinah map: population heat layer, wilayat circles with totals and centre counts, every health centre's catchment |
| `#/pop` | **Population 2025** | Age–sex pyramid, catchment populations, target groups (under-5, women 15–49, 60+), service-to-population ratios, CSV export |

### Indicator dashboards

| Code | Link | Dashboard | Highlights |
|------|------|-----------|------------|
| MC  | `#/mc`  | Maternal Care | Antenatal, screening and delivery indicators; 2025 by wilayat |
| MD  | `#/md`  | Maternal Deaths | 10-year surveillance, causes, recent records |
| FP  | `#/fp`  | Family Planning | Contraception and premarital screening |
| ASD | `#/asd` | ASD Early Screening | 18 & 24-month M-CHAT/R coverage, monthly 2025, risk detection |
| DS  | `#/ds`  | Down Syndrome | Registry by centre, morbidities, nutrition, 2025 registry |
| CA  | `#/ca`  | Congenital Anomalies | By facility and sector, MOH-vs-private split |
| SN  | `#/sn`  | Stillbirth & Neonatal | Monthly perinatal mortality, ICD-PM coding, 2025 summary |
| NS  | `#/ns`  | Newborn Screening | TSH, hearing, 3 & 4-year developmental visits |
| CM  | `#/mt`  | Child Maltreatment | Notifications by wilayat and type, 2019–2025 trend |
| CN  | `#/cn`  | Child Nutrition | Malnutrition categories, infant feeding curve |
| AN  | `#/an`  | Child Anaemia | 9 & 18-month screening coverage and prevalence, treatment follow-up |

## Tech stack

- **React 18 + TypeScript + Vite**, **Tailwind CSS**
- **Recharts** (charts), **lucide-react** (icons), **GSAP** (motion), **three.js** (decorative 3D)
- Installable **PWA** with offline caching (`public/sw.js`)
- No backend: all data is bundled from `src/data/*.json`

Each page loads on demand, so the Home page does not download the charting
library. The 3D background is optional: if a computer has WebGL disabled the app
still works, and if one page fails the rest of the app keeps running.

## Run locally

```bash
npm install      # first time only
npm run dev      # start dev server → http://localhost:5173
npm run build    # type-check and build to dist/
npm run preview  # preview the production build
```

## Updating data

| Data | Source file | How to rebuild |
|------|-------------|----------------|
| Indicator dashboards | `src/data/nbg.json`, `src/data/nutrition.json` | Edited from the source workbooks |
| Population 2025 | `src/data/population.json` | `npm run build:population -- path/to/workbook.xlsx` (needs `pip install openpyxl`) |
| Base map | `src/data/map-base.json` | `npm run build:map` |
| Health-centre locations | `src/data/facility-locations.json` | Edit by hand (see below) |

`scripts/build_population.py` refuses to write the file if any institution's age
bands do not add up to its total row, so a malformed workbook cannot reach the app.

### Adding health-centre locations

The map pins a health centre only when its position has been verified. To add
one, open `src/data/facility-locations.json`, find the centre, and fill in:

```json
{ "en": "Sohar EHC", "wilayat": "Sohar", "lat": 24.3478, "lon": 56.7302, "source": "MOH facility register 2026" }
```

- `lat` / `lon`: decimal degrees (WGS84), e.g. from the facility register or a
  checked Google Maps pin (right-click → the first line is `lat, lon`).
- `source`: where the position came from, so it can be audited.
- Leave `null` until verified — the app never estimates a position.

The pin, the heat layer and the "Located" column update automatically.

## Deploy to Netlify

`netlify.toml` and `public/_redirects` make deployment zero-config:

1. **Drag-and-drop:** run `npm run build`, then drag `dist/` onto
   <https://app.netlify.com/drop>.
2. **Git / CLI:** connect the repo (build command `npm run build`, publish
   directory `dist`).

## Data sources & accuracy

Figures come from the original NBG web app (2023–2024 detail), the 2025 source
workbooks (ASD, MCH statistics, WCH KPIs) and the MOH 2025 population-estimates
workbook. Known caveats are shown in the app: on the **Overview** page, inside
each dashboard, and on the Population page, which also covers the reconciliation
of the population workbook's summary and detail sheets.

Map geography: coastline and borders from Natural Earth (public domain); wilayat
seat towns from GeoNames (CC BY 4.0).

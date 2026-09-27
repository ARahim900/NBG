# NBG Health Dashboards — Women & Child Health (2023–2025)

An interactive dashboard for the **Health Monitoring Dashboards of North Batinah
Governorate (NBG)** — Women & Child Health Department, Ministry of Health, Oman.
It covers eleven indicator dashboards across **2023, 2024 and 2025**, plus the
2025 population estimates and a governorate map.

The visual design follows the **Ministry of Health Oman branded template**
(*DS Conf – MOH Branded*): navy `#144066`, MOH blue `#0089DD`, teal `#4FA8B2`,
light-blue hairlines `#D7EAF9`, slate body text `#36465A`; serif (Georgia)
titles with the template's slanted accent tab; flat white cards with a thin
light-blue border and the cut top-right corner; the official MOH logo; and the
template's header, footer and cover layouts. Everything is flat — no gradients,
glows or animated backgrounds. Body text and figures use **DM Sans** (Muscat Bay
design system) and Arabic uses **Cairo**; all fonts are self-hosted, so they load
with no external request and work offline.

**Figures are never animated.** KPI values render at their final figure (no
count-ups) and charts draw without an entrance, so a screenshot or printout can
never capture an interim number. Bar and shaded-area charts start at zero with
evenly spaced ticks; a line chart that zooms in says so under the plot. The only
motion is a 150–200 ms fade when the page changes, and none at all when the
operating system asks for reduced motion.

## Pages

Every page has its own link (for example `…/#/map`), so a page can be
bookmarked, shared, refreshed or reached with the Back button.

| Link | Page | What it shows |
|------|------|---------------|
| `#/about` | **Home (الرئيسية)** | Vision, mission, values, department sections and 2026–2030 objectives |
| `#/overview` | **Overview** | Governorate headline KPIs and multi-year trends |
| `#/map` | **Health Centre Map** | North Batinah map: wilayat circles sized and coloured by the chosen metric, a ranked list and table linked to the map on hover, every health centre's catchment |
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
- **Recharts** (charts), **lucide-react** (icons); page fades use the browser's
  built-in Web Animations API (no animation library)
- **DM Sans**, **Cairo** and **Gelasio** (Georgia fallback) via `@fontsource-variable` (self-hosted)
- Every chart carries a plain-language data summary for screen readers
- Installable **PWA** with offline caching (`public/sw.js`)
- No backend: all data is bundled from `src/data/*.json`

Each page loads on demand, so the Home page does not download the charting
library. If one page fails, the rest of the app keeps running.

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

The pin, the location count and the "Located" column update automatically.

## Deploy

The repository is connected to **Vercel** (a preview is built for every pull
request). It also deploys to **Netlify** with no extra setup — `netlify.toml` and
`public/_redirects` are included. Page links use `#/…`, so no server rewrite
rules are needed on either host.

**Link previews.** `index.html` carries Open Graph tags, and the build adds
`og:url` / `og:image` (`public/og-image.jpg`, 1200 × 630) using the production
address Vercel or Netlify provide. On another host, set `SITE_URL` (for example
`https://dashboards.example.om`) before `npm run build`.

Netlify by hand:

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

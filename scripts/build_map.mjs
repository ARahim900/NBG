#!/usr/bin/env node
/**
 * Build src/data/map-base.json — the North Batinah base map (land, coastline,
 * UAE border) pre-projected to SVG coordinates, so the app ships no mapping
 * library and works offline.
 *
 * Usage:  npm run build:map
 *
 * Sources (both openly licensed, bundled via npm/PyPI because map-tile and
 * OSM APIs are not reachable from the build environment):
 *   • Coastline & borders: Natural Earth 1:10m countries v4.1.0 (public
 *     domain), via the `world-atlas` npm package.
 *   • Wilayat seat positions: GeoNames (CC BY 4.0) town coordinates.
 *
 * Health-centre coordinates are NOT generated here: they live in
 * src/data/facility-locations.json and must come from a verified source.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { feature } from 'topojson-client'

const require = createRequire(import.meta.url)
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-10m.json'), 'utf8'))

// Map window (degrees) — North Batinah coast from the UAE border to As Suwayq.
const LON0 = 56.1
const LON1 = 57.85
const LAT0 = 23.5
const LAT1 = 25.1
const WIDTH = 1000
const COS = Math.cos((((LAT0 + LAT1) / 2) * Math.PI) / 180)
const K = WIDTH / ((LON1 - LON0) * COS)
const HEIGHT = Math.round((LAT1 - LAT0) * K)

const project = ([lon, lat]) => [(lon - LON0) * COS * K, (LAT1 - lat) * K]

// GeoNames (CC BY 4.0) coordinates of each wilayat's seat town.
const SEATS = [
  { wilayat: 'Shinas', lat: 24.74333, lon: 56.46583 },
  { wilayat: 'Liwa', lat: 24.53611, lon: 56.56556 },
  { wilayat: 'Sohar', lat: 24.3643, lon: 56.74681 },
  { wilayat: 'Saham', lat: 24.17222, lon: 56.88861 },
  { wilayat: 'Al Khabourah', lat: 23.98864, lon: 57.09838 },
  { wilayat: 'As Suwayq', lat: 23.84944, lon: 57.43861 },
]

/** Sutherland–Hodgman clip of one ring against the (convex) map window. */
function clipRing(ring) {
  const edges = [
    { inside: (p) => p[0] >= LON0, cross: (a, b) => lerpAt(a, b, 0, LON0) },
    { inside: (p) => p[0] <= LON1, cross: (a, b) => lerpAt(a, b, 0, LON1) },
    { inside: (p) => p[1] >= LAT0, cross: (a, b) => lerpAt(a, b, 1, LAT0) },
    { inside: (p) => p[1] <= LAT1, cross: (a, b) => lerpAt(a, b, 1, LAT1) },
  ]
  let out = ring
  for (const e of edges) {
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      if (e.inside(cur)) {
        if (!e.inside(prev)) out.push(e.cross(prev, cur))
        out.push(cur)
      } else if (e.inside(prev)) {
        out.push(e.cross(prev, cur))
      }
    }
    if (out.length === 0) break
  }
  return out
}
function lerpAt(a, b, axis, v) {
  const t = (v - a[axis]) / (b[axis] - a[axis])
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

const onBorder = (p) =>
  Math.abs(p[0] - LON0) < 1e-9 || Math.abs(p[0] - LON1) < 1e-9 ||
  Math.abs(p[1] - LAT0) < 1e-9 || Math.abs(p[1] - LAT1) < 1e-9
const f1 = (v) => Math.round(v * 10) / 10

/** Returns { fill, edge }: a closed fill path, and an outline that skips the window frame. */
function paths(geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let fill = ''
  let edge = ''
  for (const poly of polys) {
    for (const ring of poly) {
      const c = clipRing(ring)
      if (c.length < 3) continue
      const pts = c.map(project).map(([x, y]) => [f1(x), f1(y)])
      fill += 'M' + pts.map((p) => p.join(',')).join('L') + 'Z'
      let pen = false
      for (let i = 0; i < c.length; i++) {
        const a = c[i]
        const b = c[(i + 1) % c.length]
        const frame = onBorder(a) && onBorder(b)
        if (frame) {
          pen = false
          continue
        }
        const pb = pts[(i + 1) % c.length]
        if (!pen) edge += 'M' + pts[i].join(',')
        edge += 'L' + pb.join(',')
        pen = true
      }
    }
  }
  return { fill, edge }
}

const countries = feature(topo, topo.objects.countries).features
const byName = (n) => {
  const f = countries.find((c) => c.properties.name === n)
  if (!f) throw new Error(`country "${n}" not found in Natural Earth data`)
  return f
}
const oman = paths(byName('Oman').geometry)
const uae = paths(byName('United Arab Emirates').geometry)

const out = {
  viewBox: [0, 0, WIDTH, HEIGHT],
  projection: { lon0: LON0, lat1: LAT1, cos: COS, k: K },
  oman,
  uae,
  seats: SEATS.map((s) => {
    const [x, y] = project([s.lon, s.lat])
    return { ...s, x: f1(x), y: f1(y) }
  }),
  attribution: {
    coastline: 'Natural Earth 1:10m v4.1.0 (public domain)',
    seats: 'GeoNames (CC BY 4.0)',
  },
}

const target = new URL('../src/data/map-base.json', import.meta.url)
writeFileSync(target, JSON.stringify(out) + '\n')
console.log(
  `Wrote src/data/map-base.json — ${WIDTH}×${HEIGHT}, Oman path ${oman.fill.length} chars, UAE ${uae.fill.length} chars`,
)

import base from './map-base.json'
import locations from './facility-locations.json'
import { INSTITUTIONS } from './population'

/**
 * Geography for the North Batinah map.
 *   • map-base.json — land, coastline and UAE border pre-projected to SVG
 *     units by scripts/build_map.mjs (Natural Earth), plus wilayat seat towns
 *     (GeoNames).
 *   • facility-locations.json — verified health-institution coordinates,
 *     maintained by hand. Entries without lat/lon are simply not pinned.
 */

export const MAP = base
export const [, , MAP_W, MAP_H] = base.viewBox

/** Same equirectangular projection the build script used. */
export const project = (lat: number, lon: number): [number, number] => [
  (lon - base.projection.lon0) * base.projection.cos * base.projection.k,
  (base.projection.lat1 - lat) * base.projection.k,
]

export const SEATS = base.seats

interface Location {
  en: string
  wilayat: string
  lat: number | null
  lon: number | null
  source: string | null
}

const inWindow = (x: number, y: number): boolean => x >= 0 && x <= MAP_W && y >= 0 && y <= MAP_H

/** Institutions with a usable, in-bounds position. */
export const PINNED = (locations.facilities as Location[]).flatMap((f) => {
  if (f.lat === null || f.lon === null) return []
  const inst = INSTITUTIONS.find((i) => i.en === f.en)
  if (!inst) {
    console.warn(`[map] facility-locations: "${f.en}" is not in population.json`)
    return []
  }
  const [x, y] = project(f.lat, f.lon)
  if (!inWindow(x, y)) {
    console.warn(`[map] facility-locations: "${f.en}" lies outside the map window`)
    return []
  }
  return [{ en: f.en, wilayat: f.wilayat, lat: f.lat, lon: f.lon, source: f.source, x, y }]
})

export const pinnedNames = new Set(PINNED.map((p) => p.en))

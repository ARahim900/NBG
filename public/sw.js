/*
 * NBG-OM — Service Worker
 * Purpose: offline support via static-asset caching ONLY. It renders no UI and
 * changes no behavior while online — desktop users never see a difference.
 *
 * Deploy-safe by design (this is what keeps "zero behavioral shift" true):
 *   • HTML / navigations  → network-first  → a fresh Vercel deploy ALWAYS wins
 *                                             when online; cache is the offline
 *                                             fallback only (no stale UI).
 *   • Hashed build assets → cache-first     → Vite fingerprints filenames, so a
 *     (/assets/*.js|css)                       cached file is immutable & safe.
 *   • Non-GET / cross-origin (fonts, CDNs) → passed through untouched.
 */

// Bump this version string on any SW logic change to retire old caches on deploy.
const CACHE = 'nbg-static-v1'

// Minimal app shell pre-cached so the app can cold-start while fully offline.
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/logo.png', '/favicon.png']

// ── Install: pre-cache the shell, then activate immediately ──────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll is atomic; if one asset 404s the install fails loudly (good signal).
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

// ── Activate: delete caches from older versions, then take control ───────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

// ── Fetch: route by request type ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only same-origin GET requests are cacheable. Everything else passes through:
  // POST/PUT, Google Fonts, analytics, any cross-origin CDN — left 100% untouched.
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  // 1) Navigations (the HTML document) → NETWORK-FIRST.
  //    Guarantees the newest deploy is served when online; cached shell only offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match('/')),
        ),
    )
    return
  }

  // 2) All other same-origin GETs (JS, CSS, images, fonts) → CACHE-FIRST with a
  //    background refresh (stale-while-revalidate). Fast, and self-healing online.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fromNetwork = fetch(request)
        .then((response) => {
          // Cache only successful, same-origin ("basic") responses.
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached) // offline → serve whatever we already cached

      return cached || fromNetwork
    }),
  )
})

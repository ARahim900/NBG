import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The site's public address, when the build knows it: SITE_URL if set by
 * hand, else the production domain Vercel or Netlify provide at build time.
 */
const siteUrl = (): string | null => {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    process.env.URL ||
    ''
  return raw ? raw.replace(/\/+$/, '') : null
}

/** Adds og:url and og:image (which must be absolute) when the address is known. */
const socialPreview = (): Plugin => ({
  name: 'nbg-social-preview',
  transformIndexHtml(html) {
    const url = siteUrl()
    if (!url) return html
    const tags = [
      `<meta property="og:url" content="${url}/" />`,
      `<meta property="og:image" content="${url}/og-image.jpg" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      '<meta property="og:image:alt" content="Ministry of Health — Women &amp; Child Health Dashboards, North Al Batinah" />',
      `<meta name="twitter:image" content="${url}/og-image.jpg" />`,
    ]
    return html.replace(/\n\s*<\/head>/, `\n    ${tags.join('\n    ')}\n  </head>`)
  },
})

/**
 * Long-lived vendor chunks, matched by package path. (The object form of
 * `manualChunks` mis-assigned react-dom into the charts chunk, which forced
 * every page — even Home — to download Recharts.)
 */
const VENDOR_CHUNKS: [RegExp, string][] = [
  [/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, 'react'],
  [/[\\/]node_modules[\\/](recharts|recharts-scale|react-smooth|victory-vendor|d3-[^\\/]+|lodash|decimal\.js-light|eventemitter3)[\\/]/, 'charts'],
  [/[\\/]node_modules[\\/]lucide-react[\\/]/, 'icons'],
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), socialPreview()],
  base: './',
  build: {
    // Recharts is the largest chunk (~415 kB, ~110 kB gzip) and loads only
    // with the dashboards that draw charts.
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return VENDOR_CHUNKS.find(([re]) => re.test(id))?.[1]
        },
      },
    },
  },
})

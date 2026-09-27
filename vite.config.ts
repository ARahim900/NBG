import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Long-lived vendor chunks, matched by package path. (The object form of
 * `manualChunks` mis-assigned react-dom into the charts chunk, which forced
 * every page — even Home — to download Recharts.)
 */
const VENDOR_CHUNKS: [RegExp, string][] = [
  [/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, 'react'],
  [/[\\/]node_modules[\\/](recharts|recharts-scale|react-smooth|victory-vendor|d3-[^\\/]+|lodash|decimal\.js-light|eventemitter3)[\\/]/, 'charts'],
  [/[\\/]node_modules[\\/]gsap[\\/]/, 'motion'],
  [/[\\/]node_modules[\\/]lucide-react[\\/]/, 'icons'],
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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

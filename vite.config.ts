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
  [/[\\/]node_modules[\\/](leaflet)[\\/]/, 'map'],
  [/[\\/]node_modules[\\/]three[\\/]/, 'three'],
  [/[\\/]node_modules[\\/]gsap[\\/]/, 'motion'],
  [/[\\/]node_modules[\\/]lucide-react[\\/]/, 'icons'],
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // three.js is ~500 kB on its own and only loads lazily after first paint.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return VENDOR_CHUNKS.find(([re]) => re.test(id))?.[1]
        },
      },
    },
  },
})

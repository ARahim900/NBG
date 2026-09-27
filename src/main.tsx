import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './lib/theme-mode'
// Self-hosted fonts (no Google Fonts request): DM Sans — the Muscat Bay
// typeface — for Latin text, Cairo for Arabic. Only the scripts a page uses
// are downloaded, and both work offline in the installed app.
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/cairo'
// Georgia fallback for the MOH template's serif titles (loads only if needed).
import '@fontsource-variable/gelasio'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

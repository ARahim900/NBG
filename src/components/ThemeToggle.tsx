import { Moon, Sun } from 'lucide-react'
import { useThemeMode } from '../lib/theme-mode'

/**
 * Elegant sliding sun/moon switch. The track shows the inactive icon dimmed;
 * the gradient knob carries the active icon and slides between the two ends.
 */
export default function ThemeToggle(): JSX.Element {
  const { isDark, toggle } = useThemeMode()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="group relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-line/15 bg-mist/70 p-1 transition-colors duration-300 hover:border-line/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      {/* Track icons (the one under the knob is hidden by it) */}
      <Sun
        aria-hidden="true"
        className={`pointer-events-none absolute left-2 h-4 w-4 transition-colors duration-300 ${
          isDark ? 'text-ink/30' : 'text-warn'
        }`}
      />
      <Moon
        aria-hidden="true"
        className={`pointer-events-none absolute right-2 h-4 w-4 transition-colors duration-300 ${
          isDark ? 'text-teal' : 'text-ink/25'
        }`}
      />

      {/* Sliding knob with the active icon */}
      <span
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br shadow-md ring-1 transition-transform duration-300 ease-out ${
          isDark
            ? 'translate-x-[2rem] from-navy-600 to-navy-900 ring-white/10'
            : 'translate-x-0 from-white to-mist ring-line/10'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-teal" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-warn" />
        )}
      </span>
    </button>
  )
}

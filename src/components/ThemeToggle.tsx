import { Moon, Sun } from 'lucide-react'
import { useThemeMode } from '../lib/theme-mode'

export default function ThemeToggle(): JSX.Element {
  const { isDark, toggle } = useThemeMode()
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line/20 bg-surface text-[#4E4456] transition-colors duration-150 hover:bg-[#A4C5BB]/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#A4C5BB] focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:text-[#A4C5BB] motion-reduce:transition-none"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}

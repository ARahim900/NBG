import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

/** Light/dark theme state, persisted to localStorage and mirrored onto <html>. */
export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  isDark: boolean
  setTheme: (mode: ThemeMode) => void
  toggle: () => void
}

const STORAGE_KEY = 'nbg-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Resolve the initial theme from storage, falling back to the OS preference. */
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#090e17' : '#ffffff')
  }, [theme])

  const value: ThemeContextValue = {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggle: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Access the active theme. Must be used within <ThemeProvider>. */
export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider')
  }
  return ctx
}

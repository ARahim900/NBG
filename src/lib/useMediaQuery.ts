import { useEffect, useState } from 'react'

/** Live boolean for a CSS media query, e.g. `useMediaQuery('(max-width: 640px)')`. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/** Phone-width screens (below Tailwind's `sm` breakpoint). */
export const useNarrow = (): boolean => useMediaQuery('(max-width: 640px)')

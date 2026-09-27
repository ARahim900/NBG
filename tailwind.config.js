/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Ministry of Health Oman — brand fills (fixed in both themes) ──
        navy: {
          DEFAULT: '#144066',
          50: '#eef3f8',
          100: '#d6e2ee',
          600: '#1a5183',
          700: '#143f5e',
          800: '#0f3049',
          900: '#0b2235',
        },
        azure: {
          DEFAULT: '#2884c6',
          600: '#1f6fab',
          700: '#0f6faf',
        },
        teal: {
          DEFAULT: '#7cb6bc',
          600: '#4f969e',
          700: '#3a7a82',
        },
        good: '#2e8b6f',
        warn: '#c08a1e',
        alert: '#bf4d4a',
        /** Luminous accent used by the new experience layer (glows, beams). */
        glow: '#5eead4',

        // ── Theme-aware semantic tokens (flip via CSS variables) ──
        // Channel triples live in index.css → :root / .dark
        canvas: 'rgb(var(--canvas) / <alpha-value>)', // page background
        surface: 'rgb(var(--surface) / <alpha-value>)', // card / header / footer
        mist: 'rgb(var(--mist) / <alpha-value>)', // subtle panels & inset wells
        ink: 'rgb(var(--ink) / <alpha-value>)', // body text
        heading: 'rgb(var(--heading) / <alpha-value>)', // headings & strong labels
        line: 'rgb(var(--line) / <alpha-value>)', // borders & dividers
        tint: 'rgb(var(--tint) / <alpha-value>)', // soft accent washes
      },
      // ── Typography: Muscat Bay design system v2 (DM Sans, seven steps) ──
      fontFamily: {
        sans: ['"DM Sans Variable"', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Alias kept so existing `font-display` headings stay valid.
        display: ['"DM Sans Variable"', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        ar: ['"Cairo Variable"', 'Cairo', 'Tajawal', '"Segoe UI"', 'sans-serif'],
      },
      // Weights 400 / 500 / 600 / 700 only — 800 does not exist in the system.
      fontWeight: {
        extrabold: '700',
        black: '700',
      },
      fontSize: {
        display: ['28px', { lineHeight: '34px', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['16px', { lineHeight: '22px', letterSpacing: '-0.01em', fontWeight: '600' }],
        body: ['14px', { lineHeight: '21px' }],
        label: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '16px' }],
        eyebrow: ['11px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '600' }],
        kpi: ['24px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      boxShadow: {
        // Muscat Bay two-layer shadows, tinted with this app's own shadow hue.
        card: '0 1px 2px rgb(var(--shadow) / 0.04), 0 2px 6px rgb(var(--shadow) / 0.06)',
        'card-hover': '0 2px 4px rgb(var(--shadow) / 0.06), 0 4px 12px rgb(var(--shadow) / 0.08)',
        'glow-teal': '0 0 24px -4px rgba(94, 234, 212, 0.45)',
        'glow-azure': '0 0 28px -6px rgba(40, 132, 198, 0.55)',
      },
      borderRadius: {
        card: '10.5px',
        control: '6px',
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -3%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 2%) scale(0.96)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        aurora: 'aurora 18s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3.2s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        'spin-slow': 'spin-slow 28s linear infinite',
        // Muscat Bay motion: cubic-bezier(.4,0,.2,1), no bounce.
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}

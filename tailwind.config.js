/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Ministry of Health Oman — brand colours from the MOH branded
        //    template (DS Conf – MOH Branded). Flat fills only. ──
        navy: {
          DEFAULT: '#144066',
          50: '#eef3f8',
          100: '#d6e2ee',
          600: '#1a5183',
          700: '#143f5e',
          800: '#0f3049',
          900: '#0b2235',
        },
        /** MOH blue — the template's accent (rail, tabs, cover panel). */
        azure: {
          DEFAULT: '#0089dd',
          600: '#0077c2',
          700: '#0a6aa8',
        },
        teal: {
          DEFAULT: '#4fa8b2',
          600: '#3e929c',
          700: '#2d7f88',
        },
        /** Template light blue: card borders and highlight boxes. */
        sky: {
          DEFAULT: '#d7eaf9',
          50: '#eff6fc',
        },
        good: '#2e8b6f',
        warn: '#c08a1e',
        /** MOH red (emblem colour). */
        alert: '#d91c45',
        /** Accent on navy surfaces — the template's cover-slide light teal. */
        glow: '#88cad2',

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
        // MOH template titles are set in Georgia; Gelasio is its metric-compatible
        // open-source twin, downloaded only where Georgia is not installed.
        serif: ['Georgia', '"Gelasio Variable"', 'Gelasio', '"Times New Roman"', 'serif'],
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
        // Muscat Bay motion: cubic-bezier(.4,0,.2,1), no bounce.
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}

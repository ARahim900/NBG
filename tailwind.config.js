/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ministry of Health Oman — eHealth portal palette (moh.gov.om)
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
        mist: '#eaf1f6',
        ink: '#1a2733',
        good: '#2e8b6f',
        warn: '#c08a1e',
        alert: '#bf4d4a',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        ar: ['Cairo', 'Tajawal', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 48, 73, 0.04), 0 6px 20px -8px rgba(16, 48, 73, 0.14)',
        'card-hover':
          '0 2px 4px rgba(16, 48, 73, 0.06), 0 14px 32px -10px rgba(16, 48, 73, 0.22)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss'

/**
 * "Instrument" — a light, precise spec-sheet register.
 *
 * The rule that holds this together: colour is never decoration. Paper, ink,
 * rule and muted carry the whole page; `live` and `dim` are permitted only to
 * report state. If a colour is doing nothing but reporting something true, it
 * does not belong.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cool off-white, deliberately not a warm cream.
        paper: '#F7F8F8',
        // Slightly raised ground for spec grids.
        shelf: '#F1F3F3',
        ink: '#16191C',
        rule: '#DCE0E2',
        muted: '#6B7278',
        // Semantic only.
        live: '#0E7C5A',
        dim: '#9AA1A6',
      },
      fontFamily: {
        // Monospace is the display face: this subject's output is
        // machine-readable text, so the page speaks in its voice.
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.09em' }],
        meta: ['0.8125rem', { lineHeight: '1.5' }],
      },
      maxWidth: {
        measure: '68ch',
      },
    },
  },
  plugins: [],
}
export default config

import type { Config } from 'tailwindcss'

/**
 * The design system is defined in `app/globals.css` as CSS custom properties.
 * This file only maps them onto Tailwind's scales.
 *
 * Colours are `rgb(var(--x) / <alpha-value>)` rather than `var(--x)` so alpha
 * modifiers keep working — `text-foreground/80` and `bg-overlay/55` are both
 * load-bearing, and a plain hex custom property drops the suffix silently.
 */

/** Every colour token is declared the same way; this keeps that honest. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // next-themes writes data-theme on <html>. Tokens handle almost everything,
  // but `dark:` stays available for the cases they can't reach (image
  // treatment, blend modes).
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // The supplied identity, unmodified. Available for the rare case that
        // genuinely wants the brand value rather than its semantic role.
        brand: {
          onyx: token('brand-onyx'),
          gold: token('brand-gold'),
          maroon: token('brand-maroon'),
          ivory: token('brand-ivory'),
        },

        background: {
          DEFAULT: token('background'),
          subtle: token('background-subtle'),
        },
        surface: {
          DEFAULT: token('surface'),
          elevated: token('surface-elevated'),
        },
        foreground: {
          DEFAULT: token('foreground'),
          muted: token('foreground-muted'),
          subtle: token('foreground-subtle'),
          inverse: token('foreground-inverse'),
        },
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          active: token('primary-active'),
          foreground: token('primary-foreground'),
          surface: token('primary-surface'),
          'surface-hover': token('primary-surface-hover'),
        },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          foreground: token('accent-foreground'),
          surface: token('accent-surface'),
          'surface-foreground': token('accent-surface-foreground'),
        },
        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        ring: token('focus-ring'),
        overlay: token('overlay'),

        success: token('success'),
        warning: token('warning'),
        error: token('error'),
        info: token('info'),
      },

      fontFamily: {
        // Sans is the display face. Monospace headlines were the single
        // largest contributor to the page reading as a document rather than a
        // site, so mono is demoted to metadata, spec values and code.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Fluid where it matters, so a headline sized for 1440 does not
        // dominate a 375 viewport. Floors are chosen to fit 320px.
        display: [
          'clamp(2.5rem, 1.75rem + 3.6vw, 4.5rem)',
          { lineHeight: '1.04', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        h1: [
          'clamp(2rem, 1.5rem + 2.4vw, 3.25rem)',
          { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '600' },
        ],
        h2: [
          'clamp(1.5rem, 1.28rem + 1.1vw, 2.125rem)',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        h3: [
          'clamp(1.125rem, 1.06rem + 0.35vw, 1.375rem)',
          { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'body-lg': ['1.0625rem', { lineHeight: '1.7' }],
        body: ['0.9375rem', { lineHeight: '1.7' }],
        small: ['0.875rem', { lineHeight: '1.6' }],
        // Unchanged from Instrument — these two are used throughout and their
        // measurements are already right.
        meta: ['0.8125rem', { lineHeight: '1.5' }],
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.09em' }],
        code: ['0.8125rem', { lineHeight: '1.6' }],
      },

      maxWidth: {
        /** Prose measure. Long descriptions must not run the full grid. */
        measure: '68ch',
        content: '72rem',
        wide: '84rem',
      },

      borderRadius: {
        // Restrained on purpose: heavy rounding is what makes a portfolio read
        // as a template. Nothing above 8px except the pill.
        sm: '0.125rem',
        DEFAULT: '0.1875rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
      },

      boxShadow: {
        // Warm-tinted in light, neutral black in dark, via --shadow-color.
        subtle: '0 1px 2px 0 rgb(var(--shadow-color) / 0.05)',
        raised:
          '0 1px 2px 0 rgb(var(--shadow-color) / 0.04), 0 2px 8px -2px rgb(var(--shadow-color) / 0.08)',
        lifted:
          '0 2px 4px -1px rgb(var(--shadow-color) / 0.05), 0 8px 24px -4px rgb(var(--shadow-color) / 0.12)',
      },

      transitionTimingFunction: {
        // Mirrors `ease.standard` in lib/motion.ts. The two must agree so a CSS
        // hover and a Motion entrance on the same element feel like one system.
        standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
        entrance: 'cubic-bezier(0.16, 1, 0.30, 1)',
        exit: 'cubic-bezier(0.40, 0, 1, 1)',
      },

      zIndex: {
        base: '0',
        raised: '10',
        sticky: '20',
        header: '30',
        overlay: '40',
        modal: '50',
        toast: '60',
      },
    },
  },
  plugins: [],
}
export default config

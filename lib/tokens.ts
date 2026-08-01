/**
 * Brand constants for the few places that need a literal hex string and cannot
 * read a CSS custom property.
 *
 * `app/globals.css` is the source of truth for the theme. Everything that can
 * reach CSS — components, Tailwind utilities, even inline `style` objects —
 * must use the semantic tokens (`rgb(var(--surface))`) so it themes for free.
 * The only genuine exception is `<meta name="theme-color">`, which the browser
 * reads before any stylesheet applies.
 */

/** The supplied identity, preserved verbatim. */
export const brand = {
  onyx: '#0C0C0E',
  gold: '#C2A35C',
  maroon: '#7E1530',
  ivory: '#ECE4D2',
} as const

/**
 * Browser chrome colour per scheme. Must match `--background` in globals.css.
 * Rendered as two <meta> tags with `media`, so the address bar follows the
 * system scheme even before hydration.
 */
export const themeColor = {
  light: brand.ivory,
  dark: brand.onyx,
} as const

/**
 * Accessible substitutions applied to the brand palette.
 *
 * Gold and maroon are each unusable as *text* against one of the two grounds.
 * Both survive untouched as fills; these are the derived text-role variants.
 * Contrast measured against the theme's own `--background`.
 *
 * Kept here as documentation — the values live in globals.css.
 */
export const paletteNotes = {
  goldOnIvory: {
    base: brand.gold,
    measured: 1.91,
    derived: '#6B5620',
    derivedMeasured: 5.57,
    reason:
      'Gold is unreadable on ivory. Hue (41.8°) and saturation (45.5%) held; ' +
      'lightness walked 55% → 30%.',
  },
  maroonOnOnyx: {
    base: brand.maroon,
    measured: 1.9,
    derived: '#D3798A',
    derivedMeasured: 6.39,
    reason:
      'Maroon is unreadable on onyx. Onyx luminance forces any 4.5:1 member of ' +
      'this hue to be a light rose; saturation dropped to 51% so it reads ' +
      'rosewood rather than pink. As a dark-theme fill it becomes #B71F46, the ' +
      'only point satisfying both ≥3:1 vs onyx and ≥4.5:1 for ivory text on it.',
  },
} as const

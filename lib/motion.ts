/**
 * Motion tokens.
 *
 * Every animated value on the site resolves to something here, so timing stays
 * one decision rather than fifty.
 *
 * These began as the values the site already shipped with — an 8px rise over
 * 0.32s with a 0.06s stagger — preserved so a redesign would not silently change
 * how motion felt. That turned out to be preserving a mistake: at 8px the
 * reveals were below the threshold of noticing, and the site was fairly
 * described as having no animation. The travel and timing were raised
 * deliberately; the curves are unchanged.
 *
 * `transitionTimingFunction` in tailwind.config.ts mirrors these curves. The
 * two must agree — a CSS hover and a Motion entrance on the same element
 * should read as one system.
 */

export const duration = {
  /** State flips with no travel: checkbox, toggle. */
  instant: 0.12,
  /** Hover, focus ring, small affordances. */
  fast: 0.2,
  /** The default for anything entering. */
  base: 0.32,
  /**
   * Scroll reveals specifically.
   *
   * Separate from `base` on purpose. `base` also drives hovers and toggles,
   * where 0.55s would feel like lag — the two wants are genuinely different and
   * one number cannot serve both.
   */
  reveal: 0.55,
  /** Section reveals, modals. */
  slow: 0.5,
  /** Hero and other once-per-page moments. */
  slower: 0.8,
} as const

export const ease = {
  /** The house curve. Was already in use; kept exactly. */
  standard: [0.22, 1, 0.36, 1],
  /** Slightly longer settle, for entrances that travel further. */
  entrance: [0.16, 1, 0.3, 1],
  /** Accelerate away — exits should not linger. */
  exit: [0.4, 0, 1, 1],
  linear: [0, 0, 1, 1],
} as const

export const spring = {
  soft: { type: 'spring', stiffness: 180, damping: 26, mass: 1 },
  snappy: { type: 'spring', stiffness: 320, damping: 30, mass: 0.8 },
} as const

export const stagger = {
  tight: 0.06,
  base: 0.09,
  loose: 0.14,
  /**
   * Delay ceiling, in items. Without it a 30-item list leaves the last entry
   * waiting 1.8s, which reads as broken rather than choreographed.
   */
  maxIndex: 6,
} as const

/**
 * Travel distances in px.
 *
 * `rise` was 8px, paired with a 0.32s fade, and the honest verdict on it is that
 * nobody could see it — the site read as having no motion at all, most starkly
 * on a phone, where the decorative scroll rail is hidden and the reveal is the
 * only motion there is. 24px over 0.55s is still a settle rather than a
 * performance, but it is a settle you notice.
 *
 * `nudge` stays at 4: it is a hover affordance on an arrow, not an entrance.
 */
export const distance = {
  /** Arrow nudge on hover. Matches Tailwind's translate-x-0.5. */
  nudge: 4,
  rise: 24,
  lift: 40,
  sweep: 64,
} as const

export const viewport = {
  default: { once: true, margin: '-64px' },
  eager: { once: true, margin: '-10%' },
  late: { once: true, margin: '-25%' },
} as const

export const transition = {
  reveal: { duration: duration.reveal, ease: ease.entrance },
  hero: { duration: duration.slower, ease: ease.entrance },
  ui: { duration: duration.fast, ease: ease.standard },
  /** Media settling in: a slight scale alongside the fade. */
  media: { duration: duration.slower, ease: ease.entrance },
} as const

export type DistanceToken = keyof typeof distance
export type ViewportToken = keyof typeof viewport
export type StaggerToken = Extract<keyof typeof stagger, 'tight' | 'base' | 'loose'>

/** Caps the stagger delay for an index. See `stagger.maxIndex`. */
export function staggerDelay(index: number, gap: StaggerToken = 'base') {
  return Math.min(index, stagger.maxIndex) * stagger[gap]
}

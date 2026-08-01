/**
 * Motion tokens.
 *
 * Every animated value on the site resolves to something here, so timing stays
 * one decision rather than fifty. The numbers are not invented: the standard
 * curve, the 0.06s stagger, the 8px rise and the -64px viewport margin are the
 * values the site already shipped with, kept so the redesign does not silently
 * change how motion feels.
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
  tight: 0.04,
  base: 0.06,
  loose: 0.1,
  /**
   * Delay ceiling, in items. Without it a 30-item list leaves the last entry
   * waiting 1.8s, which reads as broken rather than choreographed.
   */
  maxIndex: 6,
} as const

/** Travel distances in px. Restraint is the point — nothing flies in. */
export const distance = {
  /** Arrow nudge on hover. Matches Tailwind's translate-x-0.5. */
  nudge: 4,
  rise: 8,
  lift: 16,
  sweep: 32,
} as const

export const viewport = {
  default: { once: true, margin: '-64px' },
  eager: { once: true, margin: '-10%' },
  late: { once: true, margin: '-25%' },
} as const

export const transition = {
  reveal: { duration: duration.base, ease: ease.standard },
  hero: { duration: duration.slower, ease: ease.entrance },
  ui: { duration: duration.fast, ease: ease.standard },
} as const

export type DistanceToken = keyof typeof distance
export type ViewportToken = keyof typeof viewport
export type StaggerToken = Extract<keyof typeof stagger, 'tight' | 'base' | 'loose'>

/** Caps the stagger delay for an index. See `stagger.maxIndex`. */
export function staggerDelay(index: number, gap: StaggerToken = 'base') {
  return Math.min(index, stagger.maxIndex) * stagger[gap]
}

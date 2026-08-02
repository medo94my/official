/**
 * Shared admin class strings.
 *
 * The dashboard uses the same semantic tokens as the public page — same
 * ground, ink, hairlines and mono labels — so editing the site does not feel
 * like leaving it, and the admin themes for free. Centralised because eight
 * CRUD pages repeating long class strings is how they drift out of sync.
 */

/** Text input, textarea and select. 16px keeps iOS from zooming on focus. */
export const FIELD =
  'w-full border border-border bg-surface px-3 py-2.5 text-base text-foreground placeholder:text-foreground-subtle focus:border-foreground focus:outline-none'

/** Same field, for values that are really data rather than prose. */
export const FIELD_MONO = `${FIELD} font-mono text-sm`

/** Field label. */
export const LABEL = 'label mb-2 block'

/** Primary action. Filled on hover rather than by default — one loud thing per screen. */
export const BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-foreground px-5 font-mono text-meta text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50'

/** Secondary action. */
export const BTN_GHOST =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-border px-4 font-mono text-meta text-foreground transition-colors hover:border-foreground disabled:opacity-50'

/** Destructive action. Outlined until hover so it is hard to hit by accident. */
export const BTN_DANGER =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-error px-4 font-mono text-meta text-error transition-colors hover:bg-error hover:text-background'

/**
 * Checkbox. `accent-primary` colours the native control, which keeps the
 * platform's own focus and keyboard behaviour rather than reimplementing it.
 */
export const CHECKBOX =
  'h-4 w-4 rounded-sm border-border accent-primary'

/** Content panel. */
export const PANEL = 'border border-border bg-surface p-5'

/** Page title. */
export const PAGE_TITLE = 'font-mono text-xl font-semibold tracking-tight'

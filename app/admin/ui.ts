/**
 * Shared admin class strings.
 *
 * The dashboard uses the same tokens as the public page — same paper, ink,
 * hairlines and mono labels — so editing the site does not feel like leaving
 * it. Centralised because eight CRUD pages repeating long class strings is how
 * they drift out of sync.
 */

/** Text input, textarea and select. 16px keeps iOS from zooming on focus. */
export const FIELD =
  'w-full border border-rule bg-panel px-3 py-2.5 text-base text-ink placeholder:text-dim focus:border-ink focus:outline-none'

/** Same field, for values that are really data rather than prose. */
export const FIELD_MONO = `${FIELD} font-mono text-sm`

/** Field label. */
export const LABEL = 'label mb-2 block'

/** Primary action. Filled on hover rather than by default — one loud thing per screen. */
export const BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-ink px-5 font-mono text-meta text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50'

/** Secondary action. */
export const BTN_GHOST =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-rule px-4 font-mono text-meta text-ink transition-colors hover:border-ink disabled:opacity-50'

/** Destructive action. Outlined until hover so it is hard to hit by accident. */
export const BTN_DANGER =
  'inline-flex min-h-11 items-center justify-center gap-2 border border-danger px-4 font-mono text-meta text-danger transition-colors hover:bg-danger hover:text-paper'

/** Content panel. */
export const PANEL = 'border border-rule bg-panel p-5'

/** Page title. */
export const PAGE_TITLE = 'font-mono text-xl font-semibold tracking-tight'

'use client'

import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

/**
 * Reactive reduced-motion preference.
 *
 * Re-exported from Motion rather than reimplemented so there is one source of
 * truth: `<MotionConfig reducedMotion="user">` in app/providers.tsx reads the
 * same signal, and a second hand-rolled matchMedia listener could disagree
 * with it mid-session when the user changes the OS setting.
 *
 * Most components need nothing — MotionConfig handles them. Reach for this
 * only when reduced motion should change *what renders*, not just how it
 * animates (e.g. swapping a scroll-driven scene for a static layout).
 */
export function useReducedMotion() {
  return useMotionReducedMotion() ?? false
}

/**
 * Non-hook read, for imperative call sites — GSAP setup, event handlers.
 *
 * Returns `false` during SSR, which is the safe default: it means "animate",
 * and the GSAP timelines that consult this are gated a second time by
 * `gsap.matchMedia()`, which only ever runs in the browser.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

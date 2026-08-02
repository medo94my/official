'use client'

import { useEffect, useLayoutEffect, type RefObject } from 'react'

/** useLayoutEffect warns during SSR; the effect only matters in the browser. */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

type GsapModule = typeof import('gsap')['gsap']
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger')['ScrollTrigger']

type SetupFn = (gsap: GsapModule, ScrollTrigger: ScrollTriggerModule) => void

type Options = {
  /**
   * Media query gating the whole timeline. The default restricts scroll
   * choreography to desktop widths and to users who have not asked for less
   * motion — under either condition the triggers are never *created*, so
   * there is nothing to tear down and nothing to misbehave.
   */
  media?: string
}

const DEFAULT_MEDIA =
  '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/**
 * Runs a GSAP timeline scoped to a ref, and cleans it up properly.
 *
 * Two things this exists to guarantee:
 *
 * 1. **GSAP stays out of the initial bundle.** Both gsap and ScrollTrigger are
 *    `await import()`ed here rather than imported at module scope, so they are
 *    not even in the static graph of the chunk that renders the component.
 *    Pair this with the `*.client.tsx` + `next/dynamic({ssr:false})` split at
 *    the call site — `dynamic` with `ssr:false` cannot be called from a server
 *    component, and "fixing" that by making the section a client component
 *    would pull the whole thing back onto the critical path.
 *
 * 2. **Nothing leaks across navigations.** The App Router unmounts without a
 *    page reload, so a ScrollTrigger that outlives its component keeps firing
 *    against detached nodes. `gsap.context().revert()` in the cleanup undoes
 *    every tween and trigger created inside the scope.
 */
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: SetupFn,
  deps: unknown[] = [],
  options: Options = {}
) {
  const media = options.media ?? DEFAULT_MEDIA

  useIsomorphicLayoutEffect(() => {
    let ctx: gsap.Context | undefined
    // The dynamic import is async, so the component can unmount before it
    // resolves. Without this the context would be created after teardown and
    // never reverted.
    let cancelled = false

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      if (cancelled || !scope.current) return

      // Idempotent — GSAP ignores a plugin it already knows.
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.matchMedia().add(media, () => setup(gsap, ScrollTrigger))
      }, scope.current)
    })()

    return () => {
      cancelled = true
      ctx?.revert()
    }
    // `setup` is intentionally excluded: call sites pass an inline closure, so
    // including it would re-run the timeline on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

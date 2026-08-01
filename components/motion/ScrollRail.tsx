'use client'

import { useRef } from 'react'
import { useGsapContext } from './useGsapContext'

/**
 * A scroll-position gauge for the long single page.
 *
 * The homepage is ten stacked sections with no pagination, and a scrollbar on
 * a modern desktop is a two-pixel overlay that appears while you move and then
 * hides. This restores the one thing that was lost with it: how much is left.
 * The ticks are positioned by section, so the fill passing a tick means "that
 * section is behind you" rather than an abstract percentage.
 *
 * Decoration, and treated as such — `aria-hidden`, `pointer-events-none`, and
 * absent entirely below `lg` and under `prefers-reduced-motion` (the gate lives
 * in `useGsapContext`, so the triggers are never created rather than created
 * and reverted). Nothing here is the only route to any information: the nav
 * above it already names every section and links to it.
 *
 * This is one of exactly two places GSAP is used. It earns it: a scrubbed
 * timeline tied to document progress is what ScrollTrigger exists for, and
 * Motion's `useScroll` would need a spring per tick to do the same job.
 */
export default function ScrollRail({ sectionIds }: { sectionIds: string[] }) {
  const scope = useRef<HTMLDivElement>(null)

  useGsapContext(
    scope,
    (gsap, ScrollTrigger) => {
      const root = scope.current
      if (!root) return

      const fill = root.querySelector('[data-rail-fill]')
      if (fill) {
        gsap.set(fill, { transformOrigin: 'top center', scaleY: 0 })
        gsap.to(fill, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            // A small scrub rather than `true`: tying the fill rigidly to the
            // wheel makes it feel like a readout of the input device. A tenth
            // of a second of lag makes it feel like a readout of the page.
            scrub: 0.1,
          },
        })
      }

      sectionIds.forEach((id) => {
        const section = document.getElementById(id)
        const tick = root.querySelector(`[data-rail-tick="${id}"]`)
        if (!section || !tick) return

        gsap.set(tick, { transformOrigin: 'left center', scaleX: 0.45, opacity: 0.4 })

        ScrollTrigger.create({
          trigger: section,
          // Mid-viewport on both edges, so a section counts as "current" while
          // it occupies the middle of the screen rather than the moment its top
          // border scrapes into view.
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: ({ isActive }) => {
            gsap.to(tick, {
              scaleX: isActive ? 1 : 0.45,
              opacity: isActive ? 1 : 0.4,
              duration: 0.2,
              ease: 'power2.out',
            })
          },
        })
      })
    },
    [sectionIds.join(',')]
  )

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none fixed left-5 top-1/2 z-sticky hidden -translate-y-1/2 lg:block xl:left-8"
    >
      <div className="relative h-40 w-px bg-border">
        <span
          data-rail-fill
          className="absolute inset-x-0 top-0 block h-full bg-accent"
        />
      </div>

      <div className="absolute inset-y-0 left-0">
        {sectionIds.map((id, i) => (
          <span
            key={id}
            data-rail-tick={id}
            className="absolute block h-px w-2.5 bg-foreground-subtle"
            style={{
              // Evenly spaced rather than proportional to section height: the
              // rail reads as "section 4 of 9", which is the useful fact. A
              // proportional map would make a long section look like progress
              // has stalled.
              top: `${sectionIds.length > 1 ? (i / (sectionIds.length - 1)) * 100 : 0}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

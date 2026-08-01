'use client'

import dynamic from 'next/dynamic'

/**
 * The client-only boundary for `ScrollRail`.
 *
 * This file exists solely so `dynamic(..., { ssr: false })` has a client
 * component to live in — calling it from a server component (which every page
 * and section here is) is a build error, and the usual fix of marking the
 * caller `'use client'` would drag the whole page onto the client to get a
 * decorative rail.
 *
 * Two layers keep GSAP off the critical path: `ssr: false` means the rail is
 * its own async chunk that no server render waits on, and `useGsapContext`
 * `await import()`s gsap and ScrollTrigger inside the effect so they are not
 * in that chunk's static graph either. Verify with
 * `grep -rl gsap .next/static/chunks` — every hit must be an async chunk, never
 * one referenced by the initial page load.
 */
const ScrollRail = dynamic(() => import('./ScrollRail'), { ssr: false })

export default ScrollRail

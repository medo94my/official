'use client'

import dynamic from 'next/dynamic'

/**
 * Client-only boundary for `Bubbles`.
 *
 * Same reason as ScrollRail.client.tsx: every page here is a server component,
 * and `dynamic(..., { ssr: false })` needs a client component to live in.
 * Marking the page itself `'use client'` would drag the whole homepage onto the
 * client to get some decoration.
 */
const Bubbles = dynamic(() => import('./Bubbles'), { ssr: false })

export default Bubbles

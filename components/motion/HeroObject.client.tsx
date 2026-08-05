'use client'

import dynamic from 'next/dynamic'

/** Client-only boundary for `HeroObject`. See Bubbles.client.tsx. */
const HeroObject = dynamic(() => import('./HeroObject'), { ssr: false })

export default HeroObject

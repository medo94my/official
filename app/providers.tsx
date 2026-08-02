'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'motion/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        // Suppresses the token cross-fade for the duration of the switch.
        // Without it every colour on the page animates independently and the
        // change reads as a smear rather than a flip.
        disableTransitionOnChange
        storageKey="portfolio-theme"
      >
        {/*
          The one line that actually makes reduced-motion work. Motion drives
          transforms by writing inline styles per frame, so the CSS media query
          in globals.css cannot touch it; this makes every motion.* element in
          the tree — present and future — drop transform and layout animation
          and fade only.
        */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ThemeProvider>
    </SessionProvider>
  )
}

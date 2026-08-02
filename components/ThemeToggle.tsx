'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { duration, ease } from '@/lib/motion'

type ThemeToggleProps = {
  className?: string
}

const BASE =
  'inline-flex h-11 w-11 items-center justify-center rounded-md border border-border ' +
  'text-foreground-muted transition-colors duration-200 ease-standard ' +
  'hover:border-border-strong hover:text-foreground'

/**
 * Light / dark switch.
 *
 * The site's theming is entirely CSS custom properties, which is what lets
 * every server-rendered page stay server-rendered. This is the one sanctioned
 * place where JS reads the theme, so it is also the one place that can
 * hydration-mismatch — hence the fixed-size placeholder until `mounted`. The
 * placeholder occupies exactly the same box, so nothing shifts when it swaps.
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={`${BASE} ${className ?? ''}`}
        // Reserves the box before the theme is known. Not a button: an
        // unlabelled control in the tab order would be worse than none.
      />
    )
  }

  const isDark = resolvedTheme === 'dark'
  const next = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`${BASE} ${className ?? ''}`}
      // The label states the outcome, not the current state — that is what a
      // screen reader user needs in order to decide whether to press it.
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {/*
        The one piece of motion on this control, and it is confirmation rather
        than decoration: `disableTransitionOnChange` on the ThemeProvider
        deliberately suppresses the CSS token cross-fade during a switch, so
        without this the icon would hard-cut and the click would feel like it
        did nothing. A quarter turn and a fade is enough to read as "that
        registered". `MotionConfig reducedMotion="user"` drops the rotation and
        leaves the fade for anyone who has asked for less.

        `mode="wait"` so the two icons never overlap in a box this small, and
        `initial={false}` so the icon does not spin in on first paint — there is
        no change to confirm until the button is actually pressed.
      */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: duration.fast, ease: ease.standard }}
          className="inline-flex"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.125rem] w-[1.125rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.125rem] w-[1.125rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
    </svg>
  )
}

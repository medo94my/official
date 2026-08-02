'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ThemeToggle from '@/components/ThemeToggle'
import { ButtonLink } from '@/components/ui/Button'
import { duration, ease, stagger } from '@/lib/motion'

export type NavItem = { href: string; label: string }

type SiteNavProps = {
  name: string
  items: NavItem[]
  /** Rendered as the filled action. Omitted when there is nowhere to send them. */
  cta?: { href: string; label: string }
  resume?: string | null
}

/**
 * Navigation: desktop bar and mobile panel.
 *
 * One client island rather than three. It owns the only three pieces of state
 * on the page — whether the header has left the top, which section is in view,
 * and whether the mobile panel is open — and everything else stays server
 * rendered.
 *
 * Active-section tracking uses IntersectionObserver rather than a scroll
 * handler: the browser does the work off the main thread, and there is no
 * listener to throttle.
 */
export default function SiteNav({ name, items, cta, resume }: SiteNavProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Header gains a ground and a rule once it is no longer over the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = items.map((i) => i.href.replace('#', ''))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost intersecting section wins, so scrolling up reports the
        // section you are entering rather than the one you are leaving.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      // Band across the upper-middle of the viewport: a section counts as
      // current once its heading has cleared the header.
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  // Escape closes, focus returns to the trigger, and the body cannot scroll
  // behind the panel.
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Move focus into the panel so the next Tab lands on a nav link.
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <header
        className={`sticky top-0 z-header transition-colors duration-200 ease-standard ${
          scrolled
            ? 'border-b border-border bg-background/95 backdrop-blur-[2px]'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {/* The gold tick is the mark. Gold as a fill measures 8:1 on onyx
                and the derived bronze holds 5.6:1 on ivory, so it reads in
                both themes without becoming gold text, which fails on ivory. */}
            <span
              aria-hidden="true"
              className="mr-2 inline-block h-2 w-2 bg-accent align-middle"
            />
            {name}
          </Link>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const isActive = active === item.href
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative inline-flex min-h-11 items-center px-3 font-mono text-meta transition-colors duration-200 ease-standard ${
                        isActive
                          ? 'text-foreground'
                          : 'text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.span
                          // layoutId slides the marker between links instead of
                          // cross-fading two separate elements.
                          layoutId="nav-active"
                          className="absolute inset-x-3 bottom-2 h-px bg-accent"
                          transition={{ duration: duration.fast, ease: ease.standard }}
                        />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {resume && (
              <ButtonLink
                href={resume}
                variant="quiet"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Résumé
              </ButtonLink>
            )}
            <ThemeToggle />
            {cta && (
              <ButtonLink href={cta.href} className="hidden sm:inline-flex">
                {cta.label}
              </ButtonLink>
            )}

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-overlay lg:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-overlay/60"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: duration.fast }}
            />

            <motion.div
              ref={panelRef}
              id="mobile-nav"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-border bg-surface outline-none"
              variants={{
                hidden: { x: '100%' },
                visible: { x: 0 },
              }}
              transition={{ duration: duration.base, ease: ease.standard }}
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <span className="label">Menu</span>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground-muted transition-colors hover:text-foreground"
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Sections" className="flex-1 overflow-y-auto px-5 py-4">
                <ul>
                  {items.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: duration.base,
                        ease: ease.standard,
                        delay: 0.06 + i * stagger.tight,
                      }}
                      className="border-b border-border last:border-b-0"
                    >
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-14 items-center text-body-lg text-foreground"
                      >
                        {item.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col gap-2 border-t border-border p-5">
                {resume && (
                  <ButtonLink href={resume} variant="secondary" className="w-full">
                    Download résumé
                  </ButtonLink>
                )}
                {cta && (
                  <ButtonLink
                    href={cta.href}
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    {cta.label}
                  </ButtonLink>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

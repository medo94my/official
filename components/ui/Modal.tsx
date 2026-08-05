'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'

/** Everything a keyboard can land on inside the panel. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type ModalProps = {
  open: boolean
  onClose: () => void
  /** Rendered as the heading and announced as the dialog's name. */
  title: string
  /** Optional line under the title, also announced. */
  description?: string
  children: ReactNode
  /** Panel width. Defaults to the two-column form width. */
  size?: 'md' | 'lg'
  /**
   * Where to send focus on close when the element that opened the dialog is
   * gone from the page.
   *
   * Needed because a trigger is sometimes unmounted deliberately while its
   * dialog is open — the projects page hides "Add New Project" so a half-typed
   * form cannot be clobbered from behind. The captured node is then detached,
   * `.focus()` on it does nothing at all, and the keyboard lands on `<body>`.
   * Point this at the ref the trigger remounts into and focus goes back where
   * the user left it.
   */
  returnFocusRef?: RefObject<HTMLElement>
}

/**
 * The one dialog in this codebase.
 *
 * Before this, the project form was a bare `fixed inset-0` div: no role, no
 * name, no Escape, and Tab walked straight out of it into the page behind. A
 * screen reader was never told a dialog had opened, and a keyboard user could
 * be editing a form they could no longer see.
 *
 * Four behaviours, none of which a plain div gives you:
 *
 * 1. **Named and announced** — `role="dialog"`, `aria-modal`, and
 *    `aria-labelledby` pointing at a real heading.
 * 2. **Focus is trapped.** Tab from the last control returns to the first, and
 *    Shift+Tab from the first goes to the last.
 * 3. **Focus is restored** to whatever opened the dialog. Without this, closing
 *    it drops the keyboard user back at the top of the document, which on the
 *    projects page means tabbing past the entire list again.
 * 4. **The background is inert and cannot scroll**, so the page behind does not
 *    move under the overlay and its controls are unreachable by any input.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
  returnFocusRef,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  /** Whatever had focus when the dialog opened. May be detached by close. */
  const capturedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const focusables = useCallback(() => {
    const panel = panelRef.current
    if (!panel) return [] as HTMLElement[]
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      // A control inside a collapsed section is in the DOM but not reachable;
      // including it would send focus somewhere invisible.
      (el) => el.offsetParent !== null || el === document.activeElement
    )
  }, [])

  useEffect(() => {
    if (!open) return

    capturedRef.current = document.activeElement as HTMLElement | null

    // First focusable, else the panel itself — a dialog whose focus stays on the
    // page behind it is worse than no dialog.
    const first = focusables()[0]
    if (first) first.focus()
    else panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Wrap at both ends. The `!panel.contains` case catches focus that has
      // already escaped — clicking the backdrop, for instance — and pulls it back.
      if (!panelRef.current?.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    // Scroll lock. Padding compensates for the scrollbar's width so the page
    // behind does not visibly jump sideways as it disappears.
    const { overflow, paddingRight } = document.body.style
    const gutter = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight

      // Deferred a frame, and both refs are read *inside* the callback rather
      // than snapshotted here. That is deliberate: when the trigger was
      // unmounted while the dialog was open, React has not yet remounted it at
      // the moment this cleanup runs, so a snapshot would capture the stale
      // node this whole branch exists to avoid.
      requestAnimationFrame(() => {
        // The rule below advises copying this ref to a variable in the effect
        // body. Doing so is precisely the bug being fixed: the trigger is
        // remounted between the effect and this frame, so the copy would be
        // the detached node the `isConnected` check exists to reject.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const opener = returnFocusRef?.current
        const captured = capturedRef.current
        // `isConnected` is the point. Focusing a detached node is a silent
        // no-op, so without this check a closed dialog leaves the keyboard at
        // the top of the document with nothing to indicate why.
        const target =
          (opener?.isConnected ? opener : null) ??
          (captured?.isConnected ? captured : null) ??
          document.querySelector<HTMLElement>('main')

        if (!target) return
        // <main> is not focusable by default; make it a programmatic-only stop
        // so it never becomes a tab stop of its own.
        if (target.tagName === 'MAIN' && !target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1')
        }
        target.focus()
      })
    }
  }, [open, onClose, focusables, returnFocusRef])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      // mousedown, not click: a click fires when a drag that began inside the
      // panel ends on the backdrop, closing the dialog mid text-selection.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`max-h-[90vh] w-full overflow-y-auto border border-border bg-surface p-4 outline-none sm:p-8 ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-mono text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 max-w-measure text-meta text-foreground-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 shrink-0 p-2 text-2xl leading-none text-foreground-muted hover:text-foreground"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { fitCanvas, rgba, useCanvasPalette } from './canvasTheme'

/**
 * Ambient bubbles drifting up behind the page.
 *
 * One canvas rather than eighteen DOM elements: eighteen absolutely-positioned
 * divs animating transform every frame is eighteen composited layers for the
 * browser to manage, and it shows on a mid-range phone. A canvas is one layer
 * and one draw call per frame.
 *
 * `fixed` rather than absolute, so a single canvas covers the viewport as the
 * page scrolls instead of a page-height canvas that has to be resized whenever
 * content changes height.
 *
 * Decorative throughout: `aria-hidden`, `pointer-events-none`, behind every
 * content layer, and absent entirely under reduced motion.
 */

/**
 * Density by area, not a fixed count.
 *
 * Eighteen bubbles on a 1440x900 desktop is ambient; the same eighteen on a
 * 390x844 phone is four times the density and reads as clutter over the
 * headline. One bubble per ~72k device-independent pixels holds the *feel*
 * constant instead of the number.
 */
function bubbleCount(width: number, height: number) {
  return Math.round(Math.min(22, Math.max(7, (width * height) / 72_000)))
}

type Bubble = {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  phase: number
  /** Alpha of the rim. Everything else is derived from it. */
  alpha: number
}

function spawn(width: number, height: number, atBottom: boolean): Bubble {
  return {
    x: Math.random() * width,
    // On first fill, scatter them up the viewport. Afterwards they enter from
    // below, or the whole field would visibly restart in unison.
    y: atBottom ? height + Math.random() * 80 : Math.random() * height,
    radius: 4 + Math.random() * 16,
    speed: 8 + Math.random() * 18,
    drift: 6 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.1 + Math.random() * 0.18,
  }
}

export default function Bubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const palette = useCanvasPalette()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    let width = window.innerWidth
    let height = window.innerHeight
    let context = fitCanvas(canvas, width, height)
    let bubbles = Array.from({ length: bubbleCount(width, height) }, () =>
      spawn(width, height, false),
    )
    let frame = 0
    let running = true
    let last = performance.now()

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      context = fitCanvas(canvas, width, height)

      // Rotating a phone changes the area enough to change the count. Add or
      // drop from the existing array rather than rebuilding it, so the bubbles
      // already on screen keep their positions instead of teleporting.
      const wanted = bubbleCount(width, height)
      while (bubbles.length < wanted) bubbles.push(spawn(width, height, true))
      if (bubbles.length > wanted) bubbles.length = wanted
    }
    window.addEventListener('resize', resize, { passive: true })

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running) {
        // Reset the clock, or the first frame back applies however many seconds
        // the tab spent hidden and every bubble jumps off the top at once.
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    function draw(now: number) {
      if (!context || !running) return

      // Delta-timed, so the drift is the same speed on a 60 Hz and a 120 Hz
      // display. Clamped because a long frame would teleport everything.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      context.clearRect(0, 0, width, height)

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]
        b.y -= b.speed * dt
        b.phase += dt * 0.6
        const x = b.x + Math.sin(b.phase) * b.drift

        // Fade out over the last fifth of the climb rather than vanishing at
        // the top edge.
        const progress = 1 - b.y / height
        const fade = progress > 0.8 ? Math.max(0, (1 - progress) / 0.2) : 1
        const a = b.alpha * fade

        // Hollow, not filled. A flat disc at a uniform alpha covers roughly a
        // hundred times more pixels than a one-pixel rim, so the fill wins and
        // the result reads as a smudge — which is exactly what the first
        // version looked like on screen. The gradient puts the weight at the
        // circumference and leaves the middle empty, which is what makes the
        // eye call it a bubble.
        const skin = context.createRadialGradient(x, b.y, b.radius * 0.2, x, b.y, b.radius)
        skin.addColorStop(0, rgba(palette.accent, 0))
        skin.addColorStop(0.75, rgba(palette.accent, a * 0.12))
        skin.addColorStop(1, rgba(palette.accent, a * 0.35))

        context.beginPath()
        context.arc(x, b.y, b.radius, 0, Math.PI * 2)
        context.fillStyle = skin
        context.fill()

        context.strokeStyle = rgba(palette.accent, a)
        context.lineWidth = 1.1
        context.stroke()

        // The catchlight. Accent rather than white, because a white highlight
        // on the ivory theme is invisible — against cream the mark has to be
        // darker than the ground, against onyx lighter, and the accent token is
        // already the one colour that is both.
        if (b.radius > 6) {
          context.beginPath()
          context.arc(
            x - b.radius * 0.34,
            b.y - b.radius * 0.36,
            Math.max(0.9, b.radius * 0.15),
            0,
            Math.PI * 2,
          )
          context.fillStyle = rgba(palette.accent, Math.min(1, a * 1.8))
          context.fill()
        }

        if (b.y + b.radius < 0) bubbles[i] = spawn(width, height, true)
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, palette])

  if (reducedMotion) return null

  // `-z-10` depends on one CSS rule: `app/globals.css` puts the page colour on
  // `body` and nothing on `html`, so that background propagates to the viewport
  // canvas and paints behind negative-z children. Give `html` a background and
  // these vanish with no error to explain it.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}

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

const COUNT = 18

type Bubble = {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  phase: number
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
    alpha: 0.05 + Math.random() * 0.1,
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
    let bubbles = Array.from({ length: COUNT }, () => spawn(width, height, false))
    let frame = 0
    let running = true
    let last = performance.now()

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      context = fitCanvas(canvas, width, height)
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

        context.beginPath()
        context.arc(x, b.y, b.radius, 0, Math.PI * 2)
        context.fillStyle = rgba(palette.accent, b.alpha * fade * 0.6)
        context.fill()

        // A rim, so it reads as a bubble rather than a dot.
        context.strokeStyle = rgba(palette.accent, b.alpha * fade)
        context.lineWidth = 1
        context.stroke()

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

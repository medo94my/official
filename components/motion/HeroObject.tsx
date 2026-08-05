'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { fitCanvas, rgba, useCanvasPalette } from './canvasTheme'

type Vec3 = [number, number, number]

/**
 * A rotating wireframe icosahedron, drawn with real 3D projection.
 *
 * No library. Three.js would be roughly 150 kB gzipped — larger than the whole
 * rest of this site's JavaScript — to draw twelve points and thirty lines. The
 * projection is six lines of maths, and doing it by hand means the shape can be
 * built from the brand tokens and follow the theme, which an off-the-shelf
 * material would not.
 *
 * Decorative: `aria-hidden`, `pointer-events-none`, and it renders nothing at
 * all under reduced motion rather than freezing mid-spin.
 */

const PHI = (1 + Math.sqrt(5)) / 2

/** The twelve vertices of an icosahedron, as three orthogonal golden rectangles. */
const VERTICES: Vec3[] = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
]

/**
 * Edges derived by distance rather than typed out.
 *
 * On this construction every edge has length exactly 2, so the thirty edges are
 * the thirty vertex pairs at that distance. A hand-written index table would be
 * thirty chances to transpose a digit and get a shape subtly wrong in a way
 * that is very hard to see.
 */
const EDGES: [number, number][] = (() => {
  const edges: [number, number][] = []
  for (let i = 0; i < VERTICES.length; i++) {
    for (let j = i + 1; j < VERTICES.length; j++) {
      const [ax, ay, az] = VERTICES[i]
      const [bx, by, bz] = VERTICES[j]
      const d = Math.hypot(ax - bx, ay - by, az - bz)
      if (Math.abs(d - 2) < 1e-6) edges.push([i, j])
    }
  }
  return edges
})()

export default function HeroObject() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const palette = useCanvasPalette()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const parent = canvas.parentElement
    if (!parent) return

    let context = fitCanvas(canvas, parent.clientWidth, parent.clientHeight)
    let frame = 0
    let running = true

    // Where the pointer is pulling the object, and where it currently is. The
    // gap between the two is what makes it drift rather than snap.
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      // Normalised to roughly -1..1 across the viewport, so the tilt is the
      // same on a phone as on a wide display.
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const resize = () => {
      context = fitCanvas(canvas, parent.clientWidth, parent.clientHeight)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    window.addEventListener('pointermove', onPointer, { passive: true })

    // A tab in the background still runs rAF in some browsers, and an
    // off-screen canvas is work nobody can see.
    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running) frame = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    const start = performance.now()

    function draw(now: number) {
      if (!context || !running) return

      const width = parent!.clientWidth
      const height = parent!.clientHeight
      const t = (now - start) / 1000

      context.clearRect(0, 0, width, height)

      // Ease toward the pointer. 0.04 is slow enough to read as inertia rather
      // than as lag.
      current.x += (target.x - current.x) * 0.04
      current.y += (target.y - current.y) * 0.04

      const rotY = t * 0.25 + current.x * 0.5
      const rotX = Math.sin(t * 0.18) * 0.35 + current.y * 0.35

      const radius = Math.min(width, height) * 0.34
      const cx = width / 2
      const cy = height / 2
      // Camera distance in units of the model's own radius. 4.2 gives noticeable
      // perspective without the near vertices ballooning.
      const camera = 4.2
      const focal = radius * 1.6

      const projected = VERTICES.map(([x, y, z]) => {
        // Y rotation, then X. Order matters; the reverse tumbles differently.
        const x1 = x * Math.cos(rotY) - z * Math.sin(rotY)
        const z1 = x * Math.sin(rotY) + z * Math.cos(rotY)
        const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX)
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX)

        const scale = focal / (camera - z2)
        return { x: cx + x1 * scale, y: cy + y2 * scale, depth: z2 }
      })

      // Far edges first, so nearer ones draw over them and the form reads as
      // solid rather than as a flat tangle of lines.
      const ordered = EDGES.map(([a, b]) => ({
        a,
        b,
        depth: (projected[a].depth + projected[b].depth) / 2,
      })).sort((p, q) => p.depth - q.depth)

      for (const { a, b, depth } of ordered) {
        // Depth fog: -PHI..PHI mapped to 0..1, then a gentle alpha ramp.
        const near = (depth + PHI) / (PHI * 2)
        context.strokeStyle = rgba(palette.accent, 0.12 + near * 0.4)
        context.lineWidth = 0.6 + near * 0.9
        context.beginPath()
        context.moveTo(projected[a].x, projected[a].y)
        context.lineTo(projected[b].x, projected[b].y)
        context.stroke()
      }

      for (const point of projected) {
        const near = (point.depth + PHI) / (PHI * 2)
        context.fillStyle = rgba(palette.primary, 0.25 + near * 0.55)
        context.beginPath()
        context.arc(point.x, point.y, 1.2 + near * 2.2, 0, Math.PI * 2)
        context.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, palette])

  // Nothing at all under reduced motion. A frozen wireframe would be a
  // decorative shape with no purpose, competing with the headline beside it.
  if (reducedMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] max-w-lg lg:block"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

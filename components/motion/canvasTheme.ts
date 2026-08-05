'use client'

import { useEffect, useState } from 'react'

/**
 * Brand colours read from CSS custom properties, for canvas drawing.
 *
 * Canvas cannot use `rgb(var(--accent) / 0.2)` — it needs a concrete string. So
 * the tokens are read once from the document and re-read when the theme
 * changes, rather than being hardcoded. Hardcoding them would put the one hex
 * value in the codebase that ignores both themes, which is exactly what
 * app/globals.css warns against.
 */
export type CanvasPalette = {
  accent: string
  primary: string
  foreground: string
}

function readToken(styles: CSSStyleDeclaration, name: string, fallback: string) {
  // The tokens are space-separated RGB channels: "194 163 92".
  const raw = styles.getPropertyValue(name).trim()
  return /^\d+\s+\d+\s+\d+$/.test(raw) ? raw : fallback
}

function readPalette(): CanvasPalette {
  if (typeof window === 'undefined') {
    return { accent: '194 163 92', primary: '126 21 48', foreground: '12 12 14' }
  }
  const styles = getComputedStyle(document.documentElement)
  return {
    accent: readToken(styles, '--accent', '194 163 92'),
    primary: readToken(styles, '--primary', '126 21 48'),
    foreground: readToken(styles, '--foreground', '12 12 14'),
  }
}

/** `rgb(r g b / a)` from a channel triplet. */
export function rgba(channels: string, alpha: number) {
  return `rgb(${channels} / ${alpha})`
}

/**
 * Re-reads on theme change.
 *
 * The toggle stamps `data-theme` on `<html>`, so a MutationObserver on that one
 * attribute is enough — without it a canvas drawn in the light theme keeps its
 * bronze after switching to dark, which is more obvious than it sounds because
 * everything around it changes.
 */
export function useCanvasPalette(): CanvasPalette {
  const [palette, setPalette] = useState<CanvasPalette>(readPalette)

  useEffect(() => {
    setPalette(readPalette())

    const observer = new MutationObserver(() => setPalette(readPalette()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })
    return () => observer.disconnect()
  }, [])

  return palette
}

/**
 * A canvas sized to its container in device pixels.
 *
 * Without the devicePixelRatio scale every line is soft on a retina display,
 * which on a one-pixel wireframe is the difference between crisp and smudged.
 * Capped at 2 because a 3x scale triples the fill cost for no visible gain.
 */
export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const context = canvas.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  return context
}

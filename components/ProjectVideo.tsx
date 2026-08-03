'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/components/motion/useReducedMotion'

type ProjectVideoProps = {
  src: string
  poster?: string | null
  width?: number | null
  height?: number | null
  /** Describes what the clip shows. Rendered as a caption, not as alt text. */
  caption?: string
}

/**
 * A short, silent, looping screen recording.
 *
 * This is the only honest way to show a CLI tool or an API doing its job: a
 * still of a terminal proves nothing, and the alternative was showing nothing at
 * all. It is a demonstration, not a film — hence muted, looping and without
 * controls by default.
 *
 * Four behaviours are deliberate:
 *
 * - **`preload="none"` with a poster.** The page costs nothing until the clip is
 *   actually scrolled to. Several clips on one case-study page would otherwise
 *   pull tens of megabytes on a phone connection before anyone asked.
 * - **Paused off-screen.** Decoding several loops at once for content nobody is
 *   looking at drains a battery for no reason.
 * - **`playsInline`.** Without it iOS Safari takes the video fullscreen on play,
 *   hijacking the page.
 * - **No autoplay under reduced motion.** A looping clip is exactly the
 *   repetitive motion that setting exists to stop, so it becomes a poster with
 *   an explicit play control instead.
 */
export default function ProjectVideo({
  src,
  poster,
  width,
  height,
  caption,
}: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // A rejected play() is normal — a browser may refuse before any user
          // gesture. The poster stays up and the control below still works, so
          // there is nothing useful to do with the error.
          void video.play().then(() => setStarted(true)).catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  const showPlayButton = reducedMotion && !started

  return (
    <figure className="mt-6">
      <div
        className="relative overflow-hidden border border-border bg-background-subtle"
        style={{ aspectRatio: width && height ? `${width} / ${height}` : '16 / 9' }}
      >
        <video
          ref={ref}
          src={src}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          // Controls appear only when autoplay is off, so the clip is never a
          // dead poster the visitor cannot start.
          controls={reducedMotion}
          onPlay={() => setStarted(true)}
          className="h-full w-full object-cover"
        />

        {showPlayButton && !poster && (
          <p className="absolute inset-x-0 bottom-0 bg-surface/90 p-3 text-meta text-foreground-muted">
            Motion is reduced in your system settings, so this clip does not play
            automatically. Use the controls to watch it.
          </p>
        )}
      </div>

      {caption && (
        <figcaption className="mt-2 max-w-measure text-meta text-foreground-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

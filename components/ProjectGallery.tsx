import Image from 'next/image'
import Reveal from '@/components/motion/Reveal'
import ProjectVideo from '@/components/ProjectVideo'
import type { PublicMedia } from '@/lib/content'

/**
 * The screenshots and clips for one project.
 *
 * Renders nothing when there is no media, so a project without any behaves
 * exactly as it did before this existed — the same rule the case-study blocks
 * already follow.
 *
 * Images and clips share one ordered list rather than living in separate
 * sections: the owner decides the sequence in the dashboard, and a walkthrough
 * usually wants a still, then the thing running, then another still.
 */
export default function ProjectGallery({ media }: { media: PublicMedia[] }) {
  if (media.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="label mb-4">Screens</h2>

      <div className="space-y-8">
        {media.map((item, index) =>
          item.kind === 'video' ? (
            <Reveal key={item.id} index={index} distance="lift">
              <ProjectVideo
                src={item.url}
                poster={item.poster}
                width={item.width}
                height={item.height}
                caption={item.alt || undefined}
              />
            </Reveal>
          ) : (
            <Reveal key={item.id} index={index} distance="lift">
              <figure>
                <div className="overflow-hidden border border-border bg-background-subtle">
                  <Image
                    src={item.url}
                    // Empty alt is honoured rather than substituted. A generated
                    // "Screenshot of X" on a decorative image is noise a screen
                    // reader has to sit through; the admin requires real alt
                    // text, so a blank one here is a deliberate choice.
                    alt={item.alt}
                    width={item.width ?? 1600}
                    height={item.height ?? 900}
                    // The case study is a single measure-width column, so one
                    // breakpoint is the whole story.
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="h-auto w-full"
                  />
                </div>
                {item.alt && (
                  <figcaption className="mt-2 max-w-measure text-meta text-foreground-muted">
                    {item.alt}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          )
        )}
      </div>
    </section>
  )
}

/**
 * "3 screens · 1 clip", or null when there is nothing.
 *
 * Used in the list entry so a project hints at what its case study holds, rather
 * than the reader having to open each one to find out.
 */
export function describeMedia(media: PublicMedia[]) {
  const images = media.filter((m) => m.kind === 'image').length
  const clips = media.filter((m) => m.kind === 'video').length
  const parts: string[] = []

  if (images) parts.push(`${images} screen${images === 1 ? '' : 's'}`)
  if (clips) parts.push(`${clips} clip${clips === 1 ? '' : 's'}`)

  return parts.length > 0 ? parts.join(' · ') : null
}

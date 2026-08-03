'use client'

import { useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN_DANGER, BTN_GHOST, FIELD, LABEL, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'

export type MediaItem = {
  id: string
  kind: string
  url: string
  alt: string
  poster: string | null
  width: number | null
  height: number | null
  order: number
}

type Props = {
  projectId: string
  items: MediaItem[]
  onChange: (items: MediaItem[]) => void
}

/**
 * Screenshots and clips for one project.
 *
 * Uploads immediately on selection rather than on form submit, because the
 * server has to name the file and hand back a URL before there is anything to
 * associate. Alt text and ordering are edited afterwards against the saved row.
 *
 * Only rendered for a project that already exists — a file needs somewhere to
 * belong, and the slug is what names it on disk.
 */
export default function MediaManager({ projectId, items, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true)
      const added: MediaItem[] = []

      try {
        // Sequential, not Promise.all: `order` is assigned server-side from the
        // current count, and three parallel uploads would all read the same
        // count and land on the same position.
        for (const file of Array.from(files)) {
          const body = new FormData()
          body.append('file', file)
          body.append('projectId', projectId)

          const size = await intrinsicSize(file)
          if (size) {
            body.append('width', String(size.width))
            body.append('height', String(size.height))
          }

          try {
            // Not apiRequest: that sets a JSON Content-Type, which would stop
            // the browser writing the multipart boundary and the body would
            // arrive unparseable.
            const response = await fetch('/api/media', { method: 'POST', body })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.error || `Upload failed (${response.status})`)
            added.push(data as MediaItem)
          } catch (error) {
            toast.error(`${file.name}: ${errorMessage(error, 'Upload failed')}`)
          }
        }

        if (added.length > 0) {
          onChange([...items, ...added])
          toast.success(added.length === 1 ? 'Uploaded' : `Uploaded ${added.length}`)
        }
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [items, onChange, projectId]
  )

  const patch = async (id: string, data: Partial<Pick<MediaItem, 'alt' | 'order'>>) => {
    try {
      await apiRequest(`/api/media/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save that change'))
    }
  }

  const remove = async (item: MediaItem) => {
    if (!confirm('Remove this file? It is deleted from the server and cannot be recovered.')) return
    try {
      await apiRequest(`/api/media/${item.id}`, { method: 'DELETE' })
      onChange(items.filter((i) => i.id !== item.id))
      toast.success('Removed')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not remove'))
    }
  }

  /** Up/down rather than drag: a drag handle needs a keyboard equivalent to be usable at all. */
  const move = async (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return

    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    const renumbered = next.map((item, i) => ({ ...item, order: i }))
    onChange(renumbered)

    await Promise.all(
      [index, target].map((i) => patch(renumbered[i].id, { order: renumbered[i].order }))
    )
  }

  const missingAlt = items.filter((i) => i.kind === 'image' && !i.alt.trim()).length

  return (
    <div className="border-t border-border pt-4">
      <p className={LABEL}>Screens and clips</p>
      <p className="mt-1 max-w-measure text-meta text-foreground-muted">
        PNG, JPEG or WebP up to 5 MB. MP4 or WebM up to 25 MB — a showcase clip should be ten to
        fifteen seconds, silent, and loop cleanly. It plays automatically when scrolled to.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length > 0) void upload(e.dataTransfer.files)
        }}
        className={`mt-3 border border-dashed p-4 text-center transition-colors ${
          dragging ? 'border-accent bg-background-subtle' : 'border-border'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
          disabled={uploading}
          onChange={(e) => e.target.files?.length && void upload(e.target.files)}
          className="block w-full text-meta file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:font-mono file:text-meta file:text-foreground"
        />
        <p className="mt-2 text-meta text-foreground-subtle">
          {uploading ? 'Uploading…' : 'or drop files here'}
        </p>
      </div>

      {missingAlt > 0 && (
        <p className="mt-3 text-meta text-warning">
          {/* Not merely advisory: an unlabelled screenshot on a public page is
              invisible to anyone using a screen reader. */}
          {missingAlt} image{missingAlt === 1 ? '' : 's'} still need a description. Without one it is
          announced to a screen reader as nothing at all.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className={PANEL}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-20 w-32 shrink-0 overflow-hidden border border-border bg-background-subtle">
                {item.kind === 'video' ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption -- silent UI clip, muted preview only
                  <video src={item.url} muted className="h-full w-full object-cover" />
                ) : (
                  // Plain img, not next/image: this is a fixed 128px admin
                  // thumbnail, and running it through the optimiser would spend
                  // a transform per upload for no visible gain.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="min-w-[12rem] flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="label">{item.kind}</span>
                  <span className="label tnum text-foreground-subtle">
                    {item.width && item.height ? `${item.width}×${item.height}` : 'size unknown'}
                  </span>
                </div>

                <label htmlFor={`alt-${item.id}`} className="sr-only">
                  Description for {item.kind}
                </label>
                <input
                  id={`alt-${item.id}`}
                  type="text"
                  defaultValue={item.alt}
                  placeholder={
                    item.kind === 'video'
                      ? 'What the clip shows — used as its caption'
                      : 'What this shows, for screen readers and as a caption'
                  }
                  // On blur, not per keystroke: one request per character typed
                  // would be absurd, and there is no draft state to lose here.
                  onBlur={(e) => {
                    const alt = e.target.value
                    if (alt !== item.alt) {
                      onChange(items.map((i) => (i.id === item.id ? { ...i, alt } : i)))
                      void patch(item.id, { alt })
                    }
                  }}
                  className={`${FIELD} mt-2`}
                />
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className={`${BTN_GHOST} disabled:opacity-40`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => void move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move later"
                  className={`${BTN_GHOST} disabled:opacity-40`}
                >
                  ↓
                </button>
                <button type="button" onClick={() => void remove(item)} className={BTN_DANGER}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Intrinsic dimensions, read in the browser.
 *
 * Sent with the upload so the server can store them without a server-side image
 * library — adding `sharp` purely to read a file header would be several
 * megabytes for two integers. A wrong value costs a layout shift, never a
 * security problem, so a client-supplied number is acceptable here in a way it
 * would not be for the file's type.
 */
async function intrinsicSize(file: File): Promise<{ width: number; height: number } | null> {
  if (file.type.startsWith('image/')) {
    try {
      const bitmap = await createImageBitmap(file)
      const size = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return size
    } catch {
      return null
    }
  }

  if (file.type.startsWith('video/')) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve({ width: video.videoWidth, height: video.videoHeight })
      }
      video.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      video.src = url
    })
  }

  return null
}

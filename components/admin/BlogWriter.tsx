'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, BTN_GHOST, FIELD, LABEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import { POST_LENGTHS, type DraftedPost, type PostLength } from '@/lib/blog-writer'

type Props = {
  onDrafted: (draft: DraftedPost) => void
  /** True when the form already holds something a draft would overwrite. */
  hasContent: boolean
}

/**
 * Drafts a whole post from a topic.
 *
 * The warning here is not decoration. Unlike the case-study drafter, nothing
 * grounds this: the model writes from its own training data, and neither this
 * app nor the owner has any way to check a claim it makes short of reading it.
 * Saying so at the point of use is the honest place to say it — a note in a
 * README protects nobody.
 */
export default function BlogWriter({ onDrafted, hasContent }: Props) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState('')
  const [length, setLength] = useState<PostLength>('standard')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (
      hasContent &&
      !confirm('This replaces the title, summary, body and tags currently in the form. Continue?')
    ) {
      return
    }

    setLoading(true)
    try {
      const draft = await apiRequest<DraftedPost & { model: string }>('/api/blog/draft', {
        method: 'POST',
        body: JSON.stringify({ topic, length }),
      })
      onDrafted(draft)
      setOpen(false)
      setTopic('')
      toast.success('Drafted — read it before publishing')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not draft that post'))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={BTN_GHOST}>
        Draft with AI
      </button>
    )
  }

  return (
    <div className="border border-warning/40 bg-background-subtle p-4">
      <p className="label text-warning">Nothing checks what this writes</p>
      <p className="mt-2 max-w-measure text-meta text-foreground/85">
        It writes from the model&rsquo;s own knowledge, not from your work, and it can be
        confidently wrong about technical detail. It publishes under your name, so you are the
        only reviewer. It arrives as a draft and cannot go live until you publish it.
      </p>

      <label htmlFor="blog-topic" className={`${LABEL} mt-4`}>
        What should it be about?
      </label>
      <textarea
        id="blog-topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={3}
        placeholder="Why an SSRF allowlist has to resolve DNS itself, and what breaks when it does not"
        className={FIELD}
      />
      <p className="mt-1 text-meta text-foreground-subtle">
        A sentence works far better than a keyword.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="blog-length" className={LABEL}>
            Length
          </label>
          <select
            id="blog-length"
            value={length}
            onChange={(e) => setLength(e.target.value as PostLength)}
            className={FIELD}
          >
            {POST_LENGTHS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.words}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => void run()}
          disabled={loading || topic.trim().length < 8}
          className={BTN}
        >
          {loading ? 'Writing…' : 'Draft it'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={BTN_GHOST}>
          Cancel
        </button>
      </div>
    </div>
  )
}

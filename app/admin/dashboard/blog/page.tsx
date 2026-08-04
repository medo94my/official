'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, FIELD, FIELD_MONO, LABEL, PAGE_TITLE, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import BlogWriter from '@/components/admin/BlogWriter'
import ListState from '@/components/admin/ListState'
import Modal from '@/components/ui/Modal'

/**
 * Loaded on demand, so the markdown parser is an async chunk fetched the first
 * time Preview is pressed rather than part of this page's initial bundle.
 * `ssr: false` because there is nothing to render on the server — the body it
 * previews only exists in this component's state.
 */
const MarkdownPreview = dynamic(() => import('@/components/admin/MarkdownPreview'), {
  ssr: false,
  loading: () => <p className="text-meta text-foreground-muted">Loading preview…</p>,
})
import { formatPostDate, readingMinutes } from '@/lib/blog'
import type { DraftedPost } from '@/lib/blog-writer'
import { slugify } from '@/lib/slug'

type Post = {
  id: string
  title: string
  slug: string
  summary: string
  body: string
  tags: string
  coverImage: string | null
  coverAlt: string
  status: string
  publishedAt: string | null
  aiDrafted: boolean
}

const EMPTY = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  tags: '',
  coverImage: '',
  coverAlt: '',
  status: 'draft',
  aiDrafted: false,
}

type FormData = typeof EMPTY

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const fetchPosts = useCallback(async () => {
    try {
      setPosts(await apiRequest<Post[]>('/api/blog'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load posts'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const resetForm = () => {
    setFormData(EMPTY)
    setEditing(null)
    setPreview(false)
    setIsFormOpen(false)
  }

  const handleEdit = (post: Post) => {
    setEditing(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      body: post.body,
      tags: post.tags,
      coverImage: post.coverImage ?? '',
      coverAlt: post.coverAlt,
      status: post.status,
      aiDrafted: post.aiDrafted,
    })
    setPreview(false)
    setIsFormOpen(true)
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await apiRequest(editing ? `/api/blog/${editing.id}` : '/api/blog', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...formData,
          slug: slugify(formData.slug || formData.title),
        }),
      })
      toast.success(editing ? 'Post updated' : 'Post created')
      await fetchPosts()
      resetForm()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save post'))
    } finally {
      setSaving(false)
    }
  }

  /** Publish and unpublish are one-click, not a status buried inside the form. */
  const setStatus = async (post: Post, status: string) => {
    try {
      await apiRequest(`/api/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...post, coverImage: post.coverImage ?? '', status }),
      })
      toast.success(status === 'published' ? 'Published' : 'Moved back to drafts')
      await fetchPosts()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not change the status'))
    }
  }

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    try {
      await apiRequest(`/api/blog/${post.id}`, { method: 'DELETE' })
      toast.success('Post deleted')
      await fetchPosts()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete post'))
    }
  }

  const uploadCover = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      // No projectId: the media route stores the file and returns its URL
      // without creating a gallery row. Same validation either way.
      const response = await fetch('/api/media', { method: 'POST', body })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || `Upload failed (${response.status})`)
      set('coverImage', data.url)
      toast.success('Cover uploaded')
    } catch (error) {
      toast.error(errorMessage(error, 'Could not upload that image'))
    } finally {
      setUploading(false)
    }
  }

  const assist = async (task: 'tighten' | 'summary' | 'tags', text: string) => {
    if (!text.trim()) {
      toast.error('There is nothing to work on yet.')
      return
    }
    try {
      const { result } = await apiRequest<{ result: string }>('/api/blog/assist', {
        method: 'POST',
        body: JSON.stringify({ task, text }),
      })
      if (task === 'tighten') set('body', result)
      if (task === 'summary') set('summary', result)
      if (task === 'tags') set('tags', result)
      toast.success('Updated')
    } catch (error) {
      toast.error(errorMessage(error, 'That did not work'))
    }
  }

  const applyDraft = (draft: DraftedPost) => {
    setFormData({
      ...EMPTY,
      title: draft.title,
      slug: slugify(draft.title),
      summary: draft.summary,
      body: draft.body,
      tags: draft.tags.join(', '),
      // Marks the body as unreviewed. The server clears it the moment the body
      // differs from what it stored, so editing a word is enough.
      aiDrafted: true,
    })
    setIsFormOpen(true)
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className={PAGE_TITLE}>Blog</h1>
        {!isFormOpen && (
          <div className="flex flex-wrap gap-3">
            <BlogWriter onDrafted={applyDraft} hasContent={false} />
            <button onClick={() => setIsFormOpen(true)} className={BTN}>
              Write a post
            </button>
          </div>
        )}
      </div>

      <p className="mb-6 max-w-measure text-meta text-foreground-muted">
        Drafts are invisible to the public and their URLs return 404. A Writing link appears in the
        site header only once something is published.
      </p>

      <ListState
        loading={loading}
        count={posts.length}
        empty="No posts yet."
        consequence="The Writing section stays out of the site's navigation until one is published."
      />

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className={PANEL}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`label ${post.status === 'published' ? 'text-success' : 'text-foreground-subtle'}`}
                  >
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  {post.aiDrafted && <span className="label text-warning">Unreviewed AI draft</span>}
                  <span className="label tnum text-foreground-subtle">
                    {[formatPostDate(post.publishedAt), `${readingMinutes(post.body)} min`]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </span>
                </div>

                <h2 className="mt-1 font-mono text-base font-medium">{post.title}</h2>
                <p className="mt-1 max-w-measure text-meta text-foreground-muted">{post.summary}</p>
                <p className="mt-1 font-mono text-meta text-foreground-subtle">/blog/{post.slug}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button onClick={() => handleEdit(post)} className={BTN_GHOST}>
                  Edit
                </button>
                <button
                  onClick={() =>
                    void setStatus(post, post.status === 'published' ? 'draft' : 'published')
                  }
                  className={BTN_GHOST}
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => void remove(post)} className={BTN_DANGER}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={isFormOpen}
        onClose={resetForm}
        title={editing ? 'Edit post' : 'New post'}
      >
        <form onSubmit={save} className="space-y-4">
          {formData.aiDrafted && (
            <div className="border border-warning/40 bg-background-subtle p-3">
              <p className="label text-warning">Nothing here has been checked</p>
              <p className="mt-1 max-w-measure text-meta text-foreground/85">
                A model wrote this from its own knowledge, not from your work. Read it before
                publishing. This notice disappears once you edit the body.
              </p>
            </div>
          )}

          {!editing && (
            <BlogWriter
              onDrafted={applyDraft}
              hasContent={Boolean(formData.title || formData.body)}
            />
          )}

          <div>
            <label htmlFor="p-title" className={LABEL}>Title</label>
            <input
              id="p-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                set('title', e.target.value)
                if (!editing) set('slug', slugify(e.target.value))
              }}
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="p-slug" className={LABEL}>URL</label>
            <input
              id="p-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => set('slug', e.target.value)}
              className={FIELD_MONO}
            />
            <p className="mt-1 font-mono text-meta text-foreground-subtle">
              /blog/{slugify(formData.slug || formData.title) || '…'}
              {editing && ' — changing this changes the post’s URL.'}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="p-summary" className={LABEL}>Summary</label>
              <button
                type="button"
                onClick={() => void assist('summary', formData.body)}
                className={BTN_GHOST}
              >
                Suggest from the body
              </button>
            </div>
            <textarea
              id="p-summary"
              required
              rows={2}
              value={formData.summary}
              onChange={(e) => set('summary', e.target.value)}
              className={FIELD}
            />
            <p className="mt-1 text-meta text-foreground-subtle">
              The index entry, the search result and the feed text. {formData.summary.length}/200 is
              about right.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="p-body" className={LABEL}>Body — Markdown</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview((p) => !p)}
                  className={BTN_GHOST}
                  aria-pressed={preview}
                >
                  {preview ? 'Write' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => void assist('tighten', formData.body)}
                  className={BTN_GHOST}
                >
                  Tighten
                </button>
              </div>
            </div>

            {preview ? (
              // The real renderer, through the same plugins and overrides as the
              // public page — so this shows what will actually publish rather
              // than where the asterisks are.
              <MarkdownPreview markdown={formData.body} />
            ) : (
              <textarea
                id="p-body"
                required
                rows={18}
                value={formData.body}
                onChange={(e) => set('body', e.target.value)}
                className={FIELD_MONO}
              />
            )}
            <p className="mt-1 text-meta text-foreground-subtle">
              Headings, lists, links and ```fenced code blocks```. HTML is not rendered — it appears
              as text.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="p-tags" className={LABEL}>Tags</label>
              <button
                type="button"
                onClick={() => void assist('tags', formData.body)}
                className={BTN_GHOST}
              >
                Suggest from the body
              </button>
            </div>
            <input
              id="p-tags"
              type="text"
              value={formData.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="Python, PostgreSQL, Next.js"
              className={FIELD}
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className={LABEL}>Cover image</p>
            {formData.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.coverImage}
                alt=""
                className="mt-2 h-32 w-full max-w-sm border border-border object-cover"
              />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && void uploadCover(e.target.files[0])}
              className="mt-2 block w-full text-meta file:mr-3 file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:font-mono file:text-meta file:text-foreground"
            />
            {formData.coverImage && (
              <div className="mt-2">
                <label htmlFor="p-coverAlt" className={LABEL}>
                  What the image shows
                </label>
                <input
                  id="p-coverAlt"
                  type="text"
                  value={formData.coverAlt}
                  onChange={(e) => set('coverAlt', e.target.value)}
                  className={FIELD}
                />
                <p className="mt-1 text-meta text-foreground-subtle">
                  Without this the image is announced to a screen reader as nothing at all.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4">
            <button type="submit" disabled={saving} className={`flex-1 ${BTN}`}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Create as draft'}
            </button>
            <button type="button" onClick={resetForm} className={BTN_GHOST}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

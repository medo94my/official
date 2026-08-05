'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FormLoading } from '@/components/admin/ListState'
import { BTN, FIELD, LABEL, PAGE_TITLE } from '@/app/admin/ui'

export default function HeroPage() {
  const [formData, setFormData] = useState({
    headline: '',
    subheadline: '',
    valueProp: '',
    ctaText: 'View My Work',
    ctaUrl: '#portfolio',
    background: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      if (data) {
        // `background` and `subheadline` are nullable, and a null `value` flips
        // an input to uncontrolled. Keep every field a string.
        setFormData((current) =>
          Object.fromEntries(
            Object.keys(current).map((key) => [key, data[key] ?? ''])
          ) as typeof current
        )
      }
    } catch (error) {
      // Was console.error only, so a failed load looked exactly like a record
      // that has never been filled in — an empty form either way.
      toast.error('Could not load the current values. Saving now would overwrite them with blanks.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      toast.success('Hero section updated!')
    } catch (error) {
      toast.error('Failed to update hero section')
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-8`}>Hero Section</h1>

      <div className="border border-border bg-surface p-6 max-w-2xl">
        {/* The form stays out of the DOM until the record arrives. It used
            to render blank and backfill a moment later, so anything typed in
            that window was silently overwritten by the response. */}
        <FormLoading loading={loading} />
        {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="h-headline" className={`${LABEL}`}>Headline</label>
            <input
              id="h-headline"
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              required
              placeholder="e.g., Hi, I'm John Doe"
              className={`${FIELD}`}
            />
          </div>

          <div>
            <label htmlFor="subheadline" className={`${LABEL}`}>Subheadline</label>
            <input
              id="subheadline"
              type="text"
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              placeholder="Full-stack · automation · self-hosted infrastructure"
              className={`${FIELD}`}
            />
            <p className="mt-1 text-meta text-foreground-muted">
              Shown as the eyebrow above the headline, and as the &ldquo;Focus&rdquo;
              cell in the hero ledger.
            </p>
          </div>

          <div>
            <label htmlFor="valueProp" className={`${LABEL}`}>
              Value proposition
            </label>
            <textarea
              id="valueProp"
              value={formData.valueProp}
              onChange={(e) => setFormData({ ...formData, valueProp: e.target.value })}
              rows={3}
              placeholder="What you build, who you help, and why it matters — one or two sentences."
              className={`${FIELD}`}
            />
            <p className="mt-1 text-meta text-foreground-muted">
              The sentence under the headline. This is the single claim the rest
              of the page has to support. While it is blank the hero shows the
              headline alone — no placeholder text is invented.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="h-cta-button-text" className={`${LABEL}`}>CTA Button Text</label>
              <input
                id="h-cta-button-text"
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="h-cta-url" className={`${LABEL}`}>CTA URL</label>
              <input
                id="h-cta-url"
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                className={`${FIELD}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="h-background-image-url" className={`${LABEL}`}>Background Image URL</label>
            <input
              id="h-background-image-url"
              type="text"
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              placeholder="Optional background image"
              className={`${FIELD}`}
            />
          </div>

          <button
            type="submit"
            className={`${BTN} w-full transition`}
          >
            Save Changes
          </button>
        </form>
        )}
      </div>
    </div>
  )
}

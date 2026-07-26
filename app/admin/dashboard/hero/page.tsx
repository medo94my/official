'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BTN, FIELD, LABEL, PAGE_TITLE } from '@/app/admin/ui'

export default function HeroPage() {
  const [formData, setFormData] = useState({
    headline: '',
    subheadline: '',
    ctaText: 'View My Work',
    ctaUrl: '#portfolio',
    background: '',
  })

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
      console.error('Failed to fetch hero info')
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

      <div className="border border-rule bg-panel p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`${LABEL}`}>Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              required
              placeholder="e.g., Hi, I'm John Doe"
              className={`${FIELD}`}
            />
          </div>

          <div>
            <label className={`${LABEL}`}>Subheadline</label>
            <input
              type="text"
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              placeholder="e.g., Full Stack Developer"
              className={`${FIELD}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`${LABEL}`}>CTA Button Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label className={`${LABEL}`}>CTA URL</label>
              <input
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                className={`${FIELD}`}
              />
            </div>
          </div>

          <div>
            <label className={`${LABEL}`}>Background Image URL</label>
            <input
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
      </div>
    </div>
  )
}

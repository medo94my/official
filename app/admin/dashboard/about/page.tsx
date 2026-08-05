'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'
import { FormLoading } from '@/components/admin/ListState'
import { BTN, FIELD, LABEL, PAGE_TITLE } from '@/app/admin/ui'

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    avatar: '',
    resume: '',
    github: '',
    linkedin: '',
    twitter: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const res = await fetch('/api/about')
      const data = await res.json()
      if (data) {
        // Unset columns come back as null, and a null `value` flips an input to
        // uncontrolled. Keep every field a string.
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
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      toast.success('About info updated!')
    } catch (error) {
      toast.error('Failed to update about info')
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-8`}>About</h1>

      <div className="border border-border bg-surface p-6 max-w-3xl">
        {/* The form stays out of the DOM until the record arrives. It used
            to render blank and backfill a moment later, so anything typed in
            that window was silently overwritten by the response. */}
        <FormLoading loading={loading} />
        {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="a-name" className={`${LABEL}`}>Name</label>
              <input
                id="a-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-title-role" className={`${LABEL}`}>Title/Role</label>
              <input
                id="a-title-role"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className={`${FIELD}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="a-bio" className={`${LABEL}`}>
              Bio
              
            </label>
            <textarea
              id="a-bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
              rows={4}
              className={`${FIELD}`}
            />
            <div className="mt-2">
              <VoiceRecorder
                onTranscription={(text) => setFormData({ ...formData, bio: text })}
                enhance={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="a-email" className={`${LABEL}`}>Email</label>
              <input
                id="a-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-phone" className={`${LABEL}`}>Phone</label>
              <input
                id="a-phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-whatsapp" className={`${LABEL}`}>WhatsApp</label>
              <input
                id="a-whatsapp"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+90 555 000 0000"
                className={`${FIELD}`}
              />
              <p className="mt-1 text-meta text-foreground-muted">
                Shows the floating WhatsApp button. Leave empty to hide it. Any format works —
                spaces and the leading + are stripped automatically.
              </p>
            </div>

            <div>
              <label htmlFor="a-location" className={`${LABEL}`}>Location</label>
              <input
                id="a-location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-avatar-url" className={`${LABEL}`}>Avatar URL</label>
              <input
                id="a-avatar-url"
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-resume-url" className={`${LABEL}`}>Resume URL</label>
              <input
                id="a-resume-url"
                type="text"
                value={formData.resume}
                onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-github" className={`${LABEL}`}>GitHub</label>
              <input
                id="a-github"
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-linkedin" className={`${LABEL}`}>LinkedIn</label>
              <input
                id="a-linkedin"
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className={`${FIELD}`}
              />
            </div>

            <div>
              <label htmlFor="a-twitter" className={`${LABEL}`}>Twitter</label>
              <input
                id="a-twitter"
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className={`${FIELD}`}
              />
            </div>
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

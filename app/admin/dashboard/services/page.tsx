'use client'

import { useCallback, useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'
import {
  BTN,
  BTN_DANGER,
  BTN_GHOST,
  FIELD,
  FIELD_MONO,
  LABEL,
  PAGE_TITLE,
  PANEL,
} from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import ListState from '@/components/admin/ListState'

interface Service {
  id: string
  title: string
  description: string
  icon?: string
  kind: string
  audience?: string | null
  deliverables?: string | null
  engagement?: string | null
  duration?: string | null
  order: number
}

const EMPTY = {
  title: '',
  description: '',
  icon: '',
  kind: 'service',
  audience: '',
  deliverables: '',
  engagement: '',
  duration: '',
  order: 0,
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchServices = useCallback(async () => {
    try {
      setServices(await apiRequest<Service[]>('/api/services'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load services'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const reset = () => {
    setFormData(EMPTY)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiRequest(editingId ? `/api/services/${editingId}` : '/api/services', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      })
      toast.success(editingId ? 'Service updated' : 'Service created')
      await fetchServices()
      reset()
    } catch (error) {
      // Surfaces the real reason — a duplicate title now says so (409) rather
      // than reporting success and silently saving nothing.
      toast.error(errorMessage(error, 'Could not save service'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await apiRequest(`/api/services/${id}`, { method: 'DELETE' })
      toast.success('Service deleted')
      if (editingId === id) reset()
      await fetchServices()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete service'))
    }
  }

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-2`}>Services</h1>
      <p className="mb-8 max-w-measure text-meta text-foreground-muted">
        These render under Engagements. Mark one as a process step to move it
        into the Process section instead. Everything below the description is
        optional and hidden on the site while blank.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className={`${PANEL} lg:sticky lg:top-8`}>
            <h2 className="mb-4 font-mono text-base font-medium">
              {editingId ? 'Edit service' : 'Add service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className={LABEL}>Title</label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="description" className={LABEL}>Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className={FIELD}
                />
                <div className="mt-2">
                  <VoiceRecorder
                    onTranscription={(text) => setFormData({ ...formData, description: text })}
                    enhance={true}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="kind" className={LABEL}>Shows in</label>
                <select
                  id="kind"
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  className={FIELD}
                >
                  <option value="service">Engagements</option>
                  <option value="process">Process</option>
                </select>
              </div>

              <div>
                <label htmlFor="audience" className={LABEL}>Who it&apos;s for</label>
                <input
                  id="audience"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="Founders with a working prototype"
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="deliverables" className={LABEL}>What they get</label>
                <textarea
                  id="deliverables"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  rows={3}
                  placeholder={'One per line:\nDeployed application\nRunbook and handover'}
                  className={FIELD}
                />
                <p className="mt-1 text-meta text-foreground-subtle">One per line</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="engagement" className={LABEL}>Engagement</label>
                  <input
                    id="engagement"
                    value={formData.engagement}
                    onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                    placeholder="Fixed scope"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="duration" className={LABEL}>Duration</label>
                  <input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="2–6 weeks"
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="order" className={LABEL}>Order</label>
                <input
                  id="order"
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) || 0 })
                  }
                  className={FIELD_MONO}
                />
              </div>

              <button type="submit" disabled={saving} className={`${BTN} w-full`}>
                {saving ? 'Saving…' : editingId ? 'Update service' : 'Add service'}
              </button>

              {editingId && (
                <button type="button" onClick={reset} className={`${BTN_GHOST} w-full`}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ListState
              loading={loading}
              count={services.length}
              empty="No services yet."
              consequence="The Services section on the homepage stays hidden until at least one exists."
            />
            {services.map((service) => (
              <div key={service.id} className={PANEL}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-mono text-base font-medium">{service.title}</h3>
                  {service.kind === 'process' && <span className="label">Process</span>}
                </div>

                <p className="mt-2 text-meta text-foreground-muted">{service.description}</p>

                {(service.engagement || service.duration) && (
                  <p className="mt-3 font-mono text-meta text-foreground-subtle">
                    {[service.engagement, service.duration].filter(Boolean).join('  ·  ')}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(service.id)
                      setFormData({
                        title: service.title,
                        description: service.description,
                        icon: service.icon ?? '',
                        kind: service.kind ?? 'service',
                        audience: service.audience ?? '',
                        deliverables: service.deliverables ?? '',
                        engagement: service.engagement ?? '',
                        duration: service.duration ?? '',
                        order: service.order,
                      })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`${BTN_GHOST} flex-1`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className={BTN_DANGER}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

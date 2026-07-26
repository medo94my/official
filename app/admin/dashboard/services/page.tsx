'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'

interface Service {
  id: string
  title: string
  description: string
  icon?: string
  order: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({ title: '', description: '', icon: '', order: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services'
      const method = editingId ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      toast.success(editingId ? 'Service updated!' : 'Service created!')
      fetchServices()
      setFormData({ title: '', description: '', icon: '', order: 0 })
      setEditingId(null)
    } catch (error) {
      toast.error('Failed to save service')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    toast.success('Service deleted!')
    fetchServices()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Services</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Edit' : 'Add'} Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Service title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <div>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <div className="mt-2">
                  <VoiceRecorder
                    onTranscription={(text) => setFormData({ ...formData, description: text })}
                    enhance={true}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Icon (emoji or class)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <input
                type="number"
                placeholder="Order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button type="submit" className="w-full px-6 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg">
                {editingId ? 'Update' : 'Add'} Service
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({ title: '', description: '', icon: '', order: 0 }) }}
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(service.id)
                      setFormData({
                        title: service.title,
                        description: service.description,
                        icon: service.icon ?? '',
                        order: service.order,
                      })
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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

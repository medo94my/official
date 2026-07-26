'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  description: string
  type: string
  image?: string
  githubUrl?: string
  liveUrl?: string
  tags: string[]
  specs?: string | null
  featured: boolean
  order: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Solo',
    image: '',
    githubUrl: '',
    liveUrl: '',
    tags: '',
    specs: '',
    featured: false,
    order: 0,
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
      const method = editingProject ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      toast.success(editingProject ? 'Project updated!' : 'Project created!')
      fetchProjects()
      resetForm()
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      toast.success('Project deleted!')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      type: project.type,
      image: project.image || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      tags: project.tags.join(', '),
      specs: project.specs ?? '',
      featured: project.featured,
      order: project.order,
    })
    setIsFormOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Solo',
      image: '',
      githubUrl: '',
      liveUrl: '',
      tags: '',
    specs: '',
      featured: false,
      order: 0,
    })
    setEditingProject(null)
    setIsFormOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
        >
          Add New Project
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            {project.featured && (
              <span className="inline-block px-3 py-1 bg-primary text-gray-900 text-xs font-semibold rounded-full mb-3">
                Featured
              </span>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(project)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              {/* p-2 -m-2 widens the touch target to 40px without changing the
                  visible icon size */}
              <button
                onClick={resetForm}
                aria-label="Close"
                className="p-2 -m-2 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                  <span className="text-gray-500 ml-2">(Use voice input below!)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <div className="mt-2">
                  <VoiceRecorder
                    onTranscription={(text) => setFormData({ ...formData, description: text })}
                    enhance={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Team">Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                <input
                  type="text"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Live URL</label>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specs — one &quot;Label: value&quot; per line
                </label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  rows={6}
                  placeholder={'Year: 2026\nRetry: exponential + jitter, 3 attempts\nDedup: name + lat/lon + host'}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Rendered as the spec grid on the project entry. Lines without a colon are
                  skipped. Leave empty to show none.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                  Featured Project
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
                >
                  {editingProject ? 'Update' : 'Create'} Project
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

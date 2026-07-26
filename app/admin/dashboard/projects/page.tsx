'use client'

import { useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, FIELD, FIELD_MONO, LABEL, PAGE_TITLE, PANEL } from '@/app/admin/ui'

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
        <h1 className={`${PAGE_TITLE}`}>Projects</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className={`${BTN}`}
        >
          Add New Project
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className={`${PANEL}`}>
            {project.featured && (
              <span className="label mb-3 inline-block border border-ink px-2 py-0.5 text-ink">
                Featured
              </span>
            )}
            <h3 className="font-mono text-base font-medium mb-2">{project.title}</h3>
            <p className="text-meta text-muted mb-4 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="font-mono text-meta text-muted">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(project)}
                className={`${BTN_GHOST} flex-1`}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className={`${BTN_DANGER}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="border border-rule bg-panel p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-lg font-semibold">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              {/* p-2 -m-2 widens the touch target to 40px without changing the
                  visible icon size */}
              <button
                onClick={resetForm}
                aria-label="Close"
                className="p-2 -m-2 text-muted hover:text-ink"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`${LABEL}`}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className={`${FIELD}`}
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
                  <label className={`${LABEL}`}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`${FIELD}`}
                  >
                    <option value="Solo">Solo</option>
                    <option value="Team">Team</option>
                  </select>
                </div>

                <div>
                  <label className={`${LABEL}`}>Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className={`${FIELD}`}
                  />
                </div>
              </div>

              <div>
                <label className={`${LABEL}`}>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>GitHub URL</label>
                <input
                  type="text"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>Live URL</label>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>
                  Specs — one &quot;Label: value&quot; per line
                </label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  rows={6}
                  placeholder={'Year: 2026\nRetry: exponential + jitter, 3 attempts\nDedup: name + lat/lon + host'}
                  className={`${FIELD_MONO}`}
                />
                <p className="mt-1 text-meta text-muted">
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
                  className="w-4 h-4 text-ink bg-shelf border-rule rounded focus:"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-ink">
                  Featured Project
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 ${BTN}`}
                >
                  {editingProject ? 'Update' : 'Create'} Project
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-shelf hover:bg-rule text-ink font-medium  transition"
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

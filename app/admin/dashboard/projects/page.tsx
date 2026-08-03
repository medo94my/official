'use client'

import { useCallback, useEffect, useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import toast from 'react-hot-toast'
import { BTN, BTN_DANGER, BTN_GHOST, CHECKBOX, FIELD, FIELD_MONO, LABEL, PAGE_TITLE, PANEL } from '@/app/admin/ui'
import { apiRequest, errorMessage } from '@/app/admin/client'
import ListState from '@/components/admin/ListState'
import { GithubCompare, GithubRepoPicker } from '@/components/admin/GithubImport'
import { CaseStudyDraft } from '@/components/admin/CaseStudyDraft'
import MediaManager, { type MediaItem } from '@/components/admin/MediaManager'
import Modal from '@/components/ui/Modal'
import { repoPrefill, type FieldDiff, type RepoSummary } from '@/lib/repo-import'
import { slugify } from '@/lib/slug'

/** The thirteen case-study fields, in the order they render on the detail page. */
const CASE_STUDY_FIELDS = [
  { key: 'problem', label: 'Problem', rows: 4, hint: 'What was actually wrong before this existed.' },
  { key: 'audience', label: "Who it's for", rows: 2, hint: '' },
  { key: 'context', label: 'Context', rows: 3, hint: 'Where it sits, what it replaced.' },
  { key: 'constraints', label: 'Constraints', rows: 3, hint: 'One per line.' },
  { key: 'myRole', label: 'My role', rows: 2, hint: '' },
  { key: 'responsibilities', label: 'Responsibilities', rows: 3, hint: 'One per line.' },
  { key: 'approach', label: 'Approach', rows: 4, hint: '' },
  { key: 'keyDecisions', label: 'Key decisions', rows: 4, hint: '"Decision: rationale", one per line.' },
  { key: 'challenges', label: 'Challenges', rows: 3, hint: 'One per line.' },
  { key: 'tradeoffs', label: 'Trade-offs', rows: 3, hint: '"Gained: …" / "Gave up: …", one per line.' },
  { key: 'outcome', label: 'Outcome', rows: 3, hint: 'Only what you can stand behind.' },
  { key: 'lessons', label: 'Lessons', rows: 3, hint: 'One per line.' },
] as const

interface Project {
  id: string
  title: string
  slug: string
  description: string
  type: string
  image?: string
  githubUrl?: string
  liveUrl?: string
  tags: string[]
  specs?: string | null
  featured: boolean
  order: number
  status?: string | null
  caseStudyUrl?: string | null
  media?: MediaItem[]
  problem?: string | null
  audience?: string | null
  context?: string | null
  constraints?: string | null
  myRole?: string | null
  responsibilities?: string | null
  approach?: string | null
  keyDecisions?: string | null
  challenges?: string | null
  tradeoffs?: string | null
  outcome?: string | null
  lessons?: string | null
}

const EMPTY = {
  title: '',
  slug: '',
  description: '',
  type: 'Solo',
  image: '',
  githubUrl: '',
  liveUrl: '',
  tags: '',
  specs: '',
  featured: false,
  order: 0,
  status: '',
  caseStudyUrl: '',
  problem: '',
  audience: '',
  context: '',
  constraints: '',
  myRole: '',
  responsibilities: '',
  approach: '',
  keyDecisions: '',
  challenges: '',
  tradeoffs: '',
  outcome: '',
  lessons: '',
}

type FormData = typeof EMPTY

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [caseStudyOpen, setCaseStudyOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>(EMPTY)
  const [pickerOpen, setPickerOpen] = useState(false)
  /** Shown above the title so the review-before-save contract is visible. */
  const [prefillSource, setPrefillSource] = useState<string | null>(null)
  // Media lives outside formData: it is saved the moment it is uploaded, so
  // carrying it through the form's submit payload would be a second, and
  // conflicting, source of truth.
  const [media, setMedia] = useState<MediaItem[]>([])

  const fetchProjects = useCallback(async () => {
    try {
      setProjects(await apiRequest<Project[]>('/api/projects'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not load projects'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      // Falls back to the title so a new project always gets a URL.
      slug: slugify(formData.slug || formData.title),
    }

    try {
      await apiRequest(
        editingProject ? `/api/projects/${editingProject.id}` : '/api/projects',
        { method: editingProject ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      )
      toast.success(editingProject ? 'Project updated' : 'Project created')
      await fetchProjects()
      resetForm()
    } catch (error) {
      // A duplicate title or slug now reports itself as a 409 rather than
      // vanishing behind a generic failure.
      toast.error(errorMessage(error, 'Could not save project'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return

    try {
      await apiRequest(`/api/projects/${id}`, { method: 'DELETE' })
      toast.success('Project deleted')
      await fetchProjects()
    } catch (error) {
      toast.error(errorMessage(error, 'Could not delete project'))
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setMedia(project.media ?? [])
    setFormData({
      title: project.title,
      slug: project.slug ?? '',
      description: project.description,
      type: project.type,
      image: project.image || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      tags: project.tags.join(', '),
      specs: project.specs ?? '',
      featured: project.featured,
      order: project.order,
      status: project.status ?? '',
      caseStudyUrl: project.caseStudyUrl ?? '',
      problem: project.problem ?? '',
      audience: project.audience ?? '',
      context: project.context ?? '',
      constraints: project.constraints ?? '',
      myRole: project.myRole ?? '',
      responsibilities: project.responsibilities ?? '',
      approach: project.approach ?? '',
      keyDecisions: project.keyDecisions ?? '',
      challenges: project.challenges ?? '',
      tradeoffs: project.tradeoffs ?? '',
      outcome: project.outcome ?? '',
      lessons: project.lessons ?? '',
    })
    // Open the case-study section straight away if it already has content, so
    // an edit does not hide what is there.
    setCaseStudyOpen(
      CASE_STUDY_FIELDS.some((f) => Boolean(project[f.key as keyof Project]))
    )
    setIsFormOpen(true)
  }

  const resetForm = () => {
    setFormData(EMPTY)
    setMedia([])
    setEditingProject(null)
    setPrefillSource(null)
    setCaseStudyOpen(false)
    setIsFormOpen(false)
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className={`${PAGE_TITLE}`}>Projects</h1>
        {/* Hidden while the form is open, which is the whole guard against
            overwriting a half-typed project: the picker is unreachable from
            inside the form, so there is never a dirty form to clobber. */}
        {!isFormOpen && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsFormOpen(true)} className={`${BTN}`}>
              Add New Project
            </button>
            <button onClick={() => setPickerOpen(true)} className={BTN_GHOST}>
              Import from GitHub
            </button>
          </div>
        )}
      </div>

      <GithubRepoPicker
        open={pickerOpen}
        projects={projects}
        onClose={() => setPickerOpen(false)}
        onSelect={(repo: RepoSummary) => {
          // Spread over EMPTY, not over the current form: importing is starting
          // a new project, and leftovers from a previous edit would be silently
          // carried in.
          setFormData({ ...EMPTY, ...repoPrefill(repo) })
          setEditingProject(null)
          setCaseStudyOpen(false)
          setPrefillSource(repo.fullName)
          setPickerOpen(false)
          setIsFormOpen(true)
        }}
        onEditExisting={(projectId: string) => {
          const project = projects.find((p) => p.id === projectId)
          if (!project) return
          setPickerOpen(false)
          handleEdit(project)
        }}
      />

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListState
          loading={loading}
          count={projects.length}
          empty="No projects yet."
          consequence="The Selected work section on the homepage stays hidden until at least one exists."
        />
        {projects.map((project) => (
          <div key={project.id} className={`${PANEL}`}>
            {project.featured && (
              <span className="label mb-3 inline-block border border-foreground px-2 py-0.5 text-foreground">
                Featured
              </span>
            )}
            <h3 className="font-mono text-base font-medium mb-2">{project.title}</h3>
            <p className="text-meta text-foreground-muted mb-4 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="font-mono text-meta text-foreground-muted">
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
                onClick={() => handleDelete(project.id, project.title)}
                className={`${BTN_DANGER}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Was a bare `fixed inset-0` div: no role, no name, no Escape, and Tab
          walked straight out into the list behind it. Modal supplies all four. */}
      <Modal
        open={isFormOpen}
        onClose={resetForm}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
            <form onSubmit={handleSubmit} className="space-y-4">
          {prefillSource && (
            <p className="border-l-2 border-accent bg-background-subtle px-3 py-2 text-meta text-foreground-muted">
              Prefilled from{' '}
              <span className="font-mono text-foreground">github.com/{prefillSource}</span>. Nothing
              is saved until you press Create.
            </p>
          )}
              <div>
                <label htmlFor="p-title" className={`${LABEL}`}>Title</label>
                <input
                  id="p-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => set('title', e.target.value)}
                  required
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label htmlFor="p-slug" className={`${LABEL}`}>URL slug</label>
                <input
                  id="p-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  // Only normalise on blur: doing it per keystroke eats the
                  // hyphen the moment you type it.
                  onBlur={(e) => set('slug', slugify(e.target.value))}
                  placeholder={formData.title ? slugify(formData.title) : 'derived-from-title'}
                  className={`${FIELD_MONO}`}
                />
                <p className="mt-1 text-meta text-foreground-muted">
                  /projects/{formData.slug || slugify(formData.title) || '…'} — leave blank
                  to derive from the title.{' '}
                  {editingProject && 'Changing this changes the project’s URL.'}
                </p>
              </div>

              <div>
                <label htmlFor="p-description" className={`${LABEL}`}>
                  Description
                </label>
                <textarea
                  id="p-description"
                  value={formData.description}
                  onChange={(e) => set('description', e.target.value)}
                  required
                  rows={4}
                  className={`${FIELD}`}
                />
                <div className="mt-2">
                  <VoiceRecorder
                    onTranscription={(text) => set('description', text)}
                    enhance={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${LABEL}`}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => set('type', e.target.value)}
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
                    onChange={(e) => set('order', Number(e.target.value) || 0)}
                    className={`${FIELD}`}
                  />
                </div>
              </div>

              <div>
                <label className={`${LABEL}`}>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => set('image', e.target.value)}
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>GitHub URL</label>
                <input
                  type="text"
                  value={formData.githubUrl}
                  onChange={(e) => set('githubUrl', e.target.value)}
                  className={`${FIELD}`}
                />
              </div>

              <div>
                <label className={`${LABEL}`}>Live URL</label>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => set('liveUrl', e.target.value)}
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
                  onChange={(e) => set('tags', e.target.value)}
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
                  onChange={(e) => set('specs', e.target.value)}
                  rows={6}
                  placeholder={'Year: 2026\nRetry: exponential + jitter, 3 attempts\nDedup: name + lat/lon + host'}
                  className={`${FIELD_MONO}`}
                />
                <p className="mt-1 text-meta text-foreground-muted">
                  Rendered as the spec grid on the project entry. Lines without a colon are
                  skipped. Leave empty to show none.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  className={CHECKBOX}
                />
                <label htmlFor="featured" className="ml-2 text-sm text-foreground">
                  Featured Project
                </label>
              </div>

              {/* ── Case study ──────────────────────────────────────────
                  Collapsed by default. Thirteen more textareas would bury the
                  fields you edit most; every one is optional, and the detail
                  page hides any block left blank. */}
              <div className="border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setCaseStudyOpen((open) => !open)}
                  aria-expanded={caseStudyOpen}
                  aria-controls="case-study-fields"
                  className="flex w-full items-center justify-between gap-4 py-2 text-left"
                >
                  <span className="font-mono text-meta font-medium text-foreground">
                    Case study
                    <span className="ml-2 text-foreground-subtle">
                      {CASE_STUDY_FIELDS.filter(
                        (f) => formData[f.key as keyof FormData]
                      ).length}
                      /{CASE_STUDY_FIELDS.length} filled
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-foreground-muted">
                    {caseStudyOpen ? '−' : '+'}
                  </span>
                </button>

                {caseStudyOpen && (
                  <div id="case-study-fields" className="mt-3 space-y-4">
                    <p className="text-meta text-foreground-muted">
                      All optional. Fill any of these and the project gets a
                      &ldquo;Read the case study&rdquo; link; leave them blank and it
                      behaves exactly as it does now.
                    </p>

                    {/* Inside the section it fills, not beside it: the drafter
                        writes five of these fields, and the seven it refuses are
                        on screen while it says so. */}
                    {formData.githubUrl && (
                      <CaseStudyDraft
                        githubUrl={formData.githubUrl}
                        current={formData as unknown as Record<string, string>}
                        onApply={(field, value) => set(field as keyof FormData, value as never)}
                      />
                    )}

                    {CASE_STUDY_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label htmlFor={`p-${field.key}`} className={LABEL}>
                          {field.label}
                        </label>
                        <textarea
                          id={`p-${field.key}`}
                          value={formData[field.key as keyof FormData] as string}
                          onChange={(e) =>
                            set(field.key as keyof FormData, e.target.value as never)
                          }
                          rows={field.rows}
                          className={FIELD}
                        />
                        {field.hint && (
                          <p className="mt-1 text-meta text-foreground-subtle">{field.hint}</p>
                        )}
                      </div>
                    ))}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="p-status" className={LABEL}>Status</label>
                        <input
                          id="p-status"
                          type="text"
                          value={formData.status}
                          onChange={(e) => set('status', e.target.value)}
                          placeholder="In production"
                          className={FIELD}
                        />
                      </div>
                      <div>
                        <label htmlFor="p-caseStudyUrl" className={LABEL}>
                          External write-up
                        </label>
                        <input
                          id="p-caseStudyUrl"
                          type="url"
                          value={formData.caseStudyUrl}
                          onChange={(e) => set('caseStudyUrl', e.target.value)}
                          placeholder="https://"
                          className={FIELD_MONO}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Only when editing something already saved that is linked to a
                  repository. Nothing here writes: each row is applied to the
                  form and still needs Update. */}
              {editingProject && formData.githubUrl && (
                <GithubCompare
                  githubUrl={formData.githubUrl}
                  current={{
                    description: formData.description,
                    githubUrl: formData.githubUrl,
                    liveUrl: formData.liveUrl,
                    tags: formData.tags,
                  }}
                  onApply={(diff: FieldDiff) => set(diff.field, diff.incoming)}
                />
              )}

              {/* Editing only: a file has to belong to something, and the slug
                  is what names it on disk. Unlike the rest of this form these
                  actions take effect immediately — the server names the file
                  and returns its URL, so there is nothing to defer to Update. */}
              {editingProject ? (
                <MediaManager
                  projectId={editingProject.id}
                  items={media}
                  onChange={setMedia}
                />
              ) : (
                <p className="border-t border-border pt-4 text-meta text-foreground-subtle">
                  Screenshots and clips can be added once the project is created.
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={saving} className={`flex-1 ${BTN}`}>
                  {saving
                    ? 'Saving…'
                    : `${editingProject ? 'Update' : 'Create'} Project`}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={BTN_GHOST}
                >
                  Cancel
                </button>
              </div>
            </form>
      </Modal>
    </div>
  )
}

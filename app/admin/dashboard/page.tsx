'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BTN, PAGE_TITLE, PANEL } from '@/app/admin/ui'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    services: 0,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/skills').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([projects, skills, services]) => {
      setStats({
        projects: projects.length || 0,
        skills: skills.length || 0,
        services: services.length || 0,
      })
    })
  }, [])

  return (
    <div>
      <h1 className={`${PAGE_TITLE} mb-8`}>Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${PANEL}`}>
          <h3 className="text-meta text-foreground-muted font-medium mb-2">Projects</h3>
          <p className="text-4xl font-bold text-foreground">{stats.projects}</p>
          <Link href="/admin/dashboard/projects" className="mt-4 inline-block text-small text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">
            Manage →
          </Link>
        </div>

        <div className={`${PANEL}`}>
          <h3 className="text-meta text-foreground-muted font-medium mb-2">Skills</h3>
          <p className="text-4xl font-bold text-foreground">{stats.skills}</p>
          <Link href="/admin/dashboard/skills" className="mt-4 inline-block text-small text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">
            Manage →
          </Link>
        </div>

        <div className={`${PANEL}`}>
          <h3 className="text-meta text-foreground-muted font-medium mb-2">Services</h3>
          <p className="text-4xl font-bold text-foreground">{stats.services}</p>
          <Link href="/admin/dashboard/services" className="mt-4 inline-block text-small text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">
            Manage →
          </Link>
        </div>
      </div>

      <div className={`${PANEL}`}>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/projects"
            className={BTN}
          >
            Add New Project
          </Link>
          <Link
            href="/admin/dashboard/about"
            className="px-4 py-3 bg-background-subtle hover:bg-border text-foreground font-medium  transition text-center"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Projects</h3>
          <p className="text-4xl font-bold text-white">{stats.projects}</p>
          <Link href="/admin/dashboard/projects" className="text-primary hover:text-yellow-400 text-sm mt-4 inline-block">
            Manage →
          </Link>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Skills</h3>
          <p className="text-4xl font-bold text-white">{stats.skills}</p>
          <Link href="/admin/dashboard/skills" className="text-primary hover:text-yellow-400 text-sm mt-4 inline-block">
            Manage →
          </Link>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Services</h3>
          <p className="text-4xl font-bold text-white">{stats.services}</p>
          <Link href="/admin/dashboard/services" className="text-primary hover:text-yellow-400 text-sm mt-4 inline-block">
            Manage →
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/projects"
            className="px-4 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition text-center"
          >
            Add New Project
          </Link>
          <Link
            href="/admin/dashboard/about"
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-center"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

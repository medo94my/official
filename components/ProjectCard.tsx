'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Nullable rather than optional: these come straight from Prisma, which
// returns null for unset columns.
interface ProjectCardProps {
  title: string
  description: string
  type: string
  tags: string[]
  githubUrl?: string | null
  liveUrl?: string | null
  image?: string | null
  featured?: boolean
  index: number
}

export default function ProjectCard({ title, description, type, tags, githubUrl, liveUrl, image, featured, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 h-full hover:border-primary transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
        {/* Featured Badge — driven by the `featured` column; `type` only ever
            holds "Solo"/"Team", so the old `type === 'Featured'` check never
            rendered. */}
        {featured && (
          <div className="absolute -top-3 -right-3 bg-primary text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
            Featured
          </div>
        )}

        {/* Image */}
        {image && (
          <div className="relative mb-4 rounded-xl overflow-hidden h-48 bg-gray-700">
            <Image
              src={image}
              alt={`Screenshot of ${title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              unoptimized={image.endsWith('.gif')}
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <span className="px-2 py-1 bg-gray-700 text-primary text-xs rounded">{type}</span>
        </div>

        <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {githubUrl && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Code
            </motion.a>
          )}
          {liveUrl && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live
            </motion.a>
          )}
        </div>

        {/* Hover Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 rounded-2xl pointer-events-none transition-opacity duration-300"
        />
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'

type SkillBarProps = {
  name: string
  icon?: string | null
  level: number
}

export default function SkillBar({ name, icon, level }: SkillBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">
          {icon} {name}
        </span>
        <span className="text-gray-400 text-sm">{level}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-gradient-to-r from-primary to-yellow-300 h-2 rounded-full"
        />
      </div>
    </div>
  )
}

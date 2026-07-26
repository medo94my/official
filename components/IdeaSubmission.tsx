'use client'

import { useRef, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_IDEA_TEMPLATE_ID ||
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function IdeaSubmission() {
  const [status, setStatus] = useState<Status>('idle')
  const [projectType, setProjectType] = useState('web')
  const form = useRef<HTMLFormElement>(null)

  // Nothing renders without credentials — a form that discards submissions is
  // worse than no form.
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current) return

    setStatus('sending')
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
      setStatus('success')
      form.current.reset()
      setProjectType('web')
    } catch (error) {
      console.error('Idea submission failed:', error)
      setStatus('error')
    }
  }

  return (
    <section className="py-20 bg-[#1a1a1a] text-white" id="idea">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-2 text-primary">
          From Idea to Production
        </h2>
        <p className="text-center text-gray-400 mb-10 text-lg">
          Have an app idea? Let&apos;s build it together.
        </p>

        <form ref={form} onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              name="user_name"
              placeholder="Your Name"
              aria-label="Your name"
              required
              className="bg-white text-black border-none"
            />
            <Input
              name="user_email"
              type="email"
              placeholder="Email Address"
              aria-label="Your email address"
              required
              className="bg-white text-black border-none"
            />
          </div>

          {/* Radix Select is not a native input, so the value is mirrored into a
              hidden field for EmailJS's form serialisation. */}
          <input type="hidden" name="project_type" value={projectType} />

          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="w-full bg-white text-black border-none h-10" aria-label="Project type">
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Web Application</SelectItem>
              <SelectItem value="mobile">Mobile App</SelectItem>
              <SelectItem value="ecommerce">E-Commerce</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-1">
            <Textarea
              name="message"
              placeholder="Describe your idea"
              aria-label="Describe your idea"
              rows={6}
              required
              className="bg-white text-black border-none"
            />
            <p className="text-xs text-gray-400 pl-1">
              Tell me about the core features and the problem it solves.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={status === 'sending'}
            className="bg-primary text-black hover:bg-yellow-500 transition-transform w-full md:w-auto text-lg py-6"
          >
            <Lightbulb className="mr-2 h-5 w-5" aria-hidden="true" />
            {status === 'sending' ? 'Submitting…' : 'Submit Your Idea'}
          </Button>

          <div aria-live="polite">
            {status === 'success' && (
              <p className="p-4 bg-green-900/50 text-green-200 border border-green-800 rounded">
                Idea submitted — I&apos;ll review it and get back to you shortly.
              </p>
            )}
            {status === 'error' && (
              <p className="p-4 bg-red-900/50 text-red-200 border border-red-800 rounded">
                Failed to submit. Please try again, or email me directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

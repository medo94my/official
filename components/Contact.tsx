'use client'

import { useRef, useState } from 'react'
import { Send, MapPin, Mail } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

type ContactProps = {
  email?: string | null
  location?: string | null
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact({ email, location }: ContactProps) {
  const [status, setStatus] = useState<Status>('idle')
  const form = useRef<HTMLFormElement>(null)

  const configured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current || !configured) return

    setStatus('sending')
    try {
      await emailjs.sendForm(SERVICE_ID!, TEMPLATE_ID!, form.current, PUBLIC_KEY!)
      setStatus('success')
      form.current.reset()
    } catch (error) {
      // The original faked a success state when EmailJS was unconfigured,
      // which silently dropped every message. Report the failure instead.
      console.error('Contact form failed to send:', error)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 w-full bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl font-bold text-white uppercase tracking-widest mb-4">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-gray-400 max-w-lg text-center">
            Have a project in mind or just want to say hello? I&apos;d love to hear from you.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            {configured ? (
              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="user_name" className="text-sm font-medium text-gray-400">
                      Name
                    </label>
                    <Input
                      id="user_name"
                      name="user_name"
                      placeholder="John Doe"
                      required
                      className="bg-[#111] border-gray-800 focus:border-primary text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="user_email" className="text-sm font-medium text-gray-400">
                      Email
                    </label>
                    <Input
                      id="user_email"
                      name="user_email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="bg-[#111] border-gray-800 focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-400">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message here..."
                    rows={6}
                    required
                    className="bg-[#111] border-gray-800 focus:border-primary text-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'sending'}
                  className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider py-6"
                >
                  {status === 'sending' ? (
                    'Sending…'
                  ) : (
                    <span className="flex items-center">
                      Send Message <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </Button>

                <p aria-live="polite" className="text-center mt-2">
                  {status === 'success' && (
                    <span className="text-green-500">Message sent — I&apos;ll get back to you.</span>
                  )}
                  {status === 'error' && (
                    <span className="text-red-500">
                      Couldn&apos;t send that. Email me directly at{' '}
                      <a className="underline" href={`mailto:${email}`}>
                        {email}
                      </a>
                      .
                    </span>
                  )}
                </p>
              </form>
            ) : (
              // No EmailJS credentials: a mailto link that works beats a form
              // that looks like it works and drops the message.
              <div className="h-full flex flex-col justify-center gap-4">
                <p className="text-gray-400">The quickest way to reach me is email.</p>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider py-4 px-6 rounded-md transition-colors"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-0 bg-[#111]">
            <div className="absolute bottom-8 left-8 right-8 bg-black/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="flex flex-col gap-4">
                {location && (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-full text-primary">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-white font-medium">{location}</p>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-full text-primary">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${email}`}
                        className="text-white font-medium truncate block hover:text-primary transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

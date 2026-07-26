'use client'

import { MessageCircle } from 'lucide-react'

// Digits only, no '+' or spaces — wa.me rejects anything else.
const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
const MESSAGE = "Hello! I saw your portfolio and would like to discuss a project."

export default function WhatsAppButton() {
  // Renders nothing rather than linking to wa.me/undefined when unconfigured.
  if (!PHONE) return null

  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg transition-colors flex items-center justify-center h-14 w-14"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  )
}

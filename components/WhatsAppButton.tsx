import { MessageCircle } from 'lucide-react'

const MESSAGE = "Hello! I saw your portfolio and would like to discuss a project."

/**
 * Server component — the number comes from the About record, so it is editable
 * in the dashboard rather than baked into the client bundle at build time.
 *
 * Renders nothing when unset: a link to wa.me/undefined is worse than no button.
 */
export default function WhatsAppButton({ number }: { number?: string | null }) {
  // wa.me wants bare digits. Accepting "+90 555 000 0000" in the dashboard and
  // normalising here beats making the owner remember the wire format.
  const digits = number?.replace(/\D/g, '')
  if (!digits) return null

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(MESSAGE)}`

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

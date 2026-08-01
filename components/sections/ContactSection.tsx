import ContactForm from '@/components/ContactForm'
import Reveal from '@/components/motion/Reveal'
import SectionHead from '@/components/SectionHead'
import Section from '@/components/ui/Section'

/** One direct contact route. External links get rel and a ↗ affordance. */
function Direct({
  label,
  href,
  value,
  external,
}: {
  label: string
  href: string
  value: string
  external?: boolean
}) {
  return (
    <div className="border-b border-border py-2 last:border-b-0">
      <dt className="label">{label}</dt>
      <dd>
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="inline-flex min-h-11 items-center gap-1.5 font-mono text-meta text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          {value}
          {external && (
            <span aria-hidden="true" className="text-foreground-subtle">↗</span>
          )}
        </a>
      </dd>
    </div>
  )
}

type ContactSectionProps = {
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  location?: string | null
  github?: string | null
  linkedin?: string | null
}

/**
 * Every way to reach him, none of them behind a form.
 *
 * The form lands in the next phase, but the direct routes are not waiting for
 * it and will not be hidden once it exists. Some visitors will not fill in a
 * form, and a recruiter with a role to fill wants an address they can paste
 * into their own client.
 *
 * `phone` in particular has been stored, editable and unrendered since the
 * record was created — a whole contact method the site was silently dropping.
 */
export default function ContactSection({
  email,
  phone,
  whatsapp,
  location,
  github,
  linkedin,
}: ContactSectionProps) {
  const digits = whatsapp?.replace(/\D/g, '')

  // Nothing to show at all — better absent than an empty heading.
  if (!email && !phone && !digits && !github && !linkedin) return null

  return (
    <Section id="contact">
      <SectionHead
        title="Contact"
        eyebrow={location ? `Based in ${location}` : 'Get in touch'}
      />

      <Reveal>
        <p className="max-w-measure text-body-lg text-foreground/85">
          Hiring, or have something you need built? Either is welcome — say which
          and roughly what you have in mind, and I&apos;ll come back to you.
        </p>
      </Reveal>

      <div className="mt-9 grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_16rem]">
        {/* The form is behind a reveal, the direct routes deliberately are not.
            A reveal renders its subject at opacity 0 until Motion runs, so
            anything inside it is invisible if the JS fails. The form already
            needs JS to submit, so it loses nothing; an email address does not,
            and hiding the one contact method that works without scripting to
            gain a fade would be a bad trade. */}
        <Reveal index={1}>
          <ContactForm email={email} />
        </Reveal>

        {/* Direct routes sit beside the form, never behind it. Some people
            will not fill in a form, and losing those is losing the point. */}
        <div className="lg:pt-1">
          <h3 className="label">Or reach me directly</h3>
          <dl className="mt-3">
            {email && (
              <Direct label="Email" href={`mailto:${email}`} value={email} />
            )}
            {phone && (
              <Direct
                label="Phone"
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                value={phone}
              />
            )}
            {digits && (
              <Direct label="WhatsApp" href={`https://wa.me/${digits}`} value="Message me" external />
            )}
            {linkedin && <Direct label="LinkedIn" href={linkedin} value="Profile" external />}
            {github && <Direct label="GitHub" href={github} value="Repositories" external />}
          </dl>
        </div>
      </div>
    </Section>
  )
}

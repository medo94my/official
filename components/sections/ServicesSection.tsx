import SectionHead from '@/components/SectionHead'
import ServiceCard from '@/components/ServiceCard'
import Section from '@/components/ui/Section'
import StaggeredList from '@/components/motion/StaggeredList'

type Service = {
  id: string
  title: string
  description: string
  audience?: string | null
  deliverables?: string | null
  engagement?: string | null
  duration?: string | null
}

export default function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null

  return (
    <Section id="services">
      <SectionHead title="Engagements" eyebrow="How I work" />
      <StaggeredList as="ol" itemAs="li">
        {services.map((service, i) => (
          <ServiceCard key={service.id} index={i} {...service} />
        ))}
      </StaggeredList>
    </Section>
  )
}

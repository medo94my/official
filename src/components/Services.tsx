import React from 'react'
import CardInfo from './CardInfo'
import Section from './Section'

const Services = ({ services }) => {
  return (
    <Section title="Services" secId="services" styles={{}}>
      <div className="flex flex-wrap justify-center w-full">
        {services.map((item) => (
          <CardInfo key={item.id} item={item} />
        ))}
      </div>
    </Section>
  )
}

export default Services

import React from 'react'
import CardInfo from './CardInfo'
import Section from './Section'
import {service} from '../data'

const Services = () => {
  return (
          <Section title={'Services'} secId={'services'}>
              {service.map(item=>(
              <CardInfo key={item.id} className='arrow' item={item}  />
  
              ))}
          </Section>

  )
}

export default Services
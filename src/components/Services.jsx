import React, { useEffect, useState } from 'react'
import CardInfo from './CardInfo'
import Section from './Section'
import { getServices } from '../services/contentful'

const Services = () => {
  const [service, setService] = useState([]);

  useEffect(() => {
    getServices().then(setService);
  }, []);

  return (
          <Section title={'Services'} secId={'services'}>
              {service.map(item=>(
              <CardInfo key={item.id} className='arrow' item={item}  />
  
              ))}
          </Section>

  )
}

export default Services
import React, { useEffect, useState } from 'react'
import CardInfo from './CardInfo'
import { getServices } from '../services/strapi'

const Services = () => {
  const [service, setService] = useState([]);

  useEffect(() => {
    getServices().then(setService);
  }, []);

  return (
    <section id="services" className="py-24 w-full bg-black">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-4xl font-bold mb-16 text-white uppercase tracking-widest">
                My <span className="text-primary">Services</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {service.map(item=>(
                    <CardInfo key={item.id} item={item} />
                ))}
            </div>
        </div>
    </section>
  )
}

export default Services
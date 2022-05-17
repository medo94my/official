import styled from '@emotion/styled'
import { DesignServices, Search, Web } from '@mui/icons-material'
import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import React from 'react'
import CardInfo from './CardInfo'
import Section from './Section'
import { WaterMark } from './utils'


const data=[
  {
    id:1,
    img:<Search sx={{display:'block',width:'128px',height:'128px',mx:'auto', p:2}} />,
    desc:'Planning'
  },
  {
    id:2,
    img:<DesignServices sx={{display:'block',width:'128px',height:'128px',mx:'auto', p:2}} />,
    desc:'UI/UX'
  },
  {
    id:3,
    img:<Web sx={{display:'block',width:'128px',height:'128px',mx:'auto', p:2}} />,
    desc:'Writing Code'
  },
]
const Services = () => {
  return (
          <Section title={'Services'}>
              {data.map(item=>(
              <CardInfo key={item.id} className='arrow' item={item}  />
  
              ))}
          </Section>

  )
}

export default Services
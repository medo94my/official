import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import React from 'react'
import CardInfo from './CardInfo'
import { WaterMark } from './utils'


const data=[
  {
    id:1,
    img:'src/img/custom.svg',
    desc:'Planning the most suitable technology that is needed for the desired application'
  },
  {
    id:2,
    img:'src/img/custom.svg',
    desc:'Begin to design the interface and implement the required styles'
  },
  {
    id:3,
    img:'src/img/custom.svg',
    desc:'Planning the most suitable technology that is needed for the desired application'
  },
]
const Services = () => {
  return (
    <Grid container sx={{pr:'2rem'}} >
        <Grid item sm={1} position={'relative'} display={{xs:'none',sm:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1'fontSize={{xs:'48px',sm:'96px'}} >services</WaterMark> 
        </Grid>
        
        <Grid item xs={12}  sm={10}>
          <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold'}}> Services</Typography>

          <Grid item container justifyContent='center' alignItems='center' >
              {data.map(item=>(
            <Grid key={item.id} item xs={12} sm={4} container justifyContent='center' alignItems='center'>
              <CardInfo item={item}  />
            </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
  )
}

export default Services
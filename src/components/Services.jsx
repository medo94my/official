import { DesignServices, Search, Web } from '@mui/icons-material'
import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import React from 'react'
import CardInfo from './CardInfo'
import { WaterMark } from './utils'


const data=[
  {
    id:1,
    img:<Search sx={{display:'block',width:'128px',height:'128px',mx:'auto', p:2}} />,
    desc:'Researching & Planning'
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
    <Grid container>
        <Grid item sm={1} position={'relative'} display={{xs:'none',lg:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1' fontSize={{xs:'48px',md:'96px'}} >services</WaterMark> 
        </Grid>
        
        <Grid item container justifyContent={'center'} alignItems={'center'} xs={12}  lg={10}>
          <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold',marginY:5}}> Services</Typography>

          <Grid item container justifyContent='center' alignItems='center' sx={{p:4}} >
              {data.map(item=>(
            <Grid key={item.id} item sx={{p:3}}  xs={12} sm={4} container justifyContent='center' alignItems='center'>
              <CardInfo item={item}  />
            </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
  )
}

export default Services
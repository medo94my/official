import {  Container, Grid,  Typography ,Stack} from '@mui/material'
import React from 'react'
import ComplexGrid from './ComplexGrid'
import { WaterMark } from './utils'

const data=[
  {
    id:1,
    icon:'src/img/web-design.png',
    title:'Frontend',
    langs:['HTML','CSS3','JavaScript']
  },
  {
    id:2,
    icon:'src/img/web-programming.png',
    title:'Backend',
    langs:['Python','PHP','Nodejs']
  },
  {
    id:3,
    icon:'src/img/web.png',
    title:'Framework',
    langs:['Flask','Laravel','Express']
  },
  {
    id:4,
    icon:'src/img/web-page.png',
    title:'Databases',
    langs:['MYSQL','MONGODB']
  },
]

const Skills = () => {
  return (
    <Grid container positioin={'relative'}>

    <Grid item sm={1} position={'relative'} display={{xs:'none',lg:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1'fontSize={{xs:'48px',sm:'96px'}} >skills</WaterMark> 
        </Grid>

        
        <Grid container justifyContent={'center'}  alignItems={'center'} xs={12} lg={10} item>          
          <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold',marginY:5}}>skills</Typography>
          <Grid container sx={{py:'4rem'}} justifyContent='center' alignItems='center'>
            {data.map(item=>(
            <ComplexGrid  key={item.id} item={item}/>
            ))}
            
          </Grid>
        </Grid>
      </Grid>
  )
}

export default Skills
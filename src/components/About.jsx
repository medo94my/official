import { Email, GitHub, Home, LinkedIn, Twitter, WhatsApp } from '@mui/icons-material'
import { Box, Grid, IconButton, Link, Stack, Typography } from '@mui/material'
import React from 'react'
import { WaterMark } from './utils'
import about from "/src/img/about.svg"

const About = () => {
  return (
    <Grid container >
            {/* <Grid item sm={1} position={'relative'} display={{xs:'none',lg:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1' fontSize={{xs:'48px',md:'96px'}} >About</WaterMark> 
        </Grid> */}
        <Grid item container xs={12} justifyContent={'center'} alignItems={'center'} lg={12}>
              <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold',marginY:5}}> About</Typography>
                       <Grid item container sx={{p:3,alignItems:'center',justifyContent:'center'}}>
                        <Grid  item xs={12} lg={8} sx={{width:'100%'}} px={{xs:2,md:10}}>
                          <Typography variant='h1' fontSize={{xs:39,sm:72,md:96}} textAlign={{xs:'center',sm:'left'}}>Ahmed
                            <span style={{color:'gold'}}> Tawfik</span>
                          </Typography>
                          <Box sx={{py:4}}>
                          <Box sx={{display:'flex',alignItems:'center',pb:2}}>
                            <Home  sx={{mr:2,color:'gold'}} />
                            <Typography variant='h5'> Based in Istanbul, Turkey</Typography>
                          </Box>
                          <Box sx={{display:'flex',alignItems:'center',pb:2}}>
                          <WhatsApp  sx={{mr:2 ,color:'gold'}}/>
                            <Typography variant='subtitle'>+601111884535</Typography> 
                          </Box>
                          <Box sx={{display:'flex',alignItems:'center'}}>
                          <Email  sx={{mr:2,color:'gold'}}/>
                            <Link href="mailto:medoroyalrma@gmail.com" color="inherit" style={{textDecoration:'none'}} >medoroyalrma@gmail.com</Link>
                          </Box>
                          </Box>
                          <Typography variant='subtitle1' textAlign={{xs:'center',md:'left'}} sx={{mb:5}}>I've created websites using cutting-edge technology and have worked with backend technologies like Python Flask, Python Django, and Nodejs Express, as well as frontend technologies like vanilla Javascript, Reactjs, and Vue.</Typography>
                        </Grid>
                        <Grid item lg={4}  display={{xs:'none',lg:'block'}}>
                        <img className="about-img" src={about} width="500" alt=""/>
                        </Grid>
                      </Grid>
                      </Grid>
                      </Grid>
  )
}

export default About
import { Email, Home, WhatsApp } from '@mui/icons-material'
import { Box, Grid, Link, Typography } from '@mui/material'
import React from 'react'
import about from "/src/img/aboutme.svg"

const About = () => {
  return (
    <Grid container id='about' sx={{minHeight:'100vh'}}>
            {/* <Grid item sm={1} position={'relative'} display={{xs:'none',lg:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1' fontSize={{xs:'48px',md:'96px'}} >About</WaterMark> 
        </Grid> */}
        <Grid item container xs={12} justifyContent={'center'} alignItems={'center'} lg={12}>
              <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold',marginY:5, color:'rgba(255,255,255,0.85)'}}>About</Typography>
                       <Grid item container sx={{p:3,alignItems:'center',justifyContent:'center'}}>
                        <Grid  item xs={12} lg={6} sx={{width:'100%'}} px={{xs:2,md:10}}>
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
                          <Box sx={{background:'#1E1E1E',p:'1rem',borderRadius:5,border:'1px solid gold'}}>
                          <Typography variant='subtitle1' sx={{color:'gold'}} textAlign={{xs:'center'}}>I've created websites using cutting-edge technology and have worked with backend technologies like Python Flask, Python Django, and Nodejs Express, as well as frontend technologies like vanilla Javascript, Reactjs, and Vue.</Typography>
                          </Box>
                        </Grid>
                        <Grid item lg={6} sx={{p:3}}  display={{xs:'none',lg:'block'}}>
                        <img src={about} style={{margin:'0 auto',display:'block'}} alt="Aboutme"/>
                        </Grid>
                      </Grid>
                      </Grid>
                      </Grid>
  )
}

export default About
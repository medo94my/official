import { GitHub, LinkedIn, Twitter } from '@mui/icons-material'
import { Box, Grid, IconButton, Link, Stack, Typography } from '@mui/material'
import React from 'react'
import { WaterMark } from './utils'

const About = () => {
  return (
    <Grid container >
            <Grid item sm={1} position={'relative'} display={{xs:'none',lg:'block'}} sx={{py:'1rem'}}>
          <WaterMark variant='h1' fontSize={{xs:'48px',md:'96px'}} >About</WaterMark> 
        </Grid>
        <Grid item container xs={11} justifyContent={'center'} alignItems={'center'} lg={10}>
              <Typography variant='h2' sx={{textTransform:'uppercase', fontWeight:'bold',marginY:5}}> About</Typography>
                       <Grid item container sx={{p:3,alignItems:'center',justifyContent:'center'}} className="p-3 p-lg-5 d-flex align-items-center">
                        <Grid  item xs={8} sx={{width:'100%'}} className="w-100">
                          <Typography variant='h1'>Ahmed
                            <span style={{color:'orange'}}> Tawfik</span>
                          </Typography>
                          <Box sx={{mb:5}} className="subheading mb-5 text-title">
                            <Typography variant='h5'>Based in Istanbul, Turkey</Typography>
                            <Typography variant='h5'>+601111884535</Typography> 
                            <a href="mailto:medoroyalrma@gmail.com" style={{color:'theme/warning',textDecoration:'none'}} >medoroyalrma@gmail.com</a>
                          </Box>
                          <Typography variant='body1' sx={{mb:5}}>I am experienced in website designing using up to date technology and experinced in backend technology such as python falsk and python django and vanilla javascript </Typography>
                          <div className="footer-social my-5">
                            <div className="container">
                            <Stack direction='row' justifyContent='center'>
                            <IconButton aria-label="delete">
                            <GitHub />
                          </IconButton>
                            <IconButton aria-label="delete">
                            <LinkedIn />
                          </IconButton>
                            <IconButton aria-label="delete">
                            <Twitter />
                          </IconButton>
                                                      
                            </Stack>
                            </div>
                            </div>
                        </Grid>
                        <Grid item xs={4}>
                        <img className="about-img" src="src/img/about.svg" width="500" alt=""/>
                        </Grid>
                      </Grid>
                      </Grid>
                      </Grid>
  )
}

export default About
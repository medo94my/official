import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {Box,IconButton,Stack} from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { Email, GitHub, Home, LinkedIn, Twitter, WhatsApp } from '@mui/icons-material'

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary">
      {'Copyright © '}
      <Link color="inherit" href="https://www.ahmedtawfik.work">
        ahmedtawfik.work
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

 function Footer() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
       
                            <Stack direction='row' justifyContent='center' my={3}>
                            <IconButton size='large' aria-label="Github">
                            <GitHub fontSize='large'/>
                          </IconButton>
                            <IconButton aria-label="LinkedIn" size='large'>
                            <LinkedIn fontSize='large'/>
                          </IconButton>
                            <IconButton aria-label="Twitter" size='large'>
                            <Twitter fontSize='large'/>
                          </IconButton>
                                                      
                            </Stack>
    
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg" sx={{display:'flex',
          justifyContent:'center',
          alignItems:'center',
          flexDirection:'column'}}>
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
}

export default Footer
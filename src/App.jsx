import React from 'react'
import {Hero} from './components/Hero';
import Services from './components/Services';
import Skills from './components/Skills';
import Projects from './components/Projects';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
const App = () => {
  return (
    <>
     <Hero/>
     <Skills/>
     <Services/>
     <Projects/>
     {/* 
     <About/> */}
   {/* <Footer/> */}
   
    </>
  )
}

export default App
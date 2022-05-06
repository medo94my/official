import React from 'react'
import Footer  from './components/Footer';
import Wrapper from './components/Wrapper';
import {Hero} from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Container from '@mui/material/Container';
import Skills from './components/Skills';
import Projects from './components/Projects';
import CssBaseline from '@mui/material/CssBaseline';
import Avatar from './components/Avatar';// import './App.css'
const App = () => {
  return (
    <>
      <CssBaseline />
     <Hero/>
     
     {/* <Skills/>
     <Services/>
     <Projects/>
     <About/> */}
   {/* <Footer/> */}
   
    </>
  )
}

export default App
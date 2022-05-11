import React from 'react'
import {Hero} from './components/Hero';
import Services from './components/Services';
import Skills from './components/Skills';
import Projects from './components/Projects';
import About from './components/About';
import Footer from './components/Footer';
const App = () => {
  return (
    <>
     <Hero/>
     <Skills/>
     <Services/>
     <Projects/>
     <About/>
   <Footer/>
   
    </>
  )
}

export default App
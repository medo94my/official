import React from 'react'
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Wrapper from './components/Wrapper';
import {Hero} from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Skills from './components/Skills';
import Projects from './components/Projects';
import './App.css'
const App = ({children}) => {
  return (
    <div>
   <Navbar/>
   <Wrapper>
     <Hero/>
     <Skills/>
     <Services/>
     <Projects/>
     <About/>
   </Wrapper>
   <Footer/>
   
    </div>
  )
}

export default App
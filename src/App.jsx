import React, { useEffect } from 'react'
import {Hero} from './components/Hero';
import Services from './components/Services';
import Skills from './components/Skills';
import Projects from './components/Projects';
import About from './components/About';
import Footer from './components/Footer';
import Contact from './components/Contact';
import IdeaSubmission from './components/IdeaSubmission';
import WhatsAppButton from './components/WhatsAppButton';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const App = () => {

  useEffect(() => {
    // Reveal animations for sections
    const sections = document.querySelectorAll('section, .reveal-on-scroll');

    sections.forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }, []);

  return (
    <>
     <Hero/>
     <div className="reveal-on-scroll"><Skills/></div>
     <div className="reveal-on-scroll"><Services/></div>
     <div className="reveal-on-scroll"><Projects/></div>
     <div className="reveal-on-scroll"><IdeaSubmission/></div>
     <div className="reveal-on-scroll"><About/></div>
     <div className="reveal-on-scroll"><Contact/></div>
     <Footer/>
     <WhatsAppButton />
    </>
  )
}

export default App

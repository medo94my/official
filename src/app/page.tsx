import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import About from '../components/About';
import { getServices, getSkills, getProjects } from '../lib/data';

const Home = async () => {
  const services = await getServices();
  const skills = await getSkills();
  const projects = await getProjects();

  return (
    <>
      <Hero services={services} skills={skills} />
      <Skills skills={skills} />
      <Services services={services} />
      <Projects projects={projects} />
      <About />
    </>
  );
};

export default Home;

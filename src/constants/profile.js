// src/constants/profile.js
// Centralized profile information and fallback data

export const PROFILE = {
  name: "Ahmed Tawfik",
  role: "Web Developer",
  email: "medoroyalrma@gmail.com",
  phone: "+601111884535",
  location: "Istanbul, Turkey",
  about: "I create websites using cutting-edge technology, specializing in backend frameworks like Python Flask, Django, and Node.js, as well as frontend experiences with React, Vue, and Vanilla JS.",
  social: {
    github: "https://github.com/medo94my",
    linkedin: "https://linkedin.com/in/medo94my",
    twitter: "https://twitter.com/medo94my"
  }
};

export const STATS = [
  { label: 'Years of Experience', value: '5+' },
  { label: 'Projects Completed', value: '25+' },
  { label: 'Happy Clients', value: '10+' },
];

export const FALLBACK_SKILLS = [
  {
    id: 1,
    title: 'Frontend',
    langs: ['HTML', 'CSS3', 'JavaScript']
  },
  {
    id: 2,
    title: 'Backend',
    langs: ['Python', 'PHP', 'Nodejs']
  },
  {
    id: 3,
    title: 'Framework',
    langs: ['Flask', 'Laravel', 'Express']
  },
  {
    id: 4,
    title: 'Databases',
    langs: ['MYSQL', 'MONGODB']
  },
];

export const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: 'Martify',
    type: 'e-commerce',
    languages: ['html', 'css', 'JS', 'PHP', 'Laravel'],
    desc: 'This was my FYP using php. This is an online grocery shop to be able to buy form major shops online and deliver it to home',
    github: 'https://github.com/medo94my/martify-v1.2',
    website: '',
  },
  {
    id: 2,
    name: 'GIS Project',
    type: 'GIS Maps',
    languages: ['python', 'flask', 'folium', 'html', 'css'],
    desc: 'Velit exercitation sunt ipsum deserunt excepteur nisi enim. Occaecat quis esse adipisicing exercitation eiusmod cillum dolore eu eiusmod.',
    github: 'https://github.com/medo94my/gis-Project',
    website: 'https://maps-dev.herokuapp.com/',
  },
  {
    id: 3,
    name: 'Guess number',
    type: 'game portal',
    languages: ['python', 'flask', 'mongodb', 'html', 'css', 'js'],
    desc: 'This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points',
    github: 'https://github.com/medo94my/game-dev',
    website: 'https://mastermind-me.herokuapp.com/',
  },
  {
    id: 4,
    name: 'bookify',
    type: 'online bookstore',
    languages: ['python', 'flask', 'mongodb', 'html', 'css', 'js'],
    desc: 'This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points',
    github: 'https://github.com/medo94my/E-commerce_front_end',
    website: 'https://sprightly-smakager-12110c.netlify.app',
  },
];

export const FALLBACK_SERVICES = [
  {
    id: 1,
    desc: 'Planning'
  },
  {
    id: 2,
    desc: 'Designing'
  },
  {
    id: 3,
    desc: 'Coding'
  },
];

export const NAVIGATION_PAGES = ['Home', 'Services', 'Skills', 'Projects', 'About'];

export const EMAIL_CONFIG = {
  SERVICE_ID_KEY: 'VITE_EMAILJS_SERVICE_ID',
  TEMPLATE_ID_KEY: 'VITE_EMAILJS_TEMPLATE_ID',
  IDEA_TEMPLATE_ID_KEY: 'VITE_EMAILJS_IDEA_TEMPLATE_ID',
  PUBLIC_KEY_KEY: 'VITE_EMAILJS_PUBLIC_KEY',
  DEFAULT_SERVICE_ID: 'service_id',
  DEFAULT_TEMPLATE_ID: 'template_id',
  DEFAULT_PUBLIC_KEY: 'public_key',
};

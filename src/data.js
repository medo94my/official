import webDesign from '/src/img/web-design.png'
import feature from '/src/img/feature.png'
import framework from '/src/img/framework.png'
import database from '/src/img/database-storage.png'
import bookify from '/src/img/bookify.gif'
import guessGame from '/src/img/guess-game.gif'
import { DesignServices, Search, Web } from '@mui/icons-material'
export const skills=[
    {
      id:1,
      icon:webDesign,
      title:'Frontend',
      langs:['HTML','CSS3','JavaScript']
    },
    {
      id:2,
      icon: feature,
      title:'Backend',
      langs:['Python','PHP','Nodejs']
    },
    {
      id:3,
      icon:framework,
      title:'Framework',
      langs:['Flask','Laravel','Express',]
    },
    {
      id:4,
      icon: database,
      title:'Databases',
      langs:['MYSQL','MONGODB']
    },
  ]

export const projects=[
  {
    id:1,
    name:'Martify',
    type:'e-commerce',
    languages:['html','css','JS','PHP','Laravel'],
    desc:'This was my FYP using php. This is an online grocery shop to be able to buy form major shops online and deliver it to home',
    github:'https://github.com/medo94my/martify-v1.2',
    website:'',
    media:guessGame
  },
  {
    id:2,
    name:'GIS Project',
    type:'GIS Maps',
    languages:['python','flask','folium','html','css'],
    desc:'Velit exercitation sunt ipsum deserunt excepteur nisi enim. Occaecat quis esse adipisicing exercitation eiusmod cillum dolore eu eiusmod. ',
    github:'https://github.com/medo94my/gis-Project',
    website:'https://maps-dev.herokuapp.com/',
    media:guessGame
  },
  {
    id:3,
    name:'Guess number',
    type:'game portal',
    languages:['python','flask','mongodb','html','css','js'],
    desc:'This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points',
    github:'https://github.com/medo94my/game-dev',
    website:'https://mastermind-me.herokuapp.com/',
    media:guessGame
  },
  {
    id:4,
    name:'bookify',
    type:'online bookstore',
    languages:['python','flask','mongodb','html','css','js'],
    desc:'This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points',
    github:'https://github.com/medo94my/E-commerce_front_end',
    website:'https://sprightly-smakager-12110c.netlify.app',
    media:bookify
  },
]

export const service=[
  {
    id:1,
    img:Search ,
    desc:'Planning'
  },
  {
    id:2,
    img:DesignServices ,
    desc:'Designing'
  },
  {
    id:3,
    img:Web,
    desc:'Coding'
  },
]
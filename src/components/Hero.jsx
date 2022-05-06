import React,{useRef,useEffect} from 'react'
import Typed from 'typed.js'
import Container from '@mui/material/Container'
import { Box,Grid, Typography, Button, Stack } from '@mui/material'
import { styled } from '@mui/system';
import Me from '../img/bg.png'
const MyComponent = styled('div')({
  clipPath: 'polygon(100% 0%, 100% 54%, 100% 100%, 51% 100%, 0% 50%, 54% 0)',
  width:'100%',
  height:'100%',
  position:'absolute',
  backgroundColor:'magenta',
});
const MyComponent1 = styled('div')((props)=>({
  clipPath: 'circle(50% at 50% 50%)',
  opacity:'0.2',
  width:"200px",
  height:"200px",
  position:'absolute',
  backgroundColor:props.color,
  top:props.top||'10px',
  left:props.left||'20px'
}));
const Image = styled('img')({
  zIndex:2,
  width:'100%',
  height:'100%',
});

export const Hero = () => {
  const name=useRef(null)
  const occupation=useRef(null)
  useEffect(() => {
  const typed= new Typed(name.current,{
    strings:["Hi, I'm Ahmed Tawfik"],
     startDelay:300,
     typeSpeed:100,
     backDelay:100,
     backSpeed:100,
     cursorChar:''
   })
   
     return () => {
       typed.destroy()
     }
   }, [])
  
  useEffect(() => {
    const typed= new Typed(occupation.current,{
      strings:['Code Trainer','Department Manager','Web Developer'],
      startDelay:100,
      typeSpeed:50,
      backDelay:100,
      backSpeed:50,
      loop:true,
      cursorChar:''
    })
    
      return () => {
        typed.destroy()
      }
    }, [])
  
  return (
    <Stack sx={{height:'90vh',width:'100vw'}}>
    <Stack direction="row" justifyContent='center' alignItems='center' spacing={2} sx={{width:'100%',height:'100%'}}>
      <Stack flex={2}  direction='column'  justifyContent='center' px='50px' gap={5} alignItems='center' sx={{height:'100%',position:'relative'}} >
      <MyComponent1/>
      {/* <MyComponent1 color='red' top='50%'/> */}
        <Typography variant='h1' sx={{minHeight:'112px'}} textAlign='center' fontWeight='200' ref={name}>
        </Typography>
        <Typography variant='h5' sx={{minHeight:'33px'}} ref={occupation} textAlign="center"/>
        <Typography variant='h6'>
          Planning | Designing | UI/UX | Developing | Deploying
        </Typography>
        <Typography variant='h4'>
          Learn how to create and mentain your own website 
        </Typography>
      </Stack>
      <Stack flex={1}sx={{position:'relative',height:'100%'}}>
        <MyComponent/>
        <Image src={Me}/>
      </Stack>
</Stack>
    </Stack>
  )
}

{/* <div className="work text-uppercase" style={{width:'90%',height:'70%'}}>
                
                {/* <h1 className="greeting">Hello, I am</h1> 
                <h1 className="name" ref={el}></h1>
                <h2 className="occupation" ref={occupation}></h2>
              </div>
                          <div  className=" btn-hero">
                            <a href="#Portfolio" className="btn btn-outline-warning">SEE PORTFOLIO <i className="fas fa-arrow-right ml-2"></i></a>
                          </div> */}
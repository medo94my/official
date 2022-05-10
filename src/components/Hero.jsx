import React, { useRef, useEffect } from "react";
import Typed from "typed.js";
import { Typography, Button, Stack,Box } from "@mui/material";
import { styled } from "@mui/system";
import { Visibility } from "@mui/icons-material";
const MyComponent = styled("div")({
  clipPath: "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)",
  width: "100%",
  height: "100%",
  position: "absolute",
  backgroundColor: "gold",
});
const Wave = styled("div")({
  clipPath:
    "polygon(100% 0%, 0% 0% , 0% 65.00%, 1% 64.98%, 2% 64.93%, 3% 64.85%, 4% 64.73%, 5% 64.58%, 6% 64.39%, 7% 64.17%, 8% 63.92%, 9% 63.64%, 10% 63.33%, 11% 62.99%, 12% 62.62%, 13% 62.22%, 14% 61.79%, 15% 61.33%, 16% 60.85%, 17% 60.35%, 18% 59.82%, 19% 59.27%, 20% 58.70%, 21% 58.10%, 22% 57.49%, 23% 56.87%, 24% 56.22%, 25% 55.57%, 26% 54.90%, 27% 54.22%, 28% 53.53%, 29% 52.83%, 30% 52.13%, 31% 51.42%, 32% 50.70%, 33% 49.99%, 34% 49.28%, 35% 48.56%, 36% 47.86%, 37% 47.15%, 38% 46.45%, 39% 45.76%, 40% 45.08%, 41% 44.41%, 42% 43.76%, 43% 43.12%, 44% 42.49%, 45% 41.88%, 46% 41.29%, 47% 40.72%, 48% 40.17%, 49% 39.64%, 50% 39.13%, 51% 38.65%, 52% 38.20%, 53% 37.77%, 54% 37.37%, 55% 37.00%, 56% 36.66%, 57% 36.35%, 58% 36.07%, 59% 35.82%, 60% 35.60%, 61% 35.42%, 62% 35.27%, 63% 35.15%, 64% 35.07%, 65% 35.02%, 66% 35.00%, 67% 35.02%, 68% 35.07%, 69% 35.16%, 70% 35.27%, 71% 35.43%, 72% 35.61%, 73% 35.83%, 74% 36.08%, 75% 36.36%, 76% 36.68%, 77% 37.02%, 78% 37.39%, 79% 37.79%, 80% 38.22%, 81% 38.68%, 82% 39.16%, 83% 39.67%, 84% 40.20%, 85% 40.75%, 86% 41.32%, 87% 41.91%, 88% 42.52%, 89% 43.15%, 90% 43.79%, 91% 44.45%, 92% 45.12%, 93% 45.80%, 94% 46.49%, 95% 47.19%, 96% 47.89%, 97% 48.60%, 98% 49.31%, 99% 50.03%, 100% 50.74%)",
    width: '700px',
    height: "500px",
    position: "absolute",
    backgroundColor: "gold",
    bottom:'0px',
    right:'0px',
    transform:'rotate(180deg)',
    zIndex:-100
});
const MyComponent1 = styled("div")((props) => ({
  clipPath: "circle(50% at 50% 50%)",
  opacity: "0.2",
  width: "200px",
  height: "200px",
  position: "absolute",
  backgroundColor: props.color,
  top: props.top || "10px",
  left: props.left || "20px",
}));
const Image = styled("img")({
  zIndex: 2,
  width: "100%",
  height: "100%",
});
const InterText = styled(Typography)({});

export const Hero = () => {
  const name = useRef(null);
  const occupation = useRef(null);

  /* useEffect(() => {
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
  
   */
  useEffect(() => {
    const typed = new Typed(occupation.current, {
      strings: ["Code Trainer", "Department Manager", "Web Developer"],
      startDelay: 100,
      typeSpeed: 50,
      backDelay: 100,
      backSpeed: 50,
      loop: true,
      cursorChar: "",
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <Stack sx={{ height: "100vh",position:'relative' }}>
      <Stack
        direction={{xs:'column',sm:'row'}}
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack
          flex={2}
          direction="column"
          justifyContent="center"
          px="50px"
          gap={5}
          alignItems="flex-start"
          sx={{ height: "100%",py:10, position: "relative" }}
        >
          {/* <MyComponent1/> */}
          <Box>

          <Typography
            variant="h1"
            textTransform={"capitalize"}
            fontWeight="bold"
            component='div'
            >
            Hello,
            <br />
            i'm, ahmed <br />
            <Box sx={{height:'4rem'}} style={{ color: "gold" }} ref={occupation}></Box>
          </Typography>
            </Box>
          <Box>

          <Typography
            variant="p"
            textTransform={"capitalize"}
            textAlign="center"
            fontWeight="200"
            color='#8d8d8d'
            fontSize="2rem"
            component='div'
            >
            Planning | Designing | UI/UX | Developing | Deploying
          </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              px: 10,
              py: 2,
              mx: "auto",
              color: "white",
              backgroundColor: "#145C9E",
            }}
            size="large"
            href="#projects"
            startIcon={<Visibility />}
          >
            Projects
          </Button>
        <Wave sx={{display:{xs:'block',sm:'none'}}}/>
        </Stack>
        <Stack
        display={{xs:'none',sm:'block'}}
          flex={1}
          sx={{ position: "relative", height: "100%" }}
        >
          <MyComponent />

          {/* <Image src={Me}/> */}
        </Stack>
      </Stack>
    </Stack>
  );
};

{
  /* <div className="work text-uppercase" style={{width:'90%',height:'70%'}}>
                
                {/* <h1 className="greeting">Hello, I am</h1> 
                <h1 className="name" ref={el}></h1>
                <h2 className="occupation" ref={occupation}></h2>
              </div>
                          <div  className=" btn-hero">
                            <a href="#Portfolio" className="btn btn-outline-warning">SEE PORTFOLIO <i className="fas fa-arrow-right ml-2"></i></a>
                          </div> */
}

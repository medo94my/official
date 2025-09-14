import { styled, Typography } from "@mui/material";

export const WaterMark=styled(Typography)({
    textTransform:'uppercase',
    writingMode: 'vertical-rl',
    color:'#8d8d8d',
    fontWeight:'bolder',
    opacity:'0.3',
    position:'absolute',
    top:'50%',
    bottom:'0',
    transform:'translateY(-65%)'
  
  })
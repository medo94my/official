import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, Grid, styled } from '@mui/material';
import { DesignServices } from '@mui/icons-material';
const MyCardMedia=styled(CardMedia)`
.MuiCardMedia-root .MuiCardMedia-media .MuiCardMedia-img .css-1hoisz4-MuiCardMedia-root{
    color:white;
}
`

const Arrow=styled('span')(
  {
    display:'inline-block',
   ' &::after':{
      content:'"→"',
      color:'gold',
      animation:'animate 1s linear infinite',
      position:'absolute',
      fontSize:96,
      fontWeight:700,
      top:'50%',
      right:'-40px',
      transform: 'translateY(-50%)',

      '@keyframes animate':{
        '0%':{
          color:'gold'
        },
        '50%':{
          color:'orange'
        },
        '75%':{
          color:'yellow'
        },
        '100%':{
          color:'gold'
        },
      }
    }
  },
)
export default function CardInfo({item}) {
  return (
    <Grid item sx={{p:3}} position='relative'  xs={12} sm={4} container justifyContent='center' alignItems='center'>
    <Card sx={{minWidth:'17rem'}}>
      <CardActionArea sx={{height:'15rem' }} >
        <CardContent>
          <Typography variant="h5" textAlign={'center'} color="text.primary" textTransform={'uppercase'}>
           {item.desc}
          </Typography>
        </CardContent>
        {item.img}
      </CardActionArea>
    </Card>
    {item.id !==3 && <Arrow sx={{ display:{xs:'none',lg:'inline-block'}}}/>}
    
     </Grid>
  );
}

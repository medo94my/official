import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, styled } from '@mui/material';
const MyCardMedia=styled(CardMedia)`
.MuiCardMedia-root .MuiCardMedia-media .MuiCardMedia-img .css-1hoisz4-MuiCardMedia-root{
    color:white;
}
`
export default function CardInfo({item}) {
  return (
    <Card sx={{borderRadius:0}}>
      <CardActionArea sx={{height:'20rem' }} >
        <MyCardMedia
          component="img"
          height="140"
          image={item.img}
          sx={{display:'block',width:'128px',height:'128px',mx:'auto', p:1}}
          alt="green iguana"
        />
    
        <CardContent>
          <Typography variant="body2" color="text.secondary">
           {item.desc}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, styled } from '@mui/material';
import { DesignServices } from '@mui/icons-material';
const MyCardMedia=styled(CardMedia)`
.MuiCardMedia-root .MuiCardMedia-media .MuiCardMedia-img .css-1hoisz4-MuiCardMedia-root{
    color:white;
}
`
export default function CardInfo({item}) {
  return (
    <Card sx={{minWidth:'17rem'}}>
      <CardActionArea sx={{height:'15rem' }} >
        <CardContent>
          <Typography variant="h5" textAlign={'center'} color="text.primary">
           {item.desc}
          </Typography>
        </CardContent>
        {item.img}
      </CardActionArea>
    </Card>
  );
}

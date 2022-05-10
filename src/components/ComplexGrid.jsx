import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Chip, Box,Grid, CardMedia, CardContent, Card, Stack  } from '@mui/material';
export default function ComplexGrid({item}) {
  return (

    <Grid container item xs={12} md={6} sx={{py:3}} bgcolor={'secondary'} border={'1px solid gray'} justifyContent='center' alignItems='center'  >
      <Card sx={{ display: "flex",width:'100%' }}>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={item.icon}
        alt="Live from space album cover"
      />

        <CardContent sx={{ display: "flex", flexDirection: "column" ,justifyContent:'space-between', alignItems:'flex-start',width:'100%' }} >
          <Typography component="div" variant="h5">
            {item.title}
          </Typography>
          <Stack direction={'row'}>

          {item.langs.map((item) => (
            <Chip key={item} label={item}></Chip>
            ))}
            </Stack>
        </CardContent>
    </Card>
              {/* <Grid xs={12} sm={3} item >
                <Stack justifyContent='center' alignItems='center' sx={{pr:{xs:'0',sm:'.5rem'}}}>
                <img src={item.icon} width="64" alt={item.icon.split('/')[2].split('.')[0]}/>
                </Stack>
                    </Grid> 
                <Grid xs={12} sm={9} sx={{p:'5px 7px'}}  item>
                  <Typography variant='h6' textAlign={{xs:'center',sm:'left'}}>{item.title.toUpperCase()}</Typography>
                  <Stack direction={'row'} gap={1} sx={{py:1}} flexWrap='wrap' justifyContent={{xs:'center',sm:'flex-start'}} alignItems={{xs:'center',sm:'flex-start'}}>
                  {item.langs.map((lang,idx)=>(
                     <Chip label={lang} key={idx} sx={{px:1}}/>
                     ))}
                     </Stack>
                </Grid> */}
                
            </Grid> 
  );
}
//  <Chip label={lang} key={idx} sx={{px:1}}/>

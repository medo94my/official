import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Chip, Box,Grid, CardMedia, CardContent, Card, Stack  } from '@mui/material';
export default function ComplexGrid({item}) {
  return (

    <Grid container item xs={12} md={5} sx={{p:2}} bgcolor={'secondary'} justifyContent='center' alignItems='center'  >
      <Card sx={{ display: "flex",width:'100%',height:'100%',px:2,justifyContent:'center', alignItems:'center' }} >
      <CardMedia
        component="img"
        sx={{ width: 124, height:124, p:2 }}
        image={item.icon}
        alt="Live from space album cover"
      />

        <CardContent sx={{ display: "flex", flexDirection: "column" ,justifyContent:'space-around',p:{xs:.5,md:2}, alignItems:'flex-start',width:'100%' }} >
          <Typography component="div" variant="h5" sx={{p:{xs:'.5rem 5px'}}}>
            {item.title.toUpperCase()}
          </Typography>
          <Stack direction={'row'} gap={1} sx={{py:{xs:2},flexWrap:'wrap'}} >

          {item.langs.map((item) => (
            <Chip key={item} label={item} sx={{backgroundColor:'gold',fontWeight:600,color:'black'}}></Chip>
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

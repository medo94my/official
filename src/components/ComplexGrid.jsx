import * as React from 'react';
import Typography from '@mui/material/Typography';
import { Chip, Stack,Grid  } from '@mui/material';
export default function ComplexGrid({item}) {
  return (
    <Grid container item xs={12} md={6} sx={{py:3}}  justifyContent='center' alignItems='center'  >
              <Grid xs={12} sm={2} item >
                <Stack justifyContent='center' alignItems='center' sx={{pr:{xs:'0',sm:'.5rem'}}}>
                <img src={item.icon} width="64" alt={item.icon.split('/')[2].split('.')[0]}/>
                </Stack>
                    </Grid> 
                <Grid xs={12} sm={10} sx={{p:'5px 7px',minWidth:'240px'}} item>
                  <Typography variant='h6' textAlign={{xs:'center',sm:'left'}}>{item.title.toUpperCase()}</Typography>
                  <Stack direction={'row'} gap={1} sx={{py:1}}flexWrap='wrap' justifyContent={{xs:'center',sm:'flex-start'}} alignItems={{xs:'center',sm:'flex-start'}}>
                  {item.langs.map((lang,idx)=>(
                     <Chip label={lang} key={idx} sx={{px:1}}/>
                     ))}
                     </Stack>
                </Grid>
                
            </Grid> 
  );
}
//  <Chip label={lang} key={idx} sx={{px:1}}/>

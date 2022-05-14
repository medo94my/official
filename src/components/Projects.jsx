import { GitHub, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import Section from "./Section";
import { WaterMark } from "./utils";
import projectAvatar from "/src/img/avatar.png"

const Projects = () => {
  return (
   <Section title='Portfolio'>
          {[1,2,3].map(item=>(
              <Grid
              key={item}
              item
              xs={12}
              sm={6}
              lg={4}
              sx={{p:5}}
            >
              <Card sx={{ minWidth: 300,p:2 }}>
                <CardContent>
                  <Typography variant="h6" textAlign='center' color="text.secondary" gutterBottom>
             E-commerce- martify grocery
          </Typography>
                  <Stack
                    width={"100%"}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <img
                      src={projectAvatar}
                      width={'100%'}
                      display={"block"}
                      style={{ margin: "0 auto" }}
                    />
                  </Stack>
                  <Box sx={{px:'2rem',width:'100%'}}>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  This was my FYP using php. This is an online grocery shop to
                    be able to buy form major shops online and deliver it to home
                  </Typography>
                  <Typography variant="body2">
                    Project Type: <br />
                    <Chip label="Solo" sx={{ margin: "5px 10px" }} />
                  </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Stack width={'100%'} direction={'row'} justifyContent='space-around' alignItems='center'>
                  <Button  variant='contained' size="large" sx={{color:'black',backgroundColor:'gold'}} startIcon={<GitHub />}>
                    Github
                  </Button>
                  <Button variant='outlined' sx={{color:'gold',borderColor:'gold'}} size="large" startIcon={<Visibility />}>
                    View
                  </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Section>
  );
};

export default Projects;

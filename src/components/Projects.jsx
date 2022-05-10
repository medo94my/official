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
import { WaterMark } from "./utils";

const Projects = () => {
  return (
    <Grid container position={"relative"}>
      <Grid
        item
        sm={1}
        position={"relative"}
        display={{ xs: "none", lg: "block" }}
        sx={{ py: "1rem" }}
      >
        <WaterMark variant="h1" fontSize={{ xs: "48px", sm: "96px" }}>
          Projects
        </WaterMark>
      </Grid>
      <Grid item container xs={12} lg={10} justifyContent={'center'} alignItems={'center'}>
        <Typography
          variant="h2"
          sx={{ textTransform: "uppercase", fontWeight: "bold", marginY:5}}
        >
          portfolio
        </Typography>
        <Grid item container>
          {[1,2,3].map(item=>(
              <Grid
              key={item}
              item
              xs={12}
              sm={4}
            >
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
             E-commerce- martify grocery
          </Typography>
                  <Stack
                    width={"100%"}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <img
                      src={"./src/img/avatar.png"}
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
                  <Button  variant='contained' size="large" color={'warning'} startIcon={<GitHub />}>
                    Github
                  </Button>
                  <Button variant='outlined' color={'warning'} size="large" startIcon={<Visibility />}>
                    View
                  </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {/* <div className="col-md-6 col-lg-4 col-sm-12 my-sm-3">
                        <div className="card border-0 transform-on-hover custom-card">
                          <div className="p-4" style={{background: 'black'}}>
                            <img src="./src/img/avatar.png" alt="Card Image" className="card-img-top"/>
                          </div>
                            <div className="card-body">
                                <h6>GUESS number game</h6>
                                <p className=" card-text">This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points </p>
                                <p>Type:<span className="badge badge-pill badge-success  mx-2">Team</span></p>
                                <div className="d-flex justify-content-between">
                                  <a name="" href="https://github.com/medo94my/game-dev" id="" className="btn btn-warning mx-2" role="button" target="_blank"><i className="fab fa-github-alt mx-1"></i>Github</a>
                                  <a name="" id="" className="btn btn-outline-warning mx-2" href="https://mastermind-me.herokuapp.com/" role="button" target="_blank"><i className="far fa-eye mx-1"></i>View</a>
                                </div>
                            </div>
                        </div>
                    </div> */}
          {/* <div className="col-md-6 col-lg-4 col-sm-12 my-sm-3">
                        <div className="card border-0 transform-on-hover custom-card">
                          <div className="p-4" style={{background: 'black'}}>
                            <img src="./src/img/avatar.png" alt="Card Image" className="card-img-top"/>
                          </div>
                            <div className="card-body">
                                <h6>blog with reward system</h6>
                                <p className=" card-text">This project is a replica of stackoverflow but aiming toward gamers to discuss about newly launched games </p>
                                <p>Type:<span className="badge badge-pill badge-success  mx-2">Team</span></p>
                                <div className="d-flex justify-content-between">
                                  <a href="https://github.com/medo94my/wasi-furom" className="btn btn-warning mx-2" role="button" target="_blank"><i className="fab fa-github-alt mx-1"></i>Github</a>
                                  <a name="" id="" className="btn btn-outline-warning mx-2 disabled" href="#" role="button" target="_blank">
                                    <i className="far fa-eye-slash mx-1"></i>
                                    View</a>
                                </div>
                              </div>
                        </div>
                    </div> */}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Projects;

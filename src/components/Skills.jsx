import { Container, Grid, Typography, Stack } from "@mui/material";
import React from "react";
import ComplexGrid from "./ComplexGrid";
import { WaterMark } from "./utils";
import { skills as data } from "../data";

const Skills = () => {
  return (
    <Grid container>
      <Grid
        item
        sm={1}
        position={"relative"}
        display={{ xs: "none", lg: "block" }}
        sx={{ py: "1rem" }}
      >
        <WaterMark variant="h1" fontSize={{ xs: "48px", sm: "96px" }}>
          skills
        </WaterMark>
      </Grid>

      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        xs={12}
        lg={10}
        item
      >
        <Typography
          variant="h2"
          sx={{ textTransform: "uppercase", fontWeight: "bold", marginY: 5 }}
        >
          skills
        </Typography>
        <Grid
          container
          sx={{ py: "4rem" }}
          gap={1}
          justifyContent="center"
          alignItems="center"
        >
          {data.map((item) => (
            <ComplexGrid key={item.id} item={item} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Skills;

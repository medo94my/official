import { Container, Grid, Typography, Stack } from "@mui/material"
import React from "react"
import ComplexGrid from "./ComplexGrid"
import { WaterMark } from "./utils"
import { skills as data } from "../data"

const Section = ({ title, children, styles }) => {
    return (
        <Grid container sx={styles}>
            {/* <Grid
        item
        sm={1}
        position={"relative"}
        display={{ xs: "none", lg: "block" }}
        sx={{ py: "1rem" }}
      >
        <WaterMark variant="h1" fontSize={{ xs: "42px", sm: "96px" }}>
          {title}
        </WaterMark>
      </Grid> */}

            <Grid
                container
                justifyContent={"center"}
                alignItems={"center"}
                xs={12}
                lg={12}
                item
            >
                <Typography
                    variant="h2"
                    sx={{
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        marginY: 5,
                        letterSpacing:'2px',
                        color:'#fff',
                        textShadow:'-1vmin -1vmin #3b3f46'
                    
                    }}
                >
                    {title}
                </Typography>
                <Grid
                    container
                    sx={{ py: "4rem" }}
                    justifyContent="center"
                    alignItems="center"
                >
                    {children}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Section

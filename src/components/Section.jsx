import { Grid, Typography } from "@mui/material"
import React from "react"

const Section = ({ title, children, styles ,secId}) => {
    return (
        <Grid container sx={styles} minHeight='100vh'>
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
                id={secId}
            >
                <Typography
                    variant="h2"
                    sx={{
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        marginY: 5,
                        letterSpacing:'2px',
                        color:'rgba(255,255,255,0.85)',
                    
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

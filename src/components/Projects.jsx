import { GitHub, Visibility, VisibilityOff } from "@mui/icons-material"
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    Stack,
    Typography,
} from "@mui/material"
import React from "react"
import Section from "./Section"
import { projects } from "../data"

const Projects = () => {
    return (
        <Section title="Portfolio" secId={"projects"}>
            {projects.map((project) => (
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    key={project.id}
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    marginBottom={3}
                >
                    <Card sx={{ minWidth: 300, maxWidth: 345 }}>
                        <CardMedia
                            component="img"
                            sx={{ objectFit: "contain" }}
                            image={
                                project.media ? project.media : projectAvatar
                            }
                        />

                        <CardContent sx={{ px: "2rem", width: "100%" }}>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                gutterBottom
                            >
                                {project.name.toUpperCase()} -{" "}
                                <Chip
                                    size="small"
                                    label={project.type.toUpperCase()}
                                    sx={{
                                        backgroundColor: "gold",
                                        color: "black",
                                    }}
                                />
                            </Typography>
                            <Box>
                                <Grid
                                    container
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{ pb: 2 }}
                                >
                                    {project.languages.map((language, idx) => (
                                        <Chip
                                            size="small"
                                            key={`${language}-${idx}`}
                                            label={language.toUpperCase()}
                                            variant="outlined"
                                            sx={{
                                                margin: "5px",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                borderColor: "white",
                                                color: "white",
                                            }}
                                        />
                                    ))}
                                </Grid>
                                <Typography
                                    sx={{ mb: 1.5 }}
                                    color="text.secondary"
                                >
                                    {project.desc}
                                </Typography>
                                <Typography variant="body2"></Typography>
                            </Box>
                        </CardContent>
                        <CardActions sx={{ px: "2rem", pb: "1rem" }}>
                            <Button
                                href={project.github}
                                size="small"
                                sx={{
                                    color: "gold",
                                }}
                                startIcon={<GitHub />}
                            >
                                Github
                            </Button>
                            <Button
                                href={project.website}
                                sx={{ color: "gold", mx: 2 }}
                                size="small"
                                startIcon={
                                    project.website ? (
                                        <Visibility />
                                    ) : (
                                        <VisibilityOff />
                                    )
                                }
                                disabled={project.website ? false : true}
                            >
                                View
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Section>
    )
}

export default Projects

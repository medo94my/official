import { Container, Grid, Typography, Stack } from "@mui/material";
import React from "react";
import ComplexGrid from "./ComplexGrid";
import { WaterMark } from "./utils";
import { skills as data } from "../data";
import Section from './Section'

const Skills = () => {
  return (
    
    <Section title='Skills'>
    {data.map((item) => (
            <ComplexGrid key={item.id} item={item} />
          ))}
    </Section>
  );
};

export default Skills;

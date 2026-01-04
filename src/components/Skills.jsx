import { Container, Grid, Typography, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import ComplexGrid from "./ComplexGrid";
import { WaterMark } from "./utils";
import { getSkills } from "../services/contentful";
import Section from './Section'

const Skills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    getSkills().then(setSkills);
  }, []);

  return (
    <Section title='Skills' secId='skills'>
    {skills.map((item) => (
            <ComplexGrid key={item.id} item={item} />
          ))}
    </Section>
  );
};

export default Skills;

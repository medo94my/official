import React from 'react'
import ComplexGrid from './ComplexGrid'
import Section from './Section'

const Skills = ({ skills }) => {
  return (
    <Section title="Skills" secId="skills" styles={{}}>
      <div className="flex flex-wrap justify-center w-full">
        {skills.map((item) => (
          <ComplexGrid key={item.id} item={item} />
        ))}
      </div>
    </Section>
  )
}

export default Skills

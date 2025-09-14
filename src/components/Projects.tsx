import { Github, Eye, EyeOff } from 'lucide-react'
import React from 'react'
import Section from './Section'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const Projects = ({ projects }) => {
  return (
    <Section title="Portfolio" secId={"projects"} styles={{}}>
      <div className="flex flex-wrap justify-center w-full">
        {projects.map((project) => (
          <div
            key={project.id}
            className="w-full sm:w-6/12 lg:w-4/12 mb-3 flex justify-center items-center"
          >
            <Card className="min-w-[300px] max-w-[345px]">
              <img
                className="object-contain"
                src={project.media}
                alt={project.name}
              />
              <CardContent className="px-8 w-full">
                <h3 className="text-secondary-foreground">
                  {project.name.toUpperCase()} -{" "}
                  <Badge className="bg-gold text-black">
                    {project.type.toUpperCase()}
                  </Badge>
                </h3>
                <div className="flex flex-wrap justify-center items-center pb-2">
                  {project.languages.map((language, idx) => (
                    <Badge
                      key={`${language}-${idx}`}
                      variant="outline"
                      className="m-1 border-white text-white"
                    >
                      {language.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="mb-1.5 text-secondary-foreground">
                  {project.desc}
                </p>
              </CardContent>
              <CardFooter className="px-8 pb-4">
                <Button asChild variant="link" className="text-gold">
                  <a href={project.github}>
                    <Github className="mr-2" /> Github
                  </a>
                </Button>
                <Button
                  asChild
                  variant="link"
                  className="text-gold mx-2"
                  disabled={!project.website}
                >
                  <a href={project.website}>
                    {project.website ? (
                      <Eye className="mr-2" />
                    ) : (
                      <EyeOff className="mr-2" />
                    )}
                    View
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  )
}

export default Projects


import { Mail, Home, Phone } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersonalInfo } from '@/lib/data';
import { PersonalInfo } from '@/lib/types';

const About = async () => {
  const personalInfo: PersonalInfo = await getPersonalInfo();

  return (
    <div id="about" className="min-h-screen flex flex-col justify-center items-center py-12">
      <h2 className="text-3xl uppercase font-bold my-5 text-foreground/85">About</h2>
      <div className="container mx-auto p-3 flex flex-wrap items-center justify-center">
        <div className="w-full lg:w-1/2 px-2 md:px-10">
          <Card className="bg-secondary border-yellow-400">
            <CardHeader>
              <CardTitle className="text-4xl sm:text-6xl md:text-7xl text-center sm:text-left font-bold">
                {personalInfo.firstName} <span className="text-yellow-400">{personalInfo.lastName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Home className="mr-2 text-yellow-400" />
                <p className="text-xl">{personalInfo.address}</p>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 text-yellow-400" />
                <p>{personalInfo.phone}</p>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 text-yellow-400" />
                <a href={`mailto:${personalInfo.email}`} className="hover:underline">
                  {personalInfo.email}
                </a>
              </div>
              <p className="text-yellow-400 text-center">
                {personalInfo.summary.text1}
                {personalInfo.summary.backend.map((tech, index) => (
                  <React.Fragment key={index}>
                    <Badge variant="outline">{tech}</Badge>
                    {index < personalInfo.summary.backend.length - 1 && ', '}
                  </React.Fragment>
                ))}
                {personalInfo.summary.text2}
                {personalInfo.summary.frontend.map((tech, index) => (
                  <React.Fragment key={index}>
                    <Badge variant="outline">{tech}</Badge>
                    {index < personalInfo.summary.frontend.length - 1 && ', '}
                  </React.Fragment>
                ))}
                {personalInfo.summary.text3}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:flex w-full lg:w-1/2 p-3 justify-center">
          <img src="/aboutme.svg" className="w-3/4" alt="About me" />
        </div>
      </div>
    </div>
  )
}

export default About

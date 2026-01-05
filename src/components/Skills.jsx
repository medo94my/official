import React, { useEffect, useState } from "react";
import { getSkills } from "../services/strapi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

const Skills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    getSkills().then(setSkills);
  }, []);

  return (
    <section id="skills" className="py-20 w-full min-h-screen flex items-center bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Title & Visual */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
             <div className="relative mb-8">
                 <div className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-40 h-40 rounded-full border border-primary/50 flex items-center justify-center">
                    </div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <h2 className="text-4xl font-bold text-primary uppercase tracking-widest bg-black p-2 rounded-full z-10">Skills</h2>
                 </div>
                 {/* Orbiting dots decoration */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_#FFD700]"></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_#FFD700]"></div>
             </div>
             
             <p className="text-gray-400 max-w-sm">
                A comprehensive toolkit for building modern, scalable, and user-centric web applications.
             </p>
          </div>

          {/* Right Column: Skills Grid */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
             {skills.map((item, index) => (
                 <Card key={item.id || index} className="bg-[#111] border-gray-800 hover:border-primary/50 transition-colors group">
                     <CardContent className="p-6 flex flex-col gap-4">
                         <div className="flex items-center gap-4">
                             <div className="p-2 bg-black rounded-lg border border-gray-800 group-hover:border-primary/30 transition-colors">
                                 <img 
                                    src={item.icon} 
                                    alt={item.title} 
                                    className="w-10 h-10 object-contain"
                                 />
                             </div>
                             <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase">{item.title}</h3>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                             {item.langs && item.langs.map((lang, idx) => (
                                 <Badge key={idx} variant="outline" className="border-gray-700 text-gray-400 group-hover:text-white transition-colors">
                                     {lang}
                                 </Badge>
                             ))}
                         </div>
                     </CardContent>
                 </Card>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Skills;

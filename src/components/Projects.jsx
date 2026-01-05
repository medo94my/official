import { Github, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React, { useEffect, useState } from "react"
import { getProjects } from "../services/strapi"

const Projects = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        getProjects().then(setProjects);
    }, []);

    return (
        <section id="projects" className="py-24 w-full bg-[#050505]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-4xl font-bold text-white uppercase tracking-widest mb-4">
                        My <span className="text-primary">Portfolio</span>
                    </h2>
                    
                     <div className="flex gap-4">
                         {/* Filter buttons could go here if needed */}
                         {/* <Button variant="ghost" className="text-primary hover:text-white">All</Button> */}
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <Card key={project.id} className="group relative overflow-hidden bg-black border border-gray-800 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                             {/* Image Container with Overlay */}
                             <div className="relative h-64 w-full overflow-hidden bg-[#111]">
                                 {project.media ? (
                                    <img
                                        src={project.media}
                                        alt={project.name}
                                        className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                                 )}
                                 
                                 {/* Overlay on Hover */}
                                 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                     <Button
                                         variant="outline"
                                         size="icon"
                                         className="rounded-full border-primary text-primary hover:bg-primary hover:text-black"
                                         asChild
                                     >
                                         <a href={project.github} target="_blank" rel="noopener noreferrer" title="View Code">
                                             <Github className="h-5 w-5" />
                                         </a>
                                     </Button>
                                     {project.website && (
                                         <Button
                                             variant="outline"
                                             size="icon"
                                             className="rounded-full border-primary text-primary hover:bg-primary hover:text-black"
                                             asChild
                                         >
                                             <a href={project.website} target="_blank" rel="noopener noreferrer" title="View Site">
                                                 <ExternalLink className="h-5 w-5" />
                                             </a>
                                         </Button>
                                     )}
                                 </div>
                             </div>

                            <CardContent className="p-6 flex-grow flex flex-col gap-3">
                                 <div className="flex justify-between items-start">
                                     <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase">
                                        {project.name}
                                     </h4>
                                     {project.type && (
                                         <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase">
                                             {project.type}
                                         </Badge>
                                     )}
                                 </div>

                                 <p className="text-gray-400 text-sm line-clamp-3">
                                     {project.desc}
                                 </p>
                                 
                                 <div className="flex flex-wrap gap-2 mt-auto pt-4">
                                    {project.languages && project.languages.map((language, idx) => (
                                        <span
                                            key={`${language}-${idx}`}
                                            className="text-xs text-gray-500 font-mono"
                                        >
                                            #{language}
                                        </span>
                                    ))}
                                 </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Projects

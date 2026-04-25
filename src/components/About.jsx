import { Mail, MapPin, Phone, Download } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import aboutImage from "@/img/aboutme.svg"
import { Button } from "@/components/ui/button"
import { getProfile } from "../services/strapi"
import { PROFILE } from '../constants/profile'

const About = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        getProfile().then(setProfile);
    }, []);

    // Fallback or loading state could be here, but we'll render partial if null for now or rely on initial state if I set one.
    // getProfile returns default profile if fails, so profile should be populated quickly.
  
  return (
    <section id='about' className="py-20 w-full bg-secondary/5">
         <div className="container mx-auto px-4">
             <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Image Section (Left) */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl transform translate-x-4 translate-y-4"></div>
                        <img 
                            src={aboutImage} 
                            alt={profile?.name || PROFILE.name} 
                            className="relative z-10 w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                        />
                    </div>
                </div>

                {/* Content Section (Right) */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                    <h5 className="text-primary font-bold tracking-wider uppercase">About Me</h5>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Designing Solutions, <br />
                        <span className="text-gray-400">Delivering Results.</span>
                    </h2>
                    
                    <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                        {profile?.about || PROFILE.about}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                            <MapPin className="text-primary h-5 w-5" />
                            <div className="text-left">
                                <p className="text-xs text-muted-foreground uppercase">Location</p>
                                <p className="text-sm font-medium">{profile?.location || PROFILE.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                             <Phone className="text-primary h-5 w-5" />
                             <div className="text-left">
                                 <p className="text-xs text-muted-foreground uppercase">Phone</p>
                                 <p className="text-sm font-medium">{profile?.phone || PROFILE.phone}</p>
                             </div>
                        </div>
                         <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 sm:col-span-2">
                             <Mail className="text-primary h-5 w-5" />
                             <div className="text-left">
                                 <p className="text-xs text-muted-foreground uppercase">Email</p>
                                 <a href={`mailto:${profile?.email}`} className="text-sm font-medium hover:text-primary transition-colors">
                                     {profile?.email || PROFILE.email}
                                 </a>
                             </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button className="bg-primary text-black hover:bg-primary/90 rounded-full px-8 py-6 font-bold uppercase tracking-wide">
                            <Download className="mr-2 h-4 w-4" /> Download CV
                        </Button>
                    </div>
                </div>
             </div>
         </div>
    </section>
  )
}

export default About
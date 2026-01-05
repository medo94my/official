import React, { useRef, useEffect } from "react"
import { Eye, ArrowRight } from "lucide-react"
import ave from "/src/img/Group.svg"
import gsap from "gsap"
import { TextPlugin } from "gsap/TextPlugin"
import { Button } from "@/components/ui/button"
import StatsBar from "./StatsBar"

gsap.registerPlugin(TextPlugin)

export const Hero = () => {
    const occupation = useRef(null)

    useEffect(() => {
        const words = ["Code Trainer", "Web Manager", "Web Developer"]
        let tl = gsap.timeline({ repeat: -1 })

        words.forEach((word) => {
            tl.to(occupation.current, { duration: 1, text: word, ease: "none" })
              .to(occupation.current, { duration: 0.5, opacity: 1 }) // wait
              .to(occupation.current, { duration: 1, text: "", ease: "none" })
        })

        return () => {
           tl.kill();
        }
    }, [])

    return (
        <section className="relative w-full min-h-screen flex flex-col pt-20" id='home'>
            <div className="container mx-auto px-4 flex-grow flex flex-col md:flex-row items-center">
                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center items-start z-10 py-10">
                    <h2 className="text-xl md:text-2xl font-medium mb-4 text-gray-400">Hi, I'm</h2>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter text-white mb-2">
                        AHMED
                    </h1>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter text-primary mb-6">
                        TAWFIK
                    </h1>
                    
                    <div className="h-8 mb-8">
                        <span ref={occupation} className="text-xl md:text-3xl text-gray-300 font-mono"></span>
                    </div>

                    <p className="text-gray-400 max-w-lg text-lg mb-10 leading-relaxed">
                        Designing and developing premium web experiences with a focus on aesthetics and performance.
                    </p>

                    <div className="flex gap-4">
                        <Button size="lg" className="bg-primary text-black hover:bg-primary/90 rounded-full px-8 uppercase font-bold tracking-widest" asChild>
                            <a href="#projects">
                                My Work
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 rounded-full px-8 uppercase font-bold tracking-widest" asChild>
                            <a href="#contact">
                                Contact Me <ArrowRight className="ml-2 w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="flex-1 h-full w-full flex items-center justify-center relative">
                    {/* Decorative Circle/Glow */}
                    <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                    
                    <img 
                        src={ave} 
                        alt="Ahmed Tawfik" 
                        className="w-full max-w-md md:max-w-lg object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                    />
                </div>
            </div>

            {/* Stats Bar */}
            <StatsBar />
        </section>
    )
}

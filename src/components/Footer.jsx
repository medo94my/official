import * as React from 'react';
import { Github, Linkedin, Twitter, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-black pt-16 pb-8">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                
                {/* Brand / Logo */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wider">Brand</h2>
                    <p className="text-sm font-medium leading-relaxed max-w-xs">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.
                    </p>
                </div>

                {/* Useful Links */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold uppercase">Useful Link</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li><a href="#about" className="hover:underline">About Us</a></li>
                        <li><a href="#services" className="hover:underline">Careers</a></li>
                        <li><a href="#projects" className="hover:underline">News & Articles</a></li>
                        <li><a href="#contact" className="hover:underline">Notice</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold uppercase">Support</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li><a href="#" className="hover:underline">Help Center</a></li>
                        <li><a href="#" className="hover:underline">Terms of Use</a></li>
                        <li><a href="#" className="hover:underline">FAQ</a></li>
                        <li><a href="#" className="hover:underline">Community</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold uppercase">Contact Info</h3>
                    <ul className="space-y-3 text-sm font-medium">
                        <li className="flex items-center gap-2">
                            <Phone className="h-4 w-4" /> +60 111 188 4535
                        </li>
                        <li className="flex items-center gap-2">
                             <Mail className="h-4 w-4" /> medoroyalrma@gmail.com
                        </li>
                        <li className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1" /> 
                            <span>
                                4th Floor, Name City Name,<br/>
                                State, Country 12345
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-medium uppercase text-black/70">
                    © Copyright {new Date().getFullYear()} All Rights Reserved by Tawfik
                </p>
                <div className="flex gap-4">
                    <a href="https://github.com/medo94my" target="_blank" rel="noreferrer" className="p-2 bg-black/5 rounded-full hover:bg-black hover:text-white transition-colors">
                        <Github className="h-4 w-4" />
                    </a>
                    <a href="https://linkedin.com/in/medo94my" target="_blank" rel="noreferrer" className="p-2 bg-black/5 rounded-full hover:bg-black hover:text-white transition-colors">
                        <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="https://twitter.com/medo94my" target="_blank" rel="noreferrer" className="p-2 bg-black/5 rounded-full hover:bg-black hover:text-white transition-colors">
                        <Twitter className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
  );
}
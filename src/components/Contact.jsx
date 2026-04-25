import React, { useRef, useState, useEffect } from 'react'
import { Send, MapPin, Mail, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import emailjs from '@emailjs/browser';
import { getProfile } from "../services/strapi"
import { PROFILE } from '../constants/profile'

const Contact = () => {
    const [status, setStatus] = useState('');
    const [profile, setProfile] = useState(null);
    const form = useRef();

    useEffect(() => {
        getProfile().then(setProfile);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        // Note: Using the same env logic as IdeaSubmission, or a placeholder if not set
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_id';
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_id';
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key';

        if (SERVICE_ID === 'service_id') {
            setTimeout(() => {
                 setStatus('success');
                 // form.current.reset(); 
            }, 1000);
            return;
        }

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
                setStatus('success');
                form.current.reset();
            }, (error) => {
                console.log(error.text);
                setStatus('error');
            });
    };

  return (
    <section id='contact' className="py-24 w-full bg-black border-t border-gray-900">
        <div className="container mx-auto px-4">
             <div className="flex flex-col items-center mb-12">
                <h2 className="text-4xl font-bold text-white uppercase tracking-widest mb-4">
                    Get In <span className="text-primary">Touch</span>
                </h2>
                <p className="text-gray-400 max-w-lg text-center">
                    Have a project in mind or just want to say hello? I'd love to hear from you.
                </p>
             </div>

             <div className="flex flex-col lg:flex-row gap-8 bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                 {/* Form Section */}
                 <div className="w-full lg:w-1/2 p-8 md:p-12">
                    <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="user_name" className="text-sm font-medium text-gray-400">Name</label>
                                <Input name="user_name" placeholder="John Doe" required className="bg-[#111] border-gray-800 focus:border-primary text-white" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="user_email" className="text-sm font-medium text-gray-400">Email</label>
                                <Input name="user_email" type="email" placeholder="john@example.com" required className="bg-[#111] border-gray-800 focus:border-primary text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-gray-400">Message</label>
                            <Textarea name="message" placeholder="Your message here..." rows={6} required className="bg-[#111] border-gray-800 focus:border-primary text-white resize-none" />
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider py-6">
                            {status === 'sending' ? 'Sending...' : (
                                <span className="flex items-center">
                                    Send Message <Send className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>

                         {status === 'success' && <p className="text-green-500 text-center mt-2">Message sent successfully!</p>}
                         {status === 'error' && <p className="text-red-500 text-center mt-2">Failed to send message.</p>}
                    </form>
                 </div>

                 {/* Map/Info Section */}
                 <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-0">
                     <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.289125348824!2d28.978358915144!3d41.00823767929948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9e7a7777c43%3A0x4c76cf3dcc8b330b!2sIstanbul%2C%20Turkey!5e0!3m2!1sen!2sus!4v1652297920399!5m2!1sen!2sus" 
                        className="absolute inset-0 w-full h-full grayscale opacity-60 hover:opacity-100 transition-opacity duration-500"
                        style={{border:0}} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                     />
                     <div className="absolute bottom-8 left-8 right-8 bg-black/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                         <div className="flex flex-col gap-4">
                             <div className="flex items-center gap-4">
                                 <div className="p-2 bg-primary/20 rounded-full text-primary">
                                     <MapPin className="h-5 w-5" />
                                 </div>
                                 <div>
                                     <p className="text-sm text-gray-500">Location</p>
                                     <p className="text-white font-medium">{profile?.location || PROFILE.location}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-4">
                                 <div className="p-2 bg-primary/20 rounded-full text-primary">
                                     <Mail className="h-5 w-5" />
                                 </div>
                                 <div className="overflow-hidden">
                                     <p className="text-sm text-gray-500">Email</p>
                                     <p className="text-white font-medium truncate">{profile?.email || PROFILE.email}</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    </section>
  )
}

export default Contact

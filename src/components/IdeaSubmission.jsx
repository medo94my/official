import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lightbulb } from 'lucide-react';
import emailjs from '@emailjs/browser';

const IdeaSubmission = () => {
    const [status, setStatus] = useState('');
    const [projectType, setProjectType] = useState('mobile');
    const form = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_IDEA_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

        if (SERVICE_ID === 'YOUR_SERVICE_ID' || !SERVICE_ID) {
             // Mock success for demonstration if not configured
            setTimeout(() => {
                setStatus('success');
                // form.current.reset(); // Optional reset
            }, 1000);
            return;
        }

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then((result) => {
                setStatus('success');
                form.current.reset();
            }, (error) => {
                console.error(error.text);
                setStatus('error');
            });
    };

    return (
        <div className="py-20 bg-[#1a1a1a] text-white" id="services-form">
            <div className="max-w-3xl mx-auto px-4">
                <h3 className="text-3xl font-bold text-center mb-2 text-yellow-400">
                    From Idea to Production
                </h3>
                <p className="text-center text-[#ccc] mb-10 text-lg">
                    Have a brilliant app idea? Let's build it together.
                </p>

                <form ref={form} onSubmit={handleSubmit} className="mt-8">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                name="user_name"
                                placeholder="Your Name"
                                required
                                className="bg-white text-black border-none"
                            />
                            <Input
                                name="user_email"
                                placeholder="Email Address"
                                type="email"
                                required
                                className="bg-white text-black border-none"
                            />
                        </div>

                        {/* Hidden input to pass value to emailjs */}
                        <input type="hidden" name="project_type" value={projectType} />
                        
                        <Select 
                            value={projectType} 
                            onValueChange={setProjectType}
                        >
                            <SelectTrigger className="w-full bg-white text-black border-none h-10">
                                <SelectValue placeholder="Project Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="web">Web Application</SelectItem>
                                <SelectItem value="mobile">Mobile App</SelectItem>
                                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="space-y-1">
                            <Textarea
                                name="message"
                                placeholder="Describe your idea"
                                rows={6}
                                required
                                className="bg-white text-black border-none"
                            />
                            <p className="text-xs text-[#aaa] pl-1">Tell me about the core features and the problem it solves.</p>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="bg-yellow-400 text-black hover:bg-yellow-500 hover:scale-[1.02] transition-transform w-full md:w-auto text-lg py-6"
                        >
                            <Lightbulb className="mr-2 h-5 w-5" /> Submit Your Idea
                        </Button>
                    </div>
                    
                    {status === 'sending' && <div className="mt-4 p-3 bg-blue-900/50 text-blue-200 border border-blue-800 rounded">Sending...</div>}
                    {status === 'success' && (
                        <div className="mt-6 p-4 bg-green-900/50 text-green-200 border border-green-800 rounded">
                            Idea submitted! I'll review it and get back to you shortly.
                        </div>
                    )}
                     {status === 'error' && <div className="mt-4 p-3 bg-red-900/50 text-red-200 border border-red-800 rounded">Failed to submit. Please try again.</div>}
                </form>
            </div>
        </div>
    );
};

export default IdeaSubmission;

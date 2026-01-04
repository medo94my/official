import React, { useRef, useState } from 'react';
import { Box, Container, TextField, Button, Typography, Stack, MenuItem, Alert } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';
import emailjs from '@emailjs/browser';

const IdeaSubmission = () => {
    const [status, setStatus] = useState('');
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
        <Box sx={{ py: 10, bgcolor: '#1a1a1a', color: 'white' }} id="services-form">
            <Container maxWidth="md">
                <Typography variant="h3" align="center" gutterBottom fontWeight="bold" sx={{ color: 'gold' }}>
                    From Idea to Production
                </Typography>
                <Typography variant="h6" align="center" paragraph sx={{ color: '#ccc' }}>
                    Have a brilliant app idea? Let's build it together.
                </Typography>

                <Box component="form" ref={form} onSubmit={handleSubmit} sx={{ mt: 5 }}>
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                name="user_name"
                                label="Your Name"
                                variant="filled"
                                fullWidth
                                required
                                sx={{ bgcolor: 'white', borderRadius: 1 }}
                            />
                            <TextField
                                name="user_email"
                                label="Email Address"
                                type="email"
                                variant="filled"
                                fullWidth
                                required
                                sx={{ bgcolor: 'white', borderRadius: 1 }}
                            />
                        </Stack>

                        <TextField
                            name="project_type"
                            label="Project Type"
                            select
                            defaultValue="mobile"
                            variant="filled"
                            fullWidth
                            sx={{ bgcolor: 'white', borderRadius: 1 }}
                        >
                            <MenuItem value="web">Web Application</MenuItem>
                            <MenuItem value="mobile">Mobile App</MenuItem>
                            <MenuItem value="ecommerce">E-Commerce</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                            name="message"
                            label="Describe your idea"
                            multiline
                            rows={6}
                            variant="filled"
                            fullWidth
                            required
                            helperText="Tell me about the core features and the problem it solves."
                            sx={{ bgcolor: 'white', borderRadius: 1, '& .MuiFormHelperText-root': { color: '#aaa' } }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<Lightbulb />}
                            sx={{
                                bgcolor: 'gold',
                                color: 'black',
                                py: 1.5,
                                fontSize: '1.1rem',
                                '&:hover': { bgcolor: '#ffd700', transform: 'scale(1.02)' },
                                transition: 'transform 0.2s'
                            }}
                        >
                            Submit Your Idea
                        </Button>
                    </Stack>
                    {status === 'sending' && <Alert severity="info" sx={{ mt: 2 }}>Sending...</Alert>}
                    {status === 'success' && (
                        <Alert severity="success" sx={{ mt: 3 }}>
                            Idea submitted! I'll review it and get back to you shortly.
                        </Alert>
                    )}
                     {status === 'error' && <Alert severity="error" sx={{ mt: 2 }}>Failed to submit. Please try again.</Alert>}
                </Box>
            </Container>
        </Box>
    );
};

export default IdeaSubmission;

import React, { useRef, useState } from 'react';
import { Box, Container, TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { Send } from '@mui/icons-material';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending');

    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

    if (SERVICE_ID === 'YOUR_SERVICE_ID' || !SERVICE_ID) {
        // Mock behavior for demo/unconfigured state
        setTimeout(() => {
            setStatus('success');
            form.current.reset();
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
    <Box sx={{ py: 10, backgroundColor: '#f5f5f5' }} id="contact">
      <Container maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Contact Me
        </Typography>
        <Typography variant="body1" align="center" paragraph color="textSecondary">
            Have a project in mind or just want to say hi?
        </Typography>

        <Box component="form" ref={form} onSubmit={sendEmail} sx={{ mt: 4, bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1 }}>
          <Stack spacing={3}>
            <TextField label="Name" name="user_name" variant="outlined" fullWidth required />
            <TextField label="Email" name="user_email" type="email" variant="outlined" fullWidth required />
            <TextField label="Message" name="message" multiline rows={4} variant="outlined" fullWidth required />

            <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<Send />}
                sx={{
                    bgcolor: 'gold',
                    color: 'black',
                    '&:hover': { bgcolor: '#ffd700' }
                }}
            >
              Send Message
            </Button>
          </Stack>
            {status === 'sending' && <Alert severity="info" sx={{ mt: 2 }}>Sending...</Alert>}
            {status === 'success' && <Alert severity="success" sx={{ mt: 2 }}>Message sent successfully!</Alert>}
            {status === 'error' && <Alert severity="error" sx={{ mt: 2 }}>Failed to send message. Please try again.</Alert>}
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;

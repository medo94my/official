import React from 'react';
import { Fab } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';

const WhatsAppButton = () => {
  // Replace with your phone number
  const phoneNumber = "1234567890";
  const message = "Hello! I saw your portfolio and would like to discuss a project.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Fab
      color="success"
      aria-label="whatsapp"
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 1000,
        bgcolor: '#25D366',
        '&:hover': {
          bgcolor: '#128C7E'
        }
      }}
    >
      <WhatsApp />
    </Fab>
  );
};

export default WhatsAppButton;

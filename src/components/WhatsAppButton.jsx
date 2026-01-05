import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  // Replace with your phone number
  const phoneNumber = "1234567890";
  const message = "Hello! I saw your portfolio and would like to discuss a project.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      aria-label="whatsapp"
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-[1000] bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-colors flex items-center justify-center h-14 w-14"
    >
      <MessageCircle className="h-8 w-8" />
    </button>
  );
};

export default WhatsAppButton;

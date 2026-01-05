import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
vi.stubGlobal('import.meta', {
    env: { 
        VITE_STRAPI_URL: 'http://localhost:1337',
        VITE_EMAILJS_SERVICE_ID: 'mock_service',
        VITE_EMAILJS_TEMPLATE_ID: 'mock_template',
        VITE_EMAILJS_PUBLIC_KEY: 'mock_key'
    } 
});

import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "/src": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'profile.ahmetinnovationhub.com',
      'strapi.ahmetinnovationhub.com',
      'localhost',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    globals: true,
    alias: [
      { find: "@/img/aboutme.svg", replacement: path.resolve(__dirname, './src/tests/__mocks__/fileMock.js') },
      { find: "@/img/logo.png", replacement: path.resolve(__dirname, './src/tests/__mocks__/fileMock.js') },
      {
        find: /.*\.(css|less|sass|scss|png|jpg|gif|ttf|woff|woff2|svg)(\?.*)?$/,
        replacement: path.resolve(__dirname, './src/tests/__mocks__/fileMock.js'),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ]
  }
})
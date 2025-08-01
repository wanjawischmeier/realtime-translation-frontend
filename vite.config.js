import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { config } from 'dotenv';

config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true // only for development
    /*
    allowedHosts: [
      "dynamic-freely-chigger.ngrok-free.app"
    ]
    */
  }
})

// npm dev run
// ngrok http --url=dynamic-freely-chigger.ngrok-free.app 5173

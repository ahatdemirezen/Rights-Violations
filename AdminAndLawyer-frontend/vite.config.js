import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(    
  )],
  server: {
    host: '0.0.0.0', // Tüm IP adreslerinden erişime izin ver
    port: 4006, // Vite'nin dinleyeceği port
    strictPort: true, // Eğer bu port doluysa hata ver
    https: false, // HTTPS kullanmıyorsanız false yapın
    // HMR ayarlarına gerek yok, çünkü WebSocket kullanmıyorsunuz
  }
})

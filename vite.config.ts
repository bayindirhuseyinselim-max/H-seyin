import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Bu satır, dosyaların her türlü adreste (alt klasör dahil) çalışmasını sağlar
})

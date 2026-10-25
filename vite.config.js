import { defineConfig } from 'vite'

// Vercel sets VERCEL=1 during its builds → serve from the site root.
// Everywhere else (GitHub Pages) the site lives under /HBD-Web/.
export default defineConfig({
  base: process.env.VERCEL ? '/' : '/HBD-Web/',
})

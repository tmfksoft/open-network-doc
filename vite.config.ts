import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project-page GitHub Pages URLs are served from a subpath
  // (https://tmfksoft.github.io/open-network-doc/), so the build needs every
  // asset URL rewritten accordingly. GITHUB_ACTIONS is set automatically by
  // GitHub's runners, so local builds/dev still default to root.
  base: process.env.GITHUB_ACTIONS ? '/open-network-doc/' : '/',
})

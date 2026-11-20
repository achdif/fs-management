// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Resolve .web.ts/.web.tsx duluan — dipakai packages/auth & shared
      // untuk varian web (cookie auth, localStorage stub, dll).
      extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.jsx', '.mjs'],
    },
    server: {
      proxy: {
        // Backend-agnostic: Go (backend-go) & Rust (crates/server)
        // sama-sama serve /api/v1/* di port 8080.
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  },
});

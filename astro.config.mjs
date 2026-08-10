import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  // SSR: o frontmatter das páginas roda a cada request (no servidor Node),
  // com acesso ao cookie do navegador. Necessário para a autenticação.
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],

  vite: {
    build: {
      cssMinify: true,
    },
    server: {
      // Em dev, /api é proxyado para o backend .NET. Assim o frontend e a API
      // compartilham a mesma origem (localhost:4321) e o cookie de auth funciona
      // sem problema de SameSite cross-origin.
      proxy: {
        '/api': {
          target: 'http://localhost:5104',
          changeOrigin: true,
        },
        // Imagens de comprovação servidas pela API em /uploads/...
        '/uploads': {
          target: 'http://localhost:5104',
          changeOrigin: true,
        },
      },
    },
  },
});

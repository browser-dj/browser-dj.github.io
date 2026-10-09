import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://browser-dj.github.io',
  integrations: [
    react(),
    tailwind()
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'pt', 'de'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});

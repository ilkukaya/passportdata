import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
export default defineConfig({
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr', 'es', 'ar', 'pt', 'fr'],
    routing: {
      prefixDefaultLocale: true
    }
  },
  output: 'static',
  site: 'https://passportdata.netlify.app',
  build: {
    format: 'directory'
  }
});

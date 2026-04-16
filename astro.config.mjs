import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  integrations: [tailwind(), sitemap()],
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

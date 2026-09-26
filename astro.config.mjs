import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const site = (process.env.SITE_URL || 'https://passportdata.netlify.app').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: { build: { chunkSizeWarningLimit: 2000 } },
});
